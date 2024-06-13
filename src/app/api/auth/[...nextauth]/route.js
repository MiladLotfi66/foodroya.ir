import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/utils/connectToDB";
import Users from "@/models/Users";
import { verifyPassword } from "@/utils/auth";
import OTP from "@/models/OTP";
import { p2e } from "@/utils/ReplaceNumber";

export const authOption = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 // اعتبار توکن‌های JWT به مدت یک ساعت
  },
  providers: [
    // Provider for Phone and Password
    CredentialsProvider({
      id: "Username and Password",
      async authorize(credentials) {
        const { phone, password } = credentials;
        await connectDB();
        if (!phone || !password) {
          throw new Error("اطلاعات را به درستی وارد کنید");
        }
        const user = await Users.findOne({ phone });
        if (!user) throw new Error("لطفا ابتدا حساب کاربری ایجاد کنید");
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) throw new Error("ایمیل یا رمز عبور اشتباه است");
        return { 
          id: user._id,
          phone: user.phone,
          username: user.username,
        };
      },
    }),
    // Provider for OTP
    CredentialsProvider({
      id: "OTPProvider",
      async authorize(credentials) {
        const { phone, otp } = credentials;
        console.log(phone, otp);
        await connectDB();
        if (!phone || !otp) {
          throw new Error("شماره تماس و کد یکبار مصرف الزامی است");
        }
        const otpRecord = await OTP.findOne({ phone });
        const currentTime = new Date().getTime();
        if (!otpRecord) {
          throw new Error("کد یکبار مصرف را اشتباه وارد کرده‌اید");
        }
        if (otpRecord.useStep >= 5 && otpRecord.lastFailedAttempt && (currentTime - otpRecord.lastFailedAttempt < 10 * 60 * 1000)) {
          throw new Error("تعداد تلاش‌های شما به حداکثر رسیده است. لطفاً بعد از ۱۰ دقیقه دوباره سعی کنید.");
        }
        const recentOTP = await OTP.findOne({ phone, expTime: { $gt: currentTime } });
        if (recentOTP.otp !== p2e(otp)) {
          recentOTP.useStep += 1;
          recentOTP.lastFailedAttempt = currentTime; // Update the time of the last failed attempt
          await recentOTP.save();
          throw new Error("کد یکبار مصرف وارد شده اشتباه است");
        }
        if (currentTime > recentOTP.expTime) {
          throw new Error("اعتبار کد یکبار مصرف به اتمام رسیده است");
        }
        recentOTP.useStep = 0;
        recentOTP.lastFailedAttempt = null;
        await recentOTP.save();
        const user = await Users.findOne({ phone });
        if (!user) {
          throw new Error("کاربر یافت نشد");
        }
        return { id: user._id, phone: user.phone, username: user.username };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = account?.access_token;
        token.refreshToken = account?.refresh_token;
      }
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      await revokeRefreshToken(token);
    }
  },
};

export const handler = NextAuth(authOption);
export { handler as GET, handler as POST };
