import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { NextResponse } from "next/server";
import { generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { verify } from "jsonwebtoken";

export async function POST(req) {
    try {
        // 1. چک کردن وجود رفرش‌توکن در کوکی‌های درخواست
        const cookies = req.headers.get('cookie');
        const refreshToken = cookies.split('; ').find(row => row.startsWith('refreshToken')).split('=')[1];

        if (!refreshToken) {
            return NextResponse.json({ error: "رفرش‌توکن یافت نشد" }, { status: 401 });
        }

        // 2. اتصال به دیتابیس
        await connectDB();

        // 3. پیدا کردن کاربر مرتبط با رفرش‌توکن
        const user = await Users.findOne({ refreshToken });

        if (!user) {
            return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 401 });
        }

        verify(refreshToken, process.env.REFRESHTOKENSECRET_KEY);

        // 4. ایجاد توکن‌های جدید
        const accessToken = generateAccessToken({ phone: user.phone });
        const newRefreshToken = generateRefreshToken({ phone: user.phone });

        // 5. به‌روزرسانی رفرش‌توکن در دیتابیس
        await Users.updateOne({ refreshToken }, { $set: { refreshToken: newRefreshToken } });

        // 6. ارسال توکن جدید به کاربر
        const response = NextResponse.json({ message: "اکسس توکن جدید ساخته شد" });

        response.cookies.set({
            name: "token",
            value: accessToken,
            httpOnly: true,
            path: "/",
        });

        response.cookies.set({
            name: "refreshToken",
            value: newRefreshToken,
            httpOnly: true,
            secure: true, // تنظیم secure برای ارسال اطمینان از اینکه کوکی تنها از طریق HTTPS ارسال می‌شود
            path: "/",
        });

        return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "خطا در تازه‌سازی توکن" }, { status: 500 });
    }
}
