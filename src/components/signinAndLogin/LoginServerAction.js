"use server"
import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { cookies } from 'next/headers';
import loginSchima from "@/utils/yupSchemas/loginSchima";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "@/utils/auth"; // فرض بر این است که تابع verifyPassword را دارید

async function LoginServerAction(formData) {
    try {
        // اتصال به دیتابیس
        await connectDB();
        
        // دریافت فیلدهای فرم
        const { phone, password } = formData;
        
        // اعتبارسنجی داده‌های ورودی
        await loginSchima.validate({ phone, password });
        
        // پیدا کردن کاربر در دیتابیس
        const user = await Users.findOne({ phone });
        if (!user) {
          return { error: "شماره تلفن یا پسورد نادرست است", status: 401 };
        }
        
        // بررسی صحت پسورد
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
          return { error: "شماره تلفن یا پسورد نادرست است", status: 401 };
        }
        
        // ایجاد توکن‌های دسترسی و تازه‌سازی
        const accessToken = generateAccessToken({ phone });
        const refreshToken = generateRefreshToken({ phone });
        
        // به‌روزرسانی توکن در دیتابیس
        await Users.findOneAndUpdate({ phone }, { $set: { refreshToken } });

        // ست کردن کوکی‌ها
        cookies().set({
            name: "token",
            value: accessToken,
            httpOnly: true,
            path: "/",
        });
        
        return { message: "ورود موفقیت‌آمیز بود", status: 200 };
    } catch (error) {
        if (error.name === 'ValidationError') {
            return { error: error.errors[0], status: 400 };
        }
        console.log(error);
        return { error: "خطا در ورود به سیستم", status: 500 };
    }
}

export default LoginServerAction;
