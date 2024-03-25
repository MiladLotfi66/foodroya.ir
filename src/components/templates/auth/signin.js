"use client";
import { useForm } from "react-hook-form";
import Emailsvg from "@/module/svgs/Emailsvg";
import Locksvg from "@/module/svgs/Locksvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/YupSchema";

function SignIn() {
  const router = useRouter();
  const [IsSubmit, SetIsSubmit] = useState(false);
 
  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    SetIsSubmit(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: "/",
    });
    if (res?.ok) router.push("/");
    else toast.error("ایمیل یا رمز عبور اشتباه است");
    SetIsSubmit(false);
  };

  // *******************jsx********************

  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className="hidden">
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
              <h1 className="text-3xl font-MorabbaBold">ورود </h1>
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
                <Emailsvg />
              </svg>
              <input
                className="inputStyle grow"
                type="email"
                name="email"
                placeholder="ایمیل یا تلفن همراه"
                {...register("email")}
              />
            </div>
            {errors.email && <div className="text-xs text-red-400">{errors.email.message}</div>}

            {/* *******************password******************** */}

            <div className="flex items-center  ">
              <div className="min-w-5 w-5  ">
                <svg className="w-5 h-5">
                  <Locksvg />
                </svg>
              </div>
              <input
                className="inputStyle grow"
                type="password"
                name="password"
                placeholder="رمز عبور"
                {...register("password")}
              />
            </div>
            {errors.password && <div className="text-xs text-red-400">{errors.password.message}</div>}
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

export default SignIn;