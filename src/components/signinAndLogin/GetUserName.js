"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/yupSchemas/signUpSchema";
import Usersvg from "@/module/svgs/Usersvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { useState } from "react";

function GetUserName() {
  const router = useRouter();
  const [step, SetStep] = useState("GetUser");

  // *******************hook use form********************
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      password: "",
      email: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    console.log(data.name);
  };

  // فراخوانی تابع handleSubmit برای ورودی name
  const handleNameBlur = () => {
    handleSubmit((data) => {
      console.log("blur");
    })();
  };

  // *******************jsx********************
  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className="hidden">
          <Usersvg />
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
          <div className="flex justify-center gap-x-2">
            <span
              onClick={() => {
                SetStep("GetUser");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetUser" ? "h-1.5" : "h-2 "
              } ${errors.name ? "bg-orange-300" : "bg-green-300"}`}
            ></span>
<span
              onClick={() => {
                SetStep("GetPass");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetPass" ? "h-1.5" : "h-2 "
              } ${errors.password ? "bg-orange-300" : "bg-green-300"}`}
            ></span>


<span
              onClick={() => {
                SetStep("GetEmail");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetEmail" ? "h-1.5" : "h-2 "
              } ${errors.email ? "bg-orange-300" : "bg-green-300"}`}
            ></span>

          
      
          </div>
          {/* *******************main******************** */}

          <form
            onSubmit={handleSubmit(formsubmitting)}
            className="login-form flex flex-col gap-4 p-2 md:p-4 "
          >
            {/* *******************username******************** */}

            <div className={step !== "GetUser" ? "hidden" : ""}>
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
                  onBlur={handleNameBlur} // اضافه کردن onBlur و فراخوانی تابع مربوطه
                />
              </div>
              {/* در این قسمت چک میکند که اگر فیلد نام کاربری خالی باشد خطا را نمایش میدهد و کلید را غیر */}

              {errors.name && (
                <div className="text-xs text-red-400">
                  {errors.name.message}
                </div>
              )}
              {/* *******************button**************************** */}
              <button
                onClick={() => {
                  SetStep("GetPass");
                }}
                disabled={errors.name}
                // type="submit"
                className={
                  /* if issubmit is true class will be change */
                  errors.name
                    ? "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-gray-400  "
                    : "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-teal-600 hover:bg-teal-700   "
                }
              >
                بعدی
              </button>
            </div>

            {/* *******************password******************** */}

            <div className={step !== "GetPass" ? "hidden" : ""}>
              <div className="flex items-center ">
                <svg className="  w-5 h-5 ">
                  <Usersvg />
                </svg>
                <input
                  className="inputStyle grow  "
                  type="password"
                  name="password"
                  autoComplete="password"
                  placeholder="رمز عبور"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <div className="text-xs text-red-400">
                  {errors.password.message}
                </div>
              )}
              {/* *******************button**************************** */}
              <button
                onClick={() => {
                  SetStep("GetEmail");
                }}
                disabled={errors.password}
                // type="submit"
                className={
                  /* if issubmit is true class will be change */
                  errors.password
                    ? "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-gray-400  "
                    : "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-teal-600 hover:bg-teal-700   "
                }
              >
                بعدی
              </button>
            </div>

            {/* *******************email******************** */}

            <div className={step !== "GetEmail" ? "hidden" : ""}>
              <div className="flex items-center ">
                <svg className="w-5 h-5 ">
                  <Usersvg />
                </svg>
                <input
                  className="inputStyle grow  "
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="ایمیل"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <div className="text-xs text-red-400">
                  {errors.email.message}
                </div>
              )}
              {/* *******************button**************************** */}
              <button
                onClick={() => {
                  SetStep("GetUser");
                }}
                // type="submit"
                disabled={errors.email}
                className={
                  /* if issubmit is true class will be change */
                  errors.email
                    ? "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-gray-400  "
                    : "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-teal-600 hover:bg-teal-700   "
                }
              >
                بعدی
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
export default GetUserName;