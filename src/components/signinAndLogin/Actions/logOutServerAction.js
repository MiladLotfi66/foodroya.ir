"use server"
import { cookies } from "next/headers";

async function logOutServerAction() {
 cookies().delete("token")
 return  { message: "user logout success" , status:200}
}

export default logOutServerAction
