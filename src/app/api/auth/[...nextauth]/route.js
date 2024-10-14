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
          name: user.name,
          userImage: user.userImage,
        };
      },
    }),
    // Provider for OTP
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
    
    
    // const otpRecord = await OTP.findOne({ phone, expTime: { $gt: currentTime } });
    if (!otpRecord) {
      throw new Error("کد یکبار مصرف را اشتباه وارد کرده‌اید");
    }
  
    const currentTime = new Date().getTime();
    

    if (otpRecord.useStep >= 5 && otpRecord.lastFailedAttempt && (currentTime - otpRecord.lastFailedAttempt < 10 * 60 * 1000)) {
      throw new Error("تعداد تلاش‌های شما به حداکثر رسیده است. لطفاً بعد از ۱۰ دقیقه دوباره سعی کنید.");
    }
    const recentOTP = await OTP.findOne({ phone, expTime: { $gt: currentTime } });

    if (recentOTP.otp !== p2e(otp)){

    
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

    return { id: user._id, phone: user.phone, name: user.name ,userImage: user.userImage };
  },
}),

  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.userImage= user.userImage;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.userImage= token.userImage
      return session;
    },
  },
};

export const handler = NextAuth(authOption);
export { handler as GET, handler as POST };