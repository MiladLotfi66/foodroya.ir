"use server"
import { cookies } from "next/headers";
import Users from "@/models/Users";
import { verifyAccessToken } from "./auth"; // مسیر صحیح را وارد کنید

const AuthUser = async () => {
  try {
  } catch (error) {
    console.error("Database connection error -->", error);
    return null;
  }

  const tokenCookie = cookies().get("token");
  let user = null;

  if (!tokenCookie) {
    console.error("Token not found in cookies");
  } else {
    const token = tokenCookie.value;

    try {
      const tokenPayload = verifyAccessToken(token);
      if (tokenPayload) {
        const userFromDb = await Users.findOne({ phone: tokenPayload.phone });

        if (userFromDb) {
          user = {
            phone: userFromDb.phone,
            name: userFromDb.username,
            role:userFromDb.role,
            // ویژگی‌های دیگر که نیاز دارید
          };
        }
      }
    } catch (error) {
      console.error("verify access token error -->", error);
    }
  }

  return user;
};

export { AuthUser };
