import { NextResponse } from "next/server";
import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { hashPassword } from "@/utils/auth";

export async function POST(req, res) {
  if (req.method !== "POST") {
    return false;
  }
  try {
    await connectDB();

    const { email, password,username } = await req.json();
    console.log({ email, password,username  });

    if (!email.trim() || !password.trim() || !username.trim()) {
      return NextResponse.json(
        { error: "لطفا اطلاعات معتبر وارد کنید" },
        { status: 422 }
      );
    }

    const existingUser = await Users.findOne({ email });
    console.log(existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: "این حساب کاربری وجود دارد" },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await Users.create({
      email: email,
      password: hashedPassword,
      username: username,
      role:"user"
    });
    console.log(newUser);


    return NextResponse.json(
      { message: "حساب کاربری ایجاد شد" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "مشکلی در سرور رخ داده است" },
      {
        status: 500,
      }
    );
  }
}
