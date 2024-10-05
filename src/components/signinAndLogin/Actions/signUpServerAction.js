"use server";

import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { hashPassword } from "@/utils/auth";

export async function signUpServerAction(formData) {

  try {
    await connectDB(); // اطمینان از اتصال به دیتابیس

    const { phone, password, username, name } = formData;

    // بررسی خالی نبودن فیلدها
    if (!phone.trim() || !password.trim() || !username.trim() || !name.trim()) {
      return { error: "لطفا اطلاعات معتبر وارد کنید", status: 409 };
    }

    // بررسی یکتایی شماره تلفن
    const existingUser = await Users.findOne({ phone });
    if (existingUser) {
      return { error: "حساب کاربری با این شماره از قبل وجود دارد", status: 409 };
    }

    // بررسی یکتایی نام کاربری
    const existingUsername = await Users.findOne({ userUniqName: username });
    if (existingUsername) {
      
      return { error: "این نام کاربری قبلاً استفاده شده است", status: 409 };
    }

    // هش کردن رمز عبور
    const hashedPassword = await hashPassword(password);

    // ایجاد کاربر جدید
    const user = await Users.create({
      userUniqName: username, // اطمینان از اینکه username مقداردهی شده است
      phone: phone,
      password: hashedPassword,
      name: name,
    });

    return { message: "اطلاعات با موفقیت ثبت شد", status: 201 };
  } catch (error) {
    console.log(error);

    // بررسی دقیق نوع خطا
    if (error.code === 11000) {
      // خطای کلید تکراری
      return { error: "یک کاربر با این مقدار قبلاً ثبت شده است", status: 409 };
    }

    return { error: "خطا در ثبت نام. لطفاً دوباره تلاش کنید.", status: 500 };
  }
}

export async function checkUsernameUnique(username) {
  if (!username || username.trim().length < 3) {
    return { exists: false };
  }

  try {
    await connectDB();
    const existingUser = await Users.findOne({ userUniqName: username.trim() });
    return { exists: !!existingUser };
  } catch (error) {
    console.error('خطا در بررسی یکتایی نام کاربری:', error);
    // در صورت خطا، فرض کنید نام کاربری در دسترس نیست
    return { exists: true };
  }
}
