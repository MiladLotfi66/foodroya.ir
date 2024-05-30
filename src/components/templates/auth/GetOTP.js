"use client";
import { useForm } from "react-hook-form";
import Chatsvg from "@/module/svgs/ChatSVG";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import "@/styles/styles.css";
import { yupResolver } from "@hookform/resolvers/yup";
import OTPSchima from "@/utils/yupSchemas/OTPSchima";
import { useState } from "react";

function GetOTP() {
  const [isSubmit, setIsSubmit] = useState(false);

  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    formState: { errors },
   
  } = useForm({
    defaultValues: {
      OTP: "",
    },
    resolver: yupResolver(OTPSchima),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    setIsSubmit(true);

    setIsSubmit(false);
  };

  // *******************jsx********************

  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className=" bg-white dark:bg-zinc-700   shadow-normal  rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] ">
          {/* *******************header******************** */}

          <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
            <div className="flex flex-col items-start gap-2.5">
              <h4>
                خوش آمدید به
                <Link href="/" className="text-orange-300 font-MorabbaMedium">
                  {" "}
                  فود رویا
                </Link>
              </h4>
              <h1 className="text-2xl font-MorabbaBold">
                ورود با کد یکبار مصرف{" "}
              </h1>
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
            {/* *******************email******************** */}

            <div className="flex items-center ">
              <svg className="  w-5 h-5 ">
                <Chatsvg />
              </svg>
              <input
                className="inputStyle grow no-spinner"
                type="number"
                name="OTP"
                placeholder="کد ارسال شده را وارد کنید"
                {...register("OTP")}
              />
            </div>
            {errors.OTP && (
              <div className="text-xs text-red-400">{errors.OTP.message}</div>
            )}

            <div className="flex justify-between items-center  ">
              <Link
                className="text-orange-300 cursor-pointer font-MorabbaMedium"
                rel="nofollow"
                href="/forgetPassword"
              >
                {" "}
                فراموشی رمز عبور
              </Link>
              <Link
                className="text-orange-300 cursor-pointer font-MorabbaMedium"
                rel="nofollow"
                href="/signin"
              >
                {" "}
                ورود با رمز عبور
              </Link>
            </div>
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

export default GetOTP;
