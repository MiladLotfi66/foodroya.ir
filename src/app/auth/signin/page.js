"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Usersvg from "@/module/svgs/Usersvg";
import Emailsvg from "@/module/svgs/Emailsvg";
import Locksvg from "@/module/svgs/Locksvg";
function page() {
  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
    <div className="container ">
      <div className="hidden">
        <Usersvg />
        <Emailsvg/>
      </div>
      <div className=" bg-white dark:bg-zinc-700   shadow-normal  rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] ">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-40">
          <div className="flex flex-col items-start gap-3">
            <h4>
              خوش آمدید به
              <span className="text-orange-300 font-MorabbaMedium">
                {" "}
                فود رویا
              </span>
            </h4>
            <h1 className="text-3xl font-MorabbaBold">ثبت نام </h1>
          </div>
          <div className="flex flex-col items-start gap-3">
            <h4>قبلا ثبت نام کرده اید؟</h4>
            <a className="text-orange-300 cursor-pointer font-MorabbaMedium">
              ورود{" "}
            </a>
          </div>
        </div>
        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
          }}
        >
          {({ values, handleChange }) => (
            <form className="login-form flex flex-col gap-4 p-2 md:p-5">
              <div className="flex items-center "> 
                <svg className="  w-5 h-5 ">
                  <Usersvg />
                </svg>
                <Field
                  className="inputStyle grow"
                  type="text"
                  name="username"
                  placeholder="نام کاربری"
                />
              </div>
              <div className="flex items-center "> 
                <svg className="  w-5 h-5 ">
                  <Emailsvg />
                </svg>
              <Field
                p-2
                className="inputStyle grow"
                type="email"
                name="email"
                placeholder="ایمیل"
              />
              </div>
              <div className="flex items-center "> 
                <svg className="  w-5 h-5 ">
                  <Locksvg />
                </svg>
              <Field
                className="inputStyle grow"
                type="password"
                name="password"
                placeholder="رمز عبور"
              />
              </div>
              <button className="w-28 h-11 md:w-36 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-5">
                ثبت نام
              </button>
            </form>
          )}
        </Formik>
      </div>
    </div>
    </div>
  );
}

export default page;
