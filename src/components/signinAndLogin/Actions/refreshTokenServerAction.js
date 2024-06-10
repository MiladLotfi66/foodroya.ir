"use server"
import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { cookies } from 'next/headers';
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { verify } from "jsonwebtoken";

async function RefreshTokenServerAction(req, res) {
    try {
        // 1. چک کردن وجود رفرش‌توکن در کوکی‌های درخواست
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: "رفرش‌توکن یافت نشد" });
        }

        // 2. اتصال به دیتابیس
        await connectDB();

        // 3. پیدا کردن کاربر مرتبط با رفرش‌توکن
        const user = await Users.findOne({ refreshToken });

        if (!user) {
            return res.status(401).json({ error: "کاربر یافت نشد" });
        }

        verify(refreshToken,process.env.REFRESHTOKENSECRET_KEY)

        // 4. ایجاد توکن‌های جدید
        const accessToken = generateAccessToken({ phone: user.phone });
        const newRefreshToken = generateRefreshToken({ phone: user.phone });

        // 5. به‌روزرسانی رفرش‌توکن در دیتابیس
        await Users.updateOne({ refreshToken }, { $set: { refreshToken: newRefreshToken } });

        // 6. ارسال توکن جدید به کاربر
        cookies().set({
            name: "token",
            value: accessToken,
            httpOnly: true,
            path: "/",
        });

        cookies().set({
            name: "refreshToken",
            value: newRefreshToken,
            httpOnly: true,
            secure: true, // تنظیم secure برای ارسال اطمینان از اینکه کوکی تنها از طریق HTTPS ارسال می‌شود
            path: "/",
        });

        // 7. ارسال پاسخ به درخواست کاربر
        return res.status(200).json({ message:"اکسس توکن جدید ساخته شد" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "خطا در تازه‌سازی توکن" });
    }
}

export default RefreshTokenServerAction;
