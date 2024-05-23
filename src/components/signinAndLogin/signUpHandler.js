"use server";

import Users from "@/models/Users";
import connectDB from "@/utils/connectToDB";
import { hashPassword } from "@/utils/auth";

async function addNewUserHandler(formData) {


  try {
    connectDB();
    const { phone, password, username } = formData;

    if (!phone.trim() || !password.trim() || !username.trim()) {
      return  { error: "لطفا اطلاعات معتبر وارد کنید" , status:409}

    }

    const existingUser = await Users.findOne({ phone });

    if (existingUser) {
      return  { error: "حساب کاربری با این شماره از قبل وجود دارد" , status:409}
    }

    const hashedPassword = await hashPassword(password);

    const user = Users.create({
      username: formData.username,
      phone: formData.phone,
      password: hashedPassword,
    });
    return  { Message: "اطلاعات با موفقیت ثبت شد" , status:201}

  } catch (error) {

    console.log(error);
  }
}

export default addNewUserHandler;
