// // middleware/auth.js
// import { NextResponse } from 'next/server';

// export function middleware(req) {
//     const { cookies } = req;
//     const jwt = cookies.get('jwt'); // فرض کنیم توکن JWT در کوکی ذخیره شده

//     // اگر توکن وجود ندارد، کاربر را به صفحه اصلی هدایت کنید
//     if (!jwt) {
//         return NextResponse.redirect(new URL('/', req.url));
//     }

//     // اگر توکن وجود دارد، اجازه دسترسی به صفحه مدیریت را بدهید
//     return NextResponse.next();
// }


// middlewares/auth.js
import jwt from 'jsonwebtoken';

const secret = process.env.NEXTAUTH_SECRET; // از همان کلید مخفی که در تنظیمات NextAuth استفاده می‌کنید

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // اطلاعات کاربر را به درخواست اضافه کنید
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  console.log("authHeader------------------------------>",authHeader);
  console.log("req-------------------------------->",req);
};
