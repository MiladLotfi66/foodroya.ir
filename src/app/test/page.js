"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/yupSchemas/signUpSchema";

export default function App() {
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

  const formsubmitting = async (data) => {
    console.log(data.name);
  };

  // فراخوانی تابع handleSubmit برای ورودی name
  const handleNameBlur = () => {
    handleSubmit((data) => {
      console.log(data.name);
    })();
  };

  // فراخوانی تابع handleSubmit برای ورودی email
  const handleEmailBlur = () => {
    handleSubmit((data) => {
      console.log(data.email);
    })();
  };

  // فراخوانی تابع handleSubmit برای ورودی password
  const handlePasswordBlur = () => {
    handleSubmit((data) => {
      console.log(data.password);
    })();
  };

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <form
        onSubmit={handleSubmit(formsubmitting)}
        className="login-form flex flex-col gap-4 p-2 md:p-4"
      >
        <input
          className="inputStyle grow"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="نام کاربری"
          {...register("name")}
          onBlur={handleNameBlur} // اضافه کردن onBlur و فراخوانی تابع مربوطه
        />

        <input
          className="inputStyle grow"
          type="text"
          name="email"
          autoComplete="email"
          placeholder="email"
          {...register("email")}
          onBlur={handleEmailBlur} // اضافه کردن onBlur و فراخوانی تابع مربوطه
        />

        <input
          className="inputStyle grow"
          type="password"
          name="password"
          autoComplete="password"
          placeholder="password"
          {...register("password")}
          onBlur={handlePasswordBlur} // اضافه کردن onBlur و فراخوانی تابع مربوطه
        />

        {/* نمایش پیام خطاها */}
        {errors.name && (
          <div className="text-xs text-red-400">{errors.name.message}</div>
        )}
        {errors.email && (
          <div className="text-xs text-red-400">{errors.email.message}</div>
        )}
        {errors.password && (
          <div className="text-xs text-red-400">{errors.password.message}</div>
        )}

        <button
          type="submit"
          disabled={Object.keys(errors).length > 0} // غیرفعال کردن دکمه ارسال در صورت وجود خطاها
          className={
            /* if errors exist class will be change */
            Object.keys(errors).length > 0
              ? "flexCenter gap-x-2 h-11 md:h-14 bg-gray-400 rounded-xl text-white mt-4"
              : "h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4"
          }
        >
          بعدی
        </button>
      </form>
    </>
  );
}
