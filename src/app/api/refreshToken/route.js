import { NextResponse } from 'next/server';
import Users from '@/models/Users';
import connectDB from '@/utils/connectToDB';
import { generateAccessToken, generateRefreshToken } from '@/utils/auth';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

export async function POST(req) {
    try {
        const cookies = cookie.parse(req.headers.get('cookie') || '');
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            return NextResponse.json({ error: 'رفرش‌توکن یافت نشد' }, { status: 401 });
        }

        await connectDB();

        const user = await Users.findOne({ refreshToken });

        if (!user) {
            return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 401 });
        }

        verify(refreshToken, process.env.REFRESHTOKENSECRET_KEY);

        const accessToken = generateAccessToken({ phone: user.phone });
        const newRefreshToken = generateRefreshToken({ phone: user.phone });

        await Users.updateOne({ refreshToken }, { $set: { refreshToken: newRefreshToken } });

        const response = NextResponse.json({ message: 'اکسس توکن جدید ساخته شد' });

        response.headers.set('Set-Cookie', [
            cookie.serialize('token', accessToken, {
                httpOnly: true,
                path: '/',
            }),
            cookie.serialize('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                path: '/',
            }),
        ].join(', '));

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'خطا در تازه‌سازی توکن' }, { status: 500 });
    }
}
