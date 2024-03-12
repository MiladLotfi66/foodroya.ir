import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
export async function middleware(req, res) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.includes("/signup")||pathname.includes("/signin")|| token) {
    return NextResponse.next();
  }
  if (!token && pathname !== "/signin") {
        return NextResponse.redirect(new URL("/signin", req.url));  }
  }
 
export { default } from "next-auth/middleware"
export const config = { matcher: ["/signup", "/signin"] }

