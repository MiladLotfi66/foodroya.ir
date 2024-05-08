"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/yupSchemas/signUpSchema";
import Usersvg from "@/module/svgs/Usersvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import Phonesvg from "@/module/svgs/phoneSvg1";
import Locksvg from "@/module/svgs/Locksvg";


function GetUserName() {
  const router = useRouter();
  const [step, SetStep] = useState("GetUser");

  // *******************hook use form********************

  useEffect(() => {
    handleSubmit(formsubmitting)();
  }, []); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    // shouldFocusError: true, // اضافه کردن shouldFocusError

    defaultValues: {
      name: "",
      password: "",
      Phone: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  // *******************submit ********************

  const formsubmitting = async (data) => {
    console.log(data.Phone);
  };


  // *******************jsx********************
  return (
    <div className="absolute bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full ">
      <div className="container ">
        <div className=" bg-white dark:bg-zinc-700   shadow-normal  rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] ">
          {/* *******************header******************** */}

          <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36 mb-6">
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

          {/* *******************step line******************** */}
          <div className="flex justify-center gap-x-2">
            <span
              onClick={() => {
                SetStep("GetUser");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetUser" ? "h-1.5" : "h-2 "
              } ${errors.name ? "bg-orange-300" : "bg-teal-500"}`}
            ></span>

            <span
              onClick={() => {
                SetStep("GetPass");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetPass" ? "h-1.5" : "h-2 "
              } ${errors.password ? "bg-orange-300" : "bg-teal-500"}`}
            ></span>

            <span
              onClick={() => {
                SetStep("GetPhone");
              }}
              className={`block w-[100px]  rounded ${
                step !== "GetPhone" ? "h-1.5" : "h-2 "
              } ${errors.Phone ? "bg-orange-300" : "bg-teal-500"}`}
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
                  className="inputStyle grow "
                  
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="نام کاربری"
                  {...register("name")}
                  // all={handleNameBlur} // اضافه کردن onBlur و فراخوانی تابع مربوطه
                />
              </div>
              {/* در این قسمت چک میکند که اگر فیلد نام کاربری خالی باشد خطا را نمایش میدهد و کلید را غیر */}

              {errors.name && (
                <div className="text-xs container text-red-400 mt-5">
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
                  <Locksvg />
                </svg>
                <input
                  className="inputStyle grow  "
                  type="password"
                  name="password"
                  autoComplete="password"
                  placeholder="رمز عبور"
                  {...register("password")}
                  // all={handlePassBlur}
                />
              </div>
              {errors.password && (
                <div className="text-xs container text-red-400 mt-5">
                  {errors.password.message}
                </div>
              )}
              {/* *******************button**************************** */}
              <button
                onClick={() => {
                  SetStep("GetPhone");
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

            {/* *******************Phone******************** */}

            <div className={step !== "GetPhone" ? "hidden" : ""}>
              <div className="flex items-center ">
                <svg className="w-5 h-5 ">
                  <Phonesvg />
                </svg>
                <input
                  className="inputStyle grow"
                  type="Phone"
                  name="Phone"
                  autoComplete="Phone"
                  placeholder="شماره تلفن همراه"
                  {...register("Phone")}
                  // all={handlePhoneBlur}
                />
              </div>
              {errors.Phone && (
                <div className="text-xs container text-red-400 mt-5">
                  {errors.Phone.message}
                </div>
              )}
              {/* *******************button**************************** */}
              <button
                             

                onClick={() => {
                  errors.Phone || errors.name || errors.password ? SetStep("GetUser") : null ;
                  
                }}
                type="submit"
                disabled={errors.Phone}
                className={
                  /* if issubmit is true class will be change */
                  errors.Phone
                    ? "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-gray-400  "
                    : "h-11 w-full md:h-14 rounded-xl flexCenter gap-x-2 mt-4 text-white bg-teal-600 hover:bg-teal-700   "
                }
              >
                {errors.Phone || errors.name || errors.password ? "بعدی" : "ثبت نام"}
                
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
