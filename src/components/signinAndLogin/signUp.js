"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import Usersvg from "@/module/svgs/Usersvg";
import Phonesvg from "@/module/svgs/phoneSvg1";
import Locksvg from "@/module/svgs/Locksvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import RegisterSchema from "@/utils/yupSchemas/RegisterSchema";
import FormStep from "@/module/User/FormStep";
import InputField from "@/module/User/InputField";
import { checkUsernameUnique, completeSignUp } from "./Actions/signUpServerAction";
import { SendSMSServerAction } from "src/ServerActions/SendSMSServerAction";
import { verifyOTP } from "src/ServerActions/OtpVerify";

function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmit, setIsSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // وضعیت نمایش رمز عبور
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [formData, setFormData] = useState(null); // برای ذخیره اطلاعات فرم قبل از تأیید OTP

  // *******************hook use form********************
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    clearErrors,
    trigger,
  } = useForm({
    mode: "all",
    defaultValues: {
      name: "",
      username: "",
      password: "",
      phone: "",
    },
    resolver: yupResolver(RegisterSchema),
  });

  // *******************دریافت مقدار username با useWatch********************
  const username = useWatch({
    control,
    name: "username",
    defaultValue: "",
  });

  // *******************بررسی یکتایی نام کاربری با Debounce********************
  useEffect(() => {
    const checkUsername = async () => {
      if (username && username.trim().length >= 3) {
        setIsCheckingUsername(true);
        const result = await checkUsernameUnique(username.trim());
        setIsCheckingUsername(false);
        if (result.exists) {
          setError("username", {
            type: "manual",
            message: "این نام کاربری قبلاً استفاده شده است",
          });
          setUsernameAvailable(false);
        } else {
          clearErrors("username");
          setUsernameAvailable(true);
        }
      } else {
        setUsernameAvailable(null);
        clearErrors("username");
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkUsername();
    }, 500); // تاخیر ۵۰۰ میلی‌ثانیه

    return () => clearTimeout(delayDebounceFn);
  }, [username, setError, clearErrors]);

  // *******************submit ********************
  const formsubmitting = async (data) => {
    setIsSubmit(true);
    try {
      // به جای ثبت نام مستقیم، ابتدا OTP ارسال می‌کنیم
      setFormData(data); // ذخیره اطلاعات فرم
      const res = await SendSMSServerAction(data.phone);
      console.log("res",res);
      
      if (res.status === 200) {
        setIsOtpSent(true);
        toast.success("کد تأیید به شماره موبایل شما ارسال شد");
        setStep(5); // رفتن به مرحله تأیید OTP
      } else {
        toast.error(res.error || "خطا در ارسال کد تأیید");
      }
    } catch (error) {
      console.error("خطا در ارسال کد تأیید:", error);
      toast.error("خطا در ارسال کد تأیید. لطفاً دوباره تلاش کنید.");
    }
    setIsSubmit(false);
  };

  // تابع جدید برای تأیید OTP و تکمیل ثبت نام
  const verifyAndCompleteSignUp = async () => {
    if (!otp || otp.length < 5) {
      setOtpError("لطفاً کد تأیید را وارد کنید");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const verifyResult = await verifyOTP(formData.phone, otp);
      console.log("verifyResult",verifyResult);
      
      if (verifyResult.status === 200) {
        // OTP تأیید شد، حالا ثبت نام را تکمیل می‌کنیم
        const signUpResult = await completeSignUp(formData);
        
        if (signUpResult.status === 201) {
          toast.success(
            signUpResult.message ||
              "ثبت‌نام موفقیت‌آمیز بود. لطفاً وارد حساب کاربری خود شوید."
          );
          router.push("/signin");
        } else {
          toast.error(signUpResult.error || "خطا در ثبت نام.");
        }
      } else {
        setOtpError(verifyResult.error || "کد تأیید نامعتبر است");
      }
    } catch (error) {
      console.error("خطا در تأیید کد:", error);
      setOtpError("خطا در تأیید کد. لطفاً دوباره تلاش کنید.");
    }
    setIsVerifyingOtp(false);
  };

  // ارسال مجدد کد OTP
  const resendOTP = async () => {
    setIsSubmit(true);
    try {
      const res = await SendSMSServerAction(formData.phone);
      
      if (res.status === 200) {
        toast.success("کد تأیید مجدداً ارسال شد");
      } else {
        toast.error(res.error || "خطا در ارسال مجدد کد تأیید");
      }
    } catch (error) {
      console.error("خطا در ارسال مجدد کد تأیید:", error);
      toast.error("خطا در ارسال مجدد کد تأیید. لطفاً دوباره تلاش کنید.");
    }
    setIsSubmit(false);
  };

  // *******************تغییر مرحله********************
  const nextStep = async () => {
    const currentStepFields = getCurrentStepFields();
    const valid = await trigger(currentStepFields);
    if (valid) {
      setStep((prev) => prev + 1);
    }
  };
  const prevStep = () => setStep((prev) => prev - 1);

  // *******************دریافت فیلدهای مرحله فعلی********************
  const getCurrentStepFields = () => {
    switch (step) {
      case 1:
        return ["name"];
      case 2:
        return ["username"];
      case 3:
        return ["password"];
      case 4:
        return ["phone"];
      default:
        return [];
    }
  };

  // *******************مدیریت کلید Enter********************
  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step < 4) {
        await nextStep();
      } else if (step === 4) {
        handleSubmit(formsubmitting)();
      } else if (step === 5) {
        verifyAndCompleteSignUp();
      }
    }
  };

  // *******************تغییر وضعیت نمایش رمز عبور********************
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // *******************jsx********************
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-[url('../../public/Images/jpg/chefSign.webp')] p-4">
      <div className="bg-white dark:bg-zinc-700 shadow-lg rounded-2xl w-full max-w-md p-6">
        {/* *******************header******************** */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-sm">
              خوش آمدید به
              <Link href="/" className="text-orange-300 font-MorabbaMedium mr-1">
                {"نیبرو"}
              </Link>
            </h4>
            <h1 className="text-2xl font-MorabbaBold">ثبت نام</h1>
          </div>
          <div className="text-right">
            <h4 className="text-sm">قبلا ثبت نام کرده اید؟</h4>
            <Link
              href="/signin"
              className="text-orange-300 cursor-pointer font-MorabbaMedium"
            >
              ورود
            </Link>
          </div>
        </div>

        {/* *******************progress bar******************** */}
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-full h-2 rounded-full ${
                  step >= s ? "bg-teal-500" : "bg-gray-300"
                }`}
              ></div>
              {s < 5 && (
                <div className="w-4 h-4 bg-teal-500 rounded-full -ml-2 border-2 border-white"></div>
              )}
            </div>
          ))}
        </div>

        {/* *******************main******************** */}
        <form
          noValidate
          onSubmit={handleSubmit(formsubmitting)}
          className="flex flex-col gap-4"
          onKeyDown={handleKeyDown}
        >
          {/* *******************مرحله 1: نام ******************** */}
          <FormStep isActive={step === 1}>
            <InputField
              label="نام و نام خانوادگی"
              Icon={Usersvg}
              register={register}
              name="name"
              type="text"
              placeholder="نام و نام خانوادگی"
              error={errors.name}
              iconSize="w-4 h-4" // کاهش اندازه آیکون
            />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={nextStep}
                disabled={!!errors.name}
                className={`w-full py-2 px-4 rounded-xl text-white ${
                  errors.name
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                بعدی
              </button>
            </div>
          </FormStep>

          {/* *******************مرحله 2: نام کاربری ******************** */}
          <FormStep isActive={step === 2}>
            <InputField
              label="نام کاربری"
              Icon={Usersvg}
              register={register}
              name="username"
              type="text"
              placeholder="نام کاربری"
              error={errors.username}
              iconSize="w-4 h-4" // کاهش اندازه آیکون
            />
            {isCheckingUsername && (
              <p className="text-sm text-gray-500 mt-1">در حال بررسی...</p>
            )}
            {usernameAvailable && (
              <p className="text-sm text-green-500 mt-1">این نام کاربری در دسترس است</p>
            )}
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-full py-2 px-4 rounded-xl text-white bg-gray-400 hover:bg-gray-500 mr-2"
              >
                قبلی
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!!errors.username || isCheckingUsername}
                className={`w-full py-2 px-4 rounded-xl text-white ${
                  errors.username || isCheckingUsername
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                بعدی
              </button>
            </div>
          </FormStep>

          {/* *******************مرحله 3: رمز عبور ******************** */}
          <FormStep isActive={step === 3}>
            <InputField
              label="رمز عبور"
              Icon={Locksvg}
              register={register}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="رمز عبور"
              error={errors.password}
              iconSize="w-4 h-4" // کاهش اندازه آیکون
              rightElement={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                  className="focus:outline-none"
                >
                  {showPassword ? <EyeslashSvg /> : <EyeSvg />}
                </button>
              }
            />
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={prevStep}
                className="w-full py-2 px-4 rounded-xl text-white bg-gray-400 hover:bg-gray-500 mr-2"
              >
                قبلی
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!!errors.password}
                className={`w-full py-2 px-4 rounded-xl text-white ${
                  errors.password
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                بعدی
              </button>
            </div>
          </FormStep>

          {/* *******************مرحله 4: شماره تلفن ******************** */}
          <FormStep isActive={step === 4}>
            <InputField
              label="شماره تلفن همراه"
              Icon={Phonesvg}
              register={register}
              name="phone"
              type="tel"
              placeholder="شماره تلفن همراه"
              error={errors.phone}
              // اندازه آیکون تلفن بدون تغییر
            />
            <div className="flex justify-between mt-4 items-center">
              <button
                type="button"
                onClick={prevStep}
                className="w-full py-2 px-4 rounded-xl text-white bg-gray-400 hover:bg-gray-500 mr-2"
              >
                قبلی
              </button>
              <button
                type="submit"
                disabled={!!errors.phone || isSubmit}
                className={`w-full py-2 px-4 rounded-xl text-white flex items-center justify-center ${
                  errors.phone || isSubmit
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isSubmit ? <HashLoader size={20} color="#fff" /> : "ارسال کد تأیید"}
              </button>
            </div>
          </FormStep>

          {/* *******************مرحله 5: تأیید OTP ******************** */}
          <FormStep isActive={step === 5}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                کد تأیید ارسال شده به شماره {formData?.phone}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setOtpError("");
                  }}
                  placeholder="کد تأیید را وارد کنید"
                  className="w-full py-2 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength={5}
                />
              </div>
              {otpError && <p className="text-sm text-red-500 mt-1">{otpError}</p>}
              <button
                type="button"
                onClick={resendOTP}
                className="text-teal-600 text-sm mt-2 hover:underline"
                disabled={isSubmit}
              >
                ارسال مجدد کد
              </button>
            </div>
            <div className="flex justify-between mt-4 items-center">
              <button
                type="button"
                onClick={prevStep}
                className="w-full py-2 px-4 rounded-xl text-white bg-gray-400 hover:bg-gray-500 mr-2"
              >
                قبلی
              </button>
              <button
                type="button"
                onClick={verifyAndCompleteSignUp}
                disabled={isVerifyingOtp}
                className={`w-full py-2 px-4 rounded-xl text-white flex items-center justify-center ${
                  isVerifyingOtp
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {isVerifyingOtp ? <HashLoader size={20} color="#fff" /> : "تأیید و ثبت نام"}
              </button>
            </div>
          </FormStep>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

export default SignUp;

