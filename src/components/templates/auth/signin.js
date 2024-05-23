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
import { useEffect } from "react";



function SignIn() {
  const router = useRouter();


  useEffect(() => {
    setValue("password","",{shouldValidate:true})
    setValue("phone","",{shouldValidate:true})
    }, []); 
  // *******************hook use form********************

  const {
    register,
    // control,
    // reset,
    handleSubmit,
    formState: { errors },isSubmitting,setValue
  } = useForm({
    mode: "all",
    defaultValues: {
      phone: "",
      password: "",
     
    },
    resolver: yupResolver(loginSchima),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    // SetIsSubmit(true);
    

    // const res = await signIn("credentials", {
    //   redirect: false,
    //   email: data.email,
    //   password: data.password,
    //   callbackUrl: "/",
    // });
    // if (res?.ok) router.push("/");
    // else toast.error("ایمیل یا رمز عبور اشتباه است");
    // SetIsSubmit(false);
  };

  // *******************jsx********************

  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className="hidden">
          <phonesvg1 />
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
            <div className="flex justify-between items-center  ">
            <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/forgetPassword"> فراموشی رمز عبور</Link >
            <Link className="text-orange-300 cursor-pointer font-MorabbaMedium" rel="nofollow" href="/OTPlogin"> ورود با کد یکبار مصرف</Link >
            </div>
            {errors.password && <div className="text-xs text-red-400">{errors.password.message}</div>}
            {/* *******************button**************************** */}

            <button
              type="submit"
              className={
                /* if issubmit is true class will be change */
                isSubmitting
                  ? "flexCenter gap-x-2 h-11  md:h-14 bg-gray-400 rounded-xl   text-white mt-4"
                  : "h-11  md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-4"
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? "در حال ورود  " : "ورود"}
              {isSubmitting ? <HashLoader size={25} color="#fff" /> : ""}
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default SignIn;