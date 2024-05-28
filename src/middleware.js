import { NextResponse } from "next/server";

export async function middleware(req) {
  const token2 = req.cookies.get("token");
  const token = token2?.value;
  const { pathname } = req.nextUrl;
  if (
    (pathname.includes("/signup") ||
      pathname.includes("/signin") ||
      pathname.includes("/OTPlogin") ||
      pathname.includes("/forgetPassword")) &&
    token
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (
    !token &&
    (pathname !== "/signup" ||
      pathname !== "/signin" ||
      pathname !== "/OTPlogin" ||
      pathname !== "/forgetPassword")
  ) {
    return NextResponse.next();
  }
}
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/signup", "/signin", "/OTPlogin", "/forgetPassword"],
};
