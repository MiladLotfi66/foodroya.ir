import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;

  // اگر کاربر لاگین کرده باشد و به صفحات لاگین یا ثبت‌نام برود، او را به صفحه اصلی هدایت کن
  if (
    token &&
    (pathname.includes("/signup") ||
      pathname.includes("/signin") ||
      pathname.includes("/OTPlogin") ||
      pathname.includes("/forgetPassword"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // اگر کاربر لاگین نکرده باشد و به صفحه مدیریت برود، او را به صفحه اصلی هدایت کن
  if (!token && pathname.startsWith("/panel")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // اجازه دسترسی به صفحات محافظت شده در صورتی که کاربر لاگین کرده باشد
  if (
    token ||
    pathname === "/signup" ||
    pathname === "/signin" ||
    pathname === "/OTPlogin" ||
    pathname === "/forgetPassword"
  ) {
    return NextResponse.next();
  }

  // پیش فرض به صفحه اصلی هدایت شود
  return NextResponse.redirect(new URL("/", req.url));
}

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/signup",
    "/signin",
    "/OTPlogin",
    "/forgetPassword",
    "/panel/:path*",
  ],
};
