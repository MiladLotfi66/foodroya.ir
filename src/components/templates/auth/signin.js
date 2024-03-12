"use client";
import { useFormik } from "formik";
import Emailsvg from "@/module/svgs/Emailsvg";
import Locksvg from "@/module/svgs/Locksvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import React from "react";
function SignIn() {
  const router = useRouter();

  // *******************hook use formik********************

  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    // *******************submit ********************

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: "/",
      });

      setSubmitting(false);
      if (res?.ok) router.push("/");
      else toast.error("ایمیل یا رمز عبور اشتباه است");
    },
    // *******************validate********************

    validate: (values) => {
      const errors = {};

      if (!values.email) {
        errors.email = "ایمیل را وارد کنید";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = "ایمیل معتبر نمیباشد";
      }
      if (!values.password) {
        errors.password = "رمز عبور را وارد کنید";
      } else if (values.password.length < 8) {
        errors.password = "رمز عبور باید بیشتر از 8 کاراکتر باشد";
      } else if (values.password.length > 20) {
        errors.password = "رمز عبور باید کمتر از 20 کاراکتر باشد";
      } else if (
        !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/i.test(
          values.password
        )
      ) {
        errors.password =
          "رمز عبور باید حداقل ۸ کاراکتر و حداکثر ۲۰ کاراکتر، شامل حروف بزرگ و کوچک انگلیسی، اعداد و حروف خاص مانند !@#$%^&* باشد.";
      }
      return errors;
    },
  });
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
            onSubmit={form.handleSubmit}
            className="login-form flex flex-col gap-4 p-2 md:p-4 "
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
                autoComplete="username"
                placeholder="ایمیل یا تلفن همراه"
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                value={form.values.email}
              />
            </div>
            {form.touched.email && form.errors.email ? (
              <div className="text-xs text-red-400">{form.errors.email}</div>
            ) : null}

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
                autoComplete="current-password"
                placeholder="رمز عبور"
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                value={form.values.password}
              />
            </div>
            {form.touched.password && form.errors.password ? (
              <div className="text-xs text-red-400">{form.errors.password}</div>
            ) : null}

            {/* *******************button**************************** */}

            <button
              type="submit"
              className={
                /* if issubmit is true class will be change */
                form.isSubmitting
                  ? "flexCenter gap-x-2 h-11  md:h-14 bg-gray-400 rounded-xl   text-white mt-4"
                  : "h-11  md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-4"
              }
              disabled={form.isSubmitting}
            >
              {form.isSubmitting ? "در حال ورود  " : "ورود"}
              {form.isSubmitting ? <HashLoader size={25} color="#fff" /> : ""}
            </button>
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default SignIn;
