import { NextResponse } from "next/server";
import { verifyAccessToken } from "./utils/auth";

export async function middleware(req) {
  console.log("middleware runed");
  console.log("cookies",req.cookies.getAll());

  console.log(req.cookies.has('token'));
  const token2=req.cookies.get('token')
  console.log("token2",token2);
  
    const tokenPayload = verifyAccessToken(token2);
  
  const { pathname } = req.nextUrl;


  if ((pathname.includes("/signup") || pathname.includes("/signin")) && tokenPayload) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!tokenPayload && (pathname !== "/signup" || pathname !== "/signin")) {
    return NextResponse.next();

  }
}

export { default } from "next-auth/middleware";
export const config = { matcher: ["/signup", "/signin"] };