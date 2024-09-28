"use server";
import connectDB from "@/utils/connectToDB";
import User from "@/models/Users"; // بررسی اینکه درست ایمپورت شده باشد
import { authenticateUser } from "./RolesPermissionActions";

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
      // احراز هویت کاربر از سمت سرور
      userData = await authenticateUser();
      
    } catch {
      // اگر کاربر احراز هویت نشد
      userData = null;
    }

    if (!userData) {
      throw new Error("User not found");
    }

    // دریافت اطلاعات کاربر بر اساس ID او
    const user = await GetUserbyUserId(userData.id);

    // برگرداندن اطلاعات کاربر
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message, status: 500 };
  }
}

export async function UpdateUserProfile(profileData) {
  console.log( profileData);
  
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

    // به‌روزرسانی فیلدهای پروفایل با داده‌های جدید
    // توجه: فقط فیلدهای مجاز باید به‌روزرسانی شوند
    const allowedUpdates = ["username", "userImage", "email", "userUniqName", "phone", "bio", "address"];
    allowedUpdates.forEach((field) => {
      if (profileData[field] !== undefined) {
        user[field] = profileData[field];
      }
    });

    // در صورت نیاز به به‌روزرسانی پسورد:
    // if (profileData.password) {
    //   user.password = await hashPassword(profileData.password); // فرض بر این است که تابع hashPassword وجود دارد
    // }
console.log(user);

    // ذخیره تغییرات در پایگاه داده
    await user.save();

    // تبدیل داده‌ها به فرمت قابل سریالایز
    const plainUser = {
      _id: user._id.toString(),
      username: user.username,
      userImage: user.userImage,
      email: user.email,
      userUniqName: user.userUniqName,
      phone: user.phone,
      bio: user.bio,
      address: user.address,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return { message: "پروفایل با موفقیت به‌روزرسانی شد", status: 200, data: plainUser };
  } catch (error) {
    console.error("خطا در به‌روزرسانی پروفایل کاربر:", error.message);
    return { error: error.message, status: 500 };
  }
}


