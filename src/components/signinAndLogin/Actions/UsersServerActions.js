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

export {
  GetAllUsers,
};
