"use server";
import connectDB from "@/utils/connectToDB";
import User from "@/models/Users"; // بررسی اینکه درست ایمپورت شده باشد
import { authenticateUser } from "../../templates/Shop/ShopServerActions";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // ایمپورت کتابخانه‌ی Sharp
import bcrypt from 'bcryptjs';
import { processAndSaveImage } from "@/utils/ImageUploader";




export async function UpdateUserProfile(profileData) {
  try {
    // اتصال به پایگاه داده
    await connectDB();

    // احراز هویت کاربر
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    const userId = userData.id;

    // پیدا کردن کاربر در پایگاه داده
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("کاربر یافت نشد");
    }

    // اگر تصویر جدید ارسال شده است، آن را پردازش و ذخیره کنید
    if (profileData.userImage && profileData.userImage !== user.userImage) {
      const base64String = profileData.userImage;

      // بررسی اینکه آیا تصویر یک URL است یا داده base64
      if (base64String.startsWith('http')) {
        // اگر تصویر یک URL است، آن را بدون تغییر نگه دارید
        // این حالت زمانی اتفاق می‌افتد که کاربر تصویر را تغییر نداده است
        profileData.userImage = base64String;
      } else {
        // بررسی و استخراج داده‌های base64
        const matches = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const data = matches[2];
          const buffer = Buffer.from(data, 'base64');

          // ایجاد یک شیء مشابه فایل برای ارسال به تابع processAndSaveImage
          const mockImage = {
            type: mimeType,
            size: buffer.length,
            async arrayBuffer() {
              return buffer;
            }
          };

          const uploadDir = 'Uploads/userImages';

          try {
            // آپلود تصویر به S3 و دریافت URL جدید
            const imageURL = await processAndSaveImage(mockImage, user.userImage, uploadDir);
            profileData.userImage = imageURL;
          } catch (uploadError) {
            console.error("خطا در آپلود تصویر:", uploadError);
            throw new Error("خطا در آپلود تصویر: " + uploadError.message);
          }
        } else if (base64String === "") {
          // اگر تصویر خالی است، از تصویر قبلی استفاده کنید
          profileData.userImage = user.userImage;
        } else {
          console.error("فرمت تصویر نامعتبر:", base64String.substring(0, 100) + "...");
          throw new Error("فرمت تصویر ارسال شده نامعتبر است.");
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

