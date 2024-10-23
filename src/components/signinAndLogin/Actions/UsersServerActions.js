"use server";
import connectDB from "@/utils/connectToDB";
import User from "@/models/Users"; // بررسی اینکه درست ایمپورت شده باشد
import { authenticateUser } from "./RolesPermissionActions";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // ایمپورت کتابخانه‌ی Sharp
import bcrypt from 'bcryptjs';

export async function saveBase64Image(base64String, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      let data;

      // بررسی وجود پیشوند
      const matches = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        data = matches[2];
      } else {
        // اگر پیشوند وجود ندارد، فرض می‌کنیم که تنها داده‌ی base64 ارسال شده است
        data = base64String;
      }

      const buffer = Buffer.from(data, 'base64');

      // تبدیل تصویر به فرمت WebP با استفاده از Sharp
      const webpBuffer = await sharp(buffer)
        .webp()
        .toBuffer();

      // ایجاد مسیر ذخیره‌سازی
      const uploadDir = path.join(process.cwd(), 'public', 'Uploads', 'userImages');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // ایجاد نام منحصربه‌فرد برای فایل با پسوند .webp
      const fileName = `${userId}-${Date.now()}.webp`;
      const filePath = path.join(uploadDir, fileName);

      // ذخیره‌سازی فایل WebP
      fs.writeFile(filePath, webpBuffer, (err) => {
        if (err) {
          return reject(err);
        }
        // برگرداندن مسیر نسبی تصویر
        const relativePath = `/Uploads/userImages/${fileName}`;
        resolve(relativePath);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function GetAllUsersIdNameImageUniqName() {
  try {
    await connectDB(); // متصل شدن به دیتابیس
    // یافتن تمامی کاربران
    const users = await User.find().select('-password -dateOfBirth -role -following -twoFactorEnabled -isVIP -securityQuestion -phoneNumberUsages -__v -refreshToken').lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainUsers = users?.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));
    
    return { message: "Users retrieved successfully", status: 200, data: plainUsers };
  } catch (error) {
    console.error("Error in GetAllUsersIdNameImageUniqName action:", error.message);
    return { error: error.message, status: 500 };
  }
}

export async function GetUserbyUserId(userId) {
  try {
    // اتصال به پایگاه داده
    await connectDB();

    // پیدا کردن کاربر و دریافت لیست شناسه‌های فروشگاه‌های فالو شده
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error("User not found");
    }

    // تبدیل شناسه‌ها و مقادیر پیچیده به فرمت‌های قابل سریالایز
    const plainUser = {
      ...user,
      _id: user._id.toString(),
      following: user.following?.map((shop) => shop._id.toString()),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // برگرداندن اطلاعات کاربر
    return { user: plainUser, status: 200 };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message, status: 500 };
  }
}

export async function GetUserData() {
  try {

    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      throw new Error("User not found");
    }


    // اطمینان از اتصال به پایگاه داده
    await connectDB();

    // تبدیل userData.id به ObjectId با بررسی خطا
  

    const user = await User.findById(userData.id)
      .select('-password -createdAt -updatedAt -role -__v') // حذف آرایه‌های ناخواسته و فیلد password
      .lean(); // تبدیل به شیء ساده جاوااسکریپت

    if (!user) {
      console.log("User data could not be retrieved");
      throw new Error("User data could not be retrieved");
    }


    // محاسبه تعداد following و followers به صورت جداگانه
    const followingCount = Array.isArray(user.following) ? user.following.length : 0;
    // حذف فیلد following از شیء کاربر قبل از ارسال به کلاینت
    delete user.following;

    // تبدیل داده‌ها به فرمت قابل سریالایز
    const plainUser = {
      ...user,
      _id: user._id.toString(),
      // createdAt: user.createdAt.toISOString(),
      // updatedAt: user.updatedAt.toISOString(),
      followingCount,
    };


    // return plainUser;
    return { user:plainUser, status: 200 };

  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message, status: 500 };
  }
}

