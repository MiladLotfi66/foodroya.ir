"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/yupSchemas/signUpSchema";  
import { useState } from "react";
import Usersvg from "@/module/svgs/Usersvg";
import Emailsvg from "@/module/svgs/Emailsvg";
import Locksvg from "@/module/svgs/Locksvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import axios from 'axios';


function SignUp() {
  const router = useRouter();
  const [IsSubmit, SetIsSubmit] = useState(false);
  // *******************hook use form********************
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    SetIsSubmit(true);
  
    try {
      const response = await axios.post("/api/auth/signup", {
        username: data.name,
        email: data.email,
        password: data.password,
      });
  
      if (response.status === 201) {
        router.push("/signin");
      }
    } catch (error) {
      toast.error(error.response.data.error);
    }
  
    SetIsSubmit(false);
  };
  
  // *******************jsx********************
  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className="hidden">
          <Usersvg />
          <Emailsvg />
        </div>
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
              <h1 className="text-3xl font-MorabbaBold">ثبت نام </h1>
            </div>
            <div className="flex flex-col items-start gap-3">
              <h4>قبلا ثبت نام کرده اید؟</h4>
              <Link
                href="/signin"
                className="text-orange-300 cursor-pointer font-MorabbaMedium"
              >
                ورود{" "}
              </Link>
            </div>
          </div>

          {/* *******************main******************** */}

          <form
            onSubmit={handleSubmit(formsubmitting)}
            className="login-form flex flex-col gap-4 p-2 md:p-4 "
          >
            {/* *******************username******************** */}

            <div className="flex items-center ">
              <svg className="  w-5 h-5 ">
                <Usersvg />
              </svg>
              <input
                className="inputStyle grow  "
                type="text"
                name="name"
                autoComplete="name"
                placeholder="نام کاربری"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <div className="text-xs text-red-400">
                {errors.name.message}
              </div>
            )}
            {/* *******************email******************** */}
            <div className="flex items-center ">
              <svg className="  w-5 h-5 ">
                <Emailsvg />
              </svg>
              <input
                className="inputStyle grow"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="ایمیل یا تلفن همراه"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <div className="text-xs text-red-400">{errors.email.message}</div>
            )}
            {/* *******************password******************** */}
            <div className="flex items-center  ">
              <div className="min-w-5 w-5  ">
                <svg className="w-5 h-5">
                  <Locksvg />
                </svg>
              </div>
              <div className="flex justify-between gap-x-2  ">
                <input
                  className="text-zinc-700 max-w-[48%] w-[48%] m-2 dark:text-white rounded-lg text-base/4 md:text-lg/4 h-10 bg-gray-200 dark:bg-gray-600 p-2 font-DanaDemiBold placeholder:p-2 "
                  type="password"
                  name="password"
                  autoComplete="password"
                  placeholder="رمز عبور"
                  {...register("password")}
                />
                <input
                  className="text-zinc-700 max-w-[48%] w-[48%] m-2 dark:text-white rounded-lg text-base/4 md:text-lg/4 h-10 bg-gray-200 dark:bg-gray-600 p-2 font-DanaDemiBold placeholder:p-2 "
                  type="password"
                  name="rePassword"
                  autoComplete="password"

                  placeholder="تکرار رمز عبور"
                  {...register("rePassword")}
                />
              </div>
            </div>
            {errors.password && (
              <div className="text-xs text-red-400">
                {errors.password.message}
              </div>
            )}
            {errors.rePassword && (
              <div className="text-xs text-red-400">
                {errors.rePassword.message}
              </div>
            )}
            {/* *******************button**************************** */}
            <button
              type="submit"
              className={
                /* if issubmit is true class will be change */
                IsSubmit
                  ? "flexCenter gap-x-2 h-11  md:h-14 bg-gray-400 rounded-xl   text-white mt-4"
                  : "h-11  md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-4"
              }
              disabled={IsSubmit}
            >
              {IsSubmit ? "در حال ورود  " : "ورود"}
              {IsSubmit ? <HashLoader size={25} color="#fff" /> : ""}
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
export default SignUp;
