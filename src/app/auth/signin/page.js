"use client";
import { useFormik } from "formik";
import Usersvg from "@/module/svgs/Usersvg";
import Emailsvg from "@/module/svgs/Emailsvg";
import Locksvg from "@/module/svgs/Locksvg";
import { useRouter } from "next/navigation";
import Link from "next/link";

function page() {
  const router = useRouter();
  const onSubmit = () => {
    console.log("submit");
  };
// *******************hook use formik******************** 

  const form = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      rePassword: "",
    },

    onSubmit: (values, { setSubmitting }) => {
      console.log("form input data", values);
      setTimeout(() => {
        setSubmitting(false);
      }, 3000);
    },
    validate: (values) => {
      const errors = {};
      if (!values.username) {
        errors.username = "نام کاربری را وارد کنید";
      }
      if (!values.rePassword) {
        errors.rePassword = "تکرار رمز عبور را وارد کنید";
      } else if (values.rePassword !== values.password) {
        errors.rePassword = "رمز عبور با تکرار آن یکسان نمیباشد";
      }
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
                href="/auth/login"
                className="text-orange-300 cursor-pointer font-MorabbaMedium"
              >
                ورود{" "}
              </Link>
            </div>
          </div>

          {/* *******************main******************** */}

          <form
            onSubmit={form.handleSubmit}
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
                name="username"
                autoComplete="name"
                placeholder="نام کاربری"
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                value={form.values.username}
              />
            </div>
            {form.touched.username && form.errors.username ? (
              <div className="text-xs text-red-400">{form.errors.username}</div>
            ) : null}

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
                placeholder="ایمیل"
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
              <div className="flex justify-between gap-x-2  ">
                <input
                  className="text-zinc-700 max-w-[48%] w-[48%] m-2 dark:text-white rounded-lg text-base/4 md:text-lg/4 h-10 bg-gray-200 dark:bg-gray-600 p-2 font-DanaDemiBold placeholder:p-2 "
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="رمز عبور"
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  value={form.values.password}
                />
                <input
                  className="text-zinc-700 max-w-[48%] w-[48%] m-2 dark:text-white rounded-lg text-base/4 md:text-lg/4 h-10 bg-gray-200 dark:bg-gray-600 p-2 font-DanaDemiBold placeholder:p-2 "
                  type="password"
                  name="rePassword"
                  autoComplete="current-password"
                  placeholder="تکرار رمز عبور"
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  value={form.values.rePassword}
                />
              </div>
            </div>
            {form.touched.password && form.errors.password ? (
              <div className="text-xs text-red-400">{form.errors.password}</div>
            ) : null}

            {form.touched.rePassword && form.errors.rePassword ? (
              <div className="text-xs text-red-400">
                {form.errors.rePassword}
              </div>
            ) : null}

            {/* *******************button**************************** */}

            <button
              type="submit"
              className={
                /* if issubmit is true class will be change */
                form.isSubmitting
                  ? " h-11  md:h-14 bg-gray-400 rounded-xl   text-white mt-4"
                  : "h-11  md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white mt-4"
              }
              disabled={form.isSubmitting}
            >
              {form.isSubmitting ? "درحال ثبت نام ..." : "ثبت نام"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default page;