export async function UpdateUserProfile(profileData) {
  console.log("Received profile data:", profileData);
  
  try {
    // اتصال به پایگاه داده
    await connectDB();

    // احراز هویت کاربر
    const userData = await authenticateUser();
    if (!userData || userData.error) {
      throw new Error(userData.error || "اطلاعات کاربر یافت نشد");
    }

    const userId = userData.id;

    // پیدا کردن کاربر در پایگاه داده
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("کاربر یافت نشد");
    }

    // اگر تصویر جدید ارسال شده است، آن را پردازش کنید
    if (profileData.userImage) {
      const imagePath = await saveBase64Image(profileData.userImage, userId);
      profileData.userImage = imagePath;

      // (اختیاری) حذف تصویر قبلی از سرور، اگر نیاز دارید
      if (user.userImage) {
        const oldImagePath = path.join(process.cwd(), 'public', user.userImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // به‌روزرسانی فیلدهای پروفایل با داده‌های جدید
    const allowedUpdates = [
      "name",
      "userImage",
      "email",
      "userUniqName",
      "phone",
      "bio",
      "address",
      "dateOfBirth",
      "twoFactorEnabled",
      "securityQuestion",
    ];

    allowedUpdates.forEach((field) => {
      if (profileData[field] !== undefined) {
        if (field === "dateOfBirth") {
          const date = new Date(profileData[field]);
          if (isNaN(date.getTime())) {
            throw new Error("تاریخ تولد نامعتبر است.");
          }
          if (date >= new Date()) {
            throw new Error("تاریخ تولد باید در گذشته باشد.");
          }
          user[field] = date;
        } else if (field === "securityQuestion") {
          const { question, answer } = profileData.securityQuestion;
          if (!question || !answer) {
            throw new Error("سوال و پاسخ امنیتی نمی‌توانند خالی باشند.");
          }

          // اطمینان حاصل کنید که securityQuestion تعریف شده است
          if (!user.securityQuestion) {
            user.securityQuestion = {}; // مقداردهی اولیه به عنوان شیء خالی
          }

          user.securityQuestion.question = question;
          user.securityQuestion.answer = answer; // هش شدن در مدل
        } else {
          user[field] = profileData[field];
        }
      }
    });

    // ذخیره تغییرات در پایگاه داده
    await user.save();

    return { message: "پروفایل با موفقیت به‌روزرسانی شد", status: 200 };
  } catch (error) {
    console.error("خطا در به‌روزرسانی پروفایل کاربر:", error.message);
    return { error: error.message, status: 500 };
  }
}

export async function VerifySecurityAnswer( providedAnswer) {
  try {
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      throw new Error("User not found");
    }

    await connectDB();

    const user = await User.findById(userData.id).select('securityQuestion').lean();
    if (!user || !user.securityQuestion) {
      throw new Error("سوال امنیتی یافت نشد.");
    }

    const isMatch = await bcrypt.compare(providedAnswer, user.securityQuestion.answer);
    if (!isMatch) {
      throw new Error("پاسخ امنیتی صحیح نیست.");
    }

    return { message: "پاسخ صحیح است.", status: 200 };
  } catch (error) {
    console.error("خطا در بررسی پاسخ سوال امنیتی:", error.message);
    return { error: error.message, status: 500 };
  }
}

export async function RecoverPassword( providedAnswer, newPassword) {
  try {
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      throw new Error("User not found");
    }
    // ابتدا پاسخ سوال امنیتی را بررسی می‌کنیم
    const verificationResult = await VerifySecurityAnswer(userData.id, providedAnswer);
    if (verificationResult.status !== 200) {
      throw new Error(verificationResult.error || "بررسی پاسخ موفقیت‌آمیز نبود.");
    }

    // اتصال به پایگاه داده
    await connectDB();

    // پیدا کردن کاربر
    const user = await User.findById(userData.id);
    if (!user) {
      throw new Error("کاربر یافت نشد.");
    }

    // به‌روزرسانی رمز عبور
    user.password = newPassword; // هش شدن در مدل
    await user.save();

    return { message: "رمز عبور با موفقیت بازیابی شد.", status: 200 };
  } catch (error) {
    console.error("خطا در بازیابی رمز عبور:", error.message);
    return { error: error.message, status: 500 };
  }
}

export async function ChangeSecurityQuestion(newQuestion, newAnswer) {
  console.log("dddddd", newQuestion, newAnswer);
  
  try {
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      throw new Error("User not found");
    }
    await connectDB();

    const user = await User.findById(userData.id);
    if (!user) {
      throw new Error("کاربر یافت نشد.");
    }

    if (!newQuestion || !newAnswer) {
      throw new Error("سوال و پاسخ جدید نمی‌توانند خالی باشند.");
    }

    // اطمینان از وجود شی securityQuestion
    if (!user.securityQuestion) {
      user.securityQuestion = {}; // اینجا شی securityQuestion را ایجاد می‌کنیم
    }

    // تنظیم سوال و پاسخ جدید
    user.securityQuestion.question = newQuestion;
    user.securityQuestion.answer = newAnswer; // هش شدن در middleware قبل از ذخیره

    await user.save();

    return { message: "سوال امنیتی با موفقیت تغییر کرد.", status: 200 };
  } catch (error) {
    console.error("خطا در تغییر سوال امنیتی:", error.message);
    return { error: error.message, status: 500 };
  }
}

