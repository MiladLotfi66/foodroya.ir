import NextAuth from "next-auth";
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
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { phone, password } = credentials;
        try {
          await connectDB();
        } catch (err) {
          console.log(err);
          throw new Error("مشکلی در سرور رخ داده است");
        }
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
          // image: user.image
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        // token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      // session.user.image = token.image;
      return session;
    },
  },
};

export const handler=NextAuth(authOption);
export { handler as GET, handler as POST };
