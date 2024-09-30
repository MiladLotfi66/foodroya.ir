"use server";
import connectDB from "@/utils/connectToDB";
import User from "@/models/Users"; // بررسی اینکه درست ایمپورت شده باشد
import { authenticateUser } from "./RolesPermissionActions";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // ایمپورت کتابخانه‌ی Sharp
import { simplifyFollowers } from "./ShopServerActions";
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

export async function GetAllUsers() {
  try {
    await connectDB(); // متصل شدن به دیتابیس

    // اعتبارسنجی کاربر
    const userData = await authenticateUser();
    if (!userData || userData.error) {
      throw new Error(userData.error || "User data not found");
    }

    // یافتن تمامی کاربران
    const users = await User.find().lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainUsers = users?.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    return { message: "Users retrieved successfully", status: 200, data: plainUsers };
  } catch (error) {
    console.error("Error in GetAllUsers action:", error.message);
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

// export async function UpdateUserProfile(profileData) {
//   console.log(profileData);
  
//   try {
//     // اتصال به پایگاه داده
//     await connectDB();

//     // احراز هویت کاربر
//     const userData = await authenticateUser();
//     if (!userData || userData.error) {
//       throw new Error(userData.error || "اطلاعات کاربر یافت نشد");
//     }

//     const userId = userData.id;

//     // پیدا کردن کاربر در پایگاه داده
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new Error("کاربر یافت نشد");
//     }

//     // اگر تصویر جدید ارسال شده است، آن را پردازش کنید
//     if (profileData.userImage) {
//       const imagePath = await saveBase64Image(profileData.userImage, userId);
//       profileData.userImage = imagePath;

//       // (اختیاری) حذف تصویر قبلی از سرور، اگر نیاز دارید
//       if (user.userImage) {
//         const oldImagePath = path.join(process.cwd(), 'public', user.userImage);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }
//     }

//     // به‌روزرسانی فیلدهای پروفایل با داده‌های جدید
//     // توجه: فقط فیلدهای مجاز باید به‌روزرسانی شوند
//     const allowedUpdates = ["username", "userImage", "email", "userUniqName", "phone", "bio", "address"];
//     allowedUpdates.forEach((field) => {
//       if (profileData[field] !== undefined) {
//         user[field] = profileData[field];
//       }
//     });

//     // در صورت نیاز به به‌روزرسانی پسورد:
//     // if (profileData.password) {
//     //   user.password = await hashPassword(profileData.password); // فرض بر این است که تابع hashPassword وجود دارد
//     // }
//     console.log(user);

//     // ذخیره تغییرات در پایگاه داده
//     await user.save();

//     // تبدیل داده‌ها به فرمت قابل سریالایز
//     const plainUser = {
//       _id: user._id.toString(),
//       username: user.username,
//       userImage: user.userImage,
//       email: user.email,
//       userUniqName: user.userUniqName,
//       phone: user.phone,
//       bio: user.bio,
//       address: user.address,
//       createdAt: user.createdAt.toISOString(),
//       updatedAt: user.updatedAt.toISOString(),
//     };

//     return { message: "پروفایل با موفقیت به‌روزرسانی شد", status: 200, data: plainUser };
//   } catch (error) {
//     console.error("خطا در به‌روزرسانی پروفایل کاربر:", error.message);
//     return { error: error.message, status: 500 };
//   }
// }
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
    // اضافه کردن dateOfBirth به لیست فیلدهای مجاز
    const allowedUpdates = [
      "username",
      "userImage",
      "email",
      "userUniqName",
      "phone",
      "bio",
      "address",
      "dateOfBirth", // اضافه شده
    ];

    allowedUpdates.forEach((field) => {
      if (profileData[field] !== undefined) {
        if (field === "dateOfBirth") {
          // تبدیل رشته تاریخ به شیء Date
          user[field] = profileData[field] ? new Date(profileData[field]) : undefined;
        } else {
          user[field] = profileData[field];
        }
      }
    });

    // در صورت نیاز به به‌روزرسانی پسورد:
    // if (profileData.password) {
    //   user.password = await hashPassword(profileData.password); // فرض بر این است که تابع hashPassword وجود دارد
    // }

    console.log("Updated user data:", user);

    // ذخیره تغییرات در پایگاه داده
    await user.save();

    // تبدیل داده‌ها به فرمت قابل سریالایز
  

    return { message: "پروفایل با موفقیت به‌روزرسانی شد", status: 200,  };
  } catch (error) {
    console.error("خطا در به‌روزرسانی پروفایل کاربر:", error.message);
    return { error: error.message, status: 500 };
  }
}
        
    
