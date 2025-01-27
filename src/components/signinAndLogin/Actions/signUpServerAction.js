"use server";

import shoppingCart from "@/templates/shoppingCart/shoppingCart";
import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { hashPassword } from "@/utils/auth";
import mongoose from "mongoose";

export async function signUpServerAction(formData, session) {
  try {
    const { phone, password, username, name } = formData;

    // بررسی خالی نبودن فیلدها
    if (!phone.trim() || !password.trim() || !username.trim() || !name.trim()) {
      throw { message: "لطفا اطلاعات معتبر وارد کنید", status: 409 };
    }

    // بررسی یکتایی شماره تلفن
    const existingUser = await Users.findOne({ phone }, null, { session });
    if (existingUser) {
      throw { message: "حساب کاربری با این شماره از قبل وجود دارد", status: 409 };
    }

    // بررسی یکتایی نام کاربری
    const existingUsername = await Users.findOne({ userUniqName: username }, null, { session });
    if (existingUsername) {
      throw { message: "این نام کاربری قبلاً استفاده شده است", status: 409 };
    }

    // هش کردن رمز عبور
    const hashedPassword = await hashPassword(password);

    // ایجاد کاربر جدید با استفاده از سشن
    const user = await Users.create([{
      userUniqName: username, 
      phone: phone,
      password: hashedPassword,
      name: name,
      email: undefined, // اگر ایمیل وجود ندارد، undefined قرار می‌دهیم

    }], { session });

    return user[0]; // چون create با آرایه کار می‌کند
  } catch (error) {
    console.log(error);

    throw error; // اجازه دهید خطاها توسط فراخوان مدیریت شوند
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
export const completeSignUp = async (userData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ایجاد کاربر جدید
    const user = await signUpServerAction(userData, session);

    // ایجاد سبد خرید جدید و اختصاص به کاربر
    await AddNewShopingCartServerAction(user._id, session);

    // تایید تراکنش
    await session.commitTransaction();
    session.endSession();
    
    return { message: "اطلاعات با موفقیت ثبت شد", status: 201 };
  } catch (error) {
    // لغو تراکنش در صورت خطا
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error in completeSignUp:", error);
    
    // بازگرداندن خطا با پیام مناسب
    return { error: error.message || "خطا در ثبت نام. لطفاً دوباره تلاش کنید.", status: error.status || 500 };
  }
};

export async function AddNewShopingCartServerAction(userId, session) {
    
  const existingShopingCart = await shoppingCart.findOne({ user:userId }).lean();
  if (existingShopingCart) {
    return { status: 400, message: "سبد خرید از قبل موجود است." };
  }
    try {
      const ShoppingCart = await shoppingCart.create([{
        user: userId,
        items: [], // یا هر فیلد دیگری که نیاز دارید
      }], { session });
  
      return ShoppingCart[0];
    } catch (error) {
      throw error;
    }
  }
  

