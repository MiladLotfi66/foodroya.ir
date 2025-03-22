"use client";
import { useForm } from "react-hook-form";
import Locksvg from "@/module/svgs/Locksvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import loginSchima from "@/utils/yupSchemas/loginSchima"; 
import PhoneSvg from "@/module/svgs/phoneSvg1";
import {signIn} from 'next-auth/react';
import { useState } from "react";


function SignIn() {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // افزودن استیت برای نمایش پسورد




  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      phone: "",
      password: "",
     
    },
    resolver: yupResolver(loginSchima),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    setIsSubmit(true);
  
    /////////////////////////////////////
      const res = await signIn("Username and Password", {
        redirect: false,
        phone:data.phone,
        password:data.password, 
       
      });
      if (res.status !==200) {
        toast.error(res.error)
      } else {
        router.push("/");
      }
 
    ////////////////////////////////////

    setIsSubmit(false);
  };

  // *******************jsx********************

  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.webp')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className="hidden">
          <PhoneSvg/>
        </div>
        <div className=" bg-white dark:bg-zinc-700   shadow-normal  rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] ">
          {/* *******************header******************** */}

          <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
            <div className="flex flex-col items-start gap-2.5">
              <h4>
                خوش آمدید به
                <Link href="/" className="text-orange-300 font-MorabbaMedium">
                  {" "}
                نیبرو
                                </Link>
              </h4>
              <h1 className="text-3xl font-MorabbaBold">ورود با رمز عبور </h1>
            </div>
            <div className="flex flex-col items-start gap-3">
              <h4> ثبت نام نکرده اید؟</h4>
              <Link
                href="/signup"
                className="text-orange-300 cursor-pointer font-MorabbaMedium"
              >
                ثبت نام{" "}
              </Link>
            </div>
          </div>

          {/* *******************main******************** */}

          <form
            onSubmit={handleSubmit(formsubmitting)}
            className="login-form flex flex-col gap-4 p-2 md:p-4"
          >
            {/* *******************phone******************** */}

            <div className="flex items-center ">
              <svg className="  w-5 h-5 ">
                <PhoneSvg />
              </svg>
              <input
                className="inputStyle grow"
                type="phone"
                name="phone"
                placeholder="تلفن همراه"
                {...register("phone")}
              />
            </div>
            {errors.phone && <div className="text-xs text-red-400">{errors.phone.message}</div>}

            {/* *******************password******************** */}

            <div className="flex items-center relative">
              <div className="min-w-5 w-5">
                <svg className="w-5 h-5">
                  <Locksvg />
                </svg>
              </div>
              <input
                className="inputStyle grow"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="رمز عبور"
                {...register("password")}
              />
              <button 
                type="button" 
                className="absolute left-2 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex justify-between items-center  ">
            <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/forgetPassword"> فراموشی رمز عبور</Link >
            {/* <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/OTPlogin"> ورود با کد یکبار مصرف</Link > */}
            </div>
            {errors.password && <div className="text-xs text-red-400">{errors.password.message}</div>}
            {/* *******************button**************************** */}

            <button
              type="submit"
              className={
                /* if issubmit is true class will be change */
                isSubmit
                  ? "flexCenter gap-x-2 h-11  md:h-14 bg-gray-400 rounded-xl   text-white mt-4"
                  : "h-11  md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-4"
              }
              disabled={isSubmit}
            >
              {isSubmit ? "در حال ورود  " : "ورود"}
              {isSubmit ? <HashLoader size={25} color="#fff" /> : ""}
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default SignIn;