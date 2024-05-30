
"use client";

import { useForm } from "react-hook-form";
import PhoneSvg from "@/module/svgs/phoneSvg1";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import "@/styles/styles.css"
import { yupResolver } from "@hookform/resolvers/yup";
import phoneSchema from "@/utils/yupSchemas/phoneSchima";
import { SendSMSServerAction } from "src/ServerActions/SendSMSServerAction";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { redirect } from "next/navigation";
// import { useRouter } from "next/router";
// import { redirect } from "next/dist/server/api-utils";


function ForgetPassword() {
  const [isSubmit, setIsSubmit] = useState(false);
  const router = useRouter();


  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      phone: "",
    },
    resolver: yupResolver(phoneSchema),

  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    setIsSubmit(true)
    const res = await SendSMSServerAction(data)
    if (res.status===200) {
      toast.success(res.message);

      router.push("/OTPlogin");

    }else{
      toast.error(res.error);
    }

    setIsSubmit(false)


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
              <h1 className="text-2xl font-MorabbaBold">فراموشی رمز عبور </h1>
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
                className="inputStyle grow no-spinner"
                type="number"
                name="phone"
                placeholder="شماره تلفن همراه خود را وارد کنید"
                {...register("phone")}
              />
            </div>
            {errors.phone && <div className="text-xs text-red-400">{errors.phone.message}</div>}

            <div className="flex justify-between items-center  ">
            <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/OTPlogin"> دریافت کد یکبار مصرف</Link >
            <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/signin"> ورود با رمز عبور</Link >
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

export default ForgetPassword;