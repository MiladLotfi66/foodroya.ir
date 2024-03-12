import nextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/utils/connectToDB";
import Users from "@/models/Users";
import { verifyPassword } from "@/utils/auth";

export const authOption = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // این کد برای چک کردن کریدنشیال است 
        console.log("credential -->",credentials); 
        //////////////////////////////////////
        const { email, password } = credentials;
        try {
          await connectDB();
        } catch (err) {
          console.log(err);
          throw new Error("مشکلی در سرور رخ داده است");
        }
        if (!email || !password) {
          throw new Error("اطلاعات را به درستی وارد کنید");
        }
        const user = await Users.findOne({ email });
        if (!user) throw new Error("لطفا ابتدا حساب کاربری ایجاد کنید");
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) throw new Error("ایمیل یا رمز عبور اشتباه است");
        return {name: user.username , email  };

      },
    }),
  ],
};
export const handler=nextAuth(authOption);
export { handler as GET, handler as POST };