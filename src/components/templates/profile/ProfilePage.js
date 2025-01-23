"use client";
import Head from "next/head";
import DatePicker from "react-multi-date-picker";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import BirtdaySvg from "@/module/svgs/BirtdaySvg";
import { useForm, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState, useRef, useCallback } from "react";
import NextImage from "next/image";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useSession } from "next-auth/react";
import {
  GetUserData,
  UpdateUserProfile,
  ChangeSecurityQuestion,
} from "@/components/signinAndLogin/Actions/UsersServerActions";
import usericone from "@/public/Images/jpg/user.webp";

import PencilIcon from "@/module/svgs/PencilIcon";
import Emailsvg from "@/module/svgs/Emailsvg";
import keySvg from "@/module/svgs/keySvg";
import Locksvg from "@/module/svgs/Locksvg";
import Modal from "./Modal";
import LocationSvg from "@/module/svgs/location";
import TextPage from "@/module/svgs/TextPageSvg";
import PhoneSvg from "@/module/svgs/phoneSvg1";
import "react-image-crop/dist/ReactCrop.css";
import Link from "next/link";
import { GetUserShopsCount } from "@/templates/Shop/ShopServerActions";
import { GetUserFollowingShops,GetUserShops } from "@/templates/Shop/ShopServerActions";
import AvatarGroupTailwind from "@/module/User/AvatarGroupTailwind.js";

function ProfilePage() {
  const { data: session } = useSession();
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(usericone);
  const [base64Image, setBase64Image] = useState(null);
  const [userShopCounter, setUserShopCounter] = useState(0);
  const [editField, setEditField] = useState(null);
  const [isEditingSecurityQuestion, setIsEditingSecurityQuestion] =
    useState(false);
  const fileInputRef = useRef(null);
  const [followingShops, setFollowingShops] = useState([]);
  const [UserShops, setUserShops] = useState([]);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    control,
    formState: { errors, dirtyFields, isDirty },
  } = useForm({
    mode: "all",
    defaultValues: {
      userImage: "",
      dateOfBirth: null,
      twoFactorEnabled: false,
      securityQuestion: { question: "", answer: "" },
      newSecurityQuestion: { question: "", answer: "" },
    },
  });
  

  const securityQuestionForm = useForm({
    mode: "all",
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const watchedFields = watch();

  useEffect(() => {
    setValue("userImage", base64Image, { shouldDirty: true });
  }, [base64Image, setValue]);

  const updateAvatar = (imgSrc) => {
    setAvatarUrl(imgSrc);
    setBase64Image(imgSrc);
    setModalOpen(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      const resUserShopCount = await GetUserShopsCount();
      if (resUserShopCount.status === 200) {
        setUserShopCounter(resUserShopCount.shopCount);
      }
      const res = await GetUserData();

      if (res.status === 200) {
        setUser(res.user);
        console.log(res.user);

        let dateOfBirth = res.user.dateOfBirth
          ? new Date(res.user.dateOfBirth)
          : null;

        reset({
          ...res.user,
          dateOfBirth: dateOfBirth,
          twoFactorEnabled: res.user.twoFactorEnabled || false,
          securityQuestion: res.user.securityQuestion || {
            question: "",
            answer: "",
          },
        });

        if (res.user.userImage) {
          setAvatarUrl(res.user.userImage);
          setBase64Image(res.user.userImage);
        }

        // دریافت لیست غرفه‌های دنبال‌شده
        const resFollowingShops = await GetUserFollowingShops();
        console.log("resFollowingShops", resFollowingShops);

        if (resFollowingShops.status === 200) {
          setFollowingShops(resFollowingShops.shops); // فرض می‌کنیم API لیست غرفه‌ها را در کلید "shops" برمی‌گرداند
        } else {
          toast.error(
            resFollowingShops.error || "دریافت غرفه‌های دنبال‌شده ناموفق بود."
          );
        } 
        // دریافت لیست غرفه‌های دنبال‌شده
        const resGetUserShops = await GetUserShops();
        console.log("resGetUserShops", resGetUserShops);

        if (resGetUserShops.status === 200) {
          setUserShops(resGetUserShops.Shops); // فرض می‌کنیم API لیست غرفه‌ها را در کلید "shops" برمی‌گرداند
        } else {
          toast.error(
            resGetUserShops.error || "دریافت غرفه‌های دنبال‌شده ناموفق بود."
          );
        }
      }
    };
    fetchUserData();
  }, [reset]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      const profileData = { ...formData };

      // تبدیل تاریخ تولد به فرمت قابل ارسال به سرور (ISO String)
      if (profileData.dateOfBirth) {
        profileData.dateOfBirth = new Date(
          profileData.dateOfBirth
        ).toISOString();
      }

      // پردازش userImage مشابه قبل
      // if (
      //   profileData.userImage &&
      //   profileData.userImage.startsWith("data:image/")
      // ) {
      //   profileData.userImage = profileData.userImage.replace(
      //     /^data:image\/\w+;base64,/,
      //     ""
      //   );
      // } else {
      //   delete profileData.userImage;
      // }

      // حذف securityQuestion اگر تنظیم شده است
      if (user?.securityQuestion?.question && user?.securityQuestion?.answer) {
        delete profileData.securityQuestion;
      } else if (profileData.securityQuestion) {
        profileData.securityQuestion = {
          question: profileData.securityQuestion.question.trim(),
          answer: profileData.securityQuestion.answer.trim(),
        };
      }
      console.log("Profile Data:", profileData); // دیباگ کردن داده‌های پروفایل

      const result = await UpdateUserProfile(profileData);

      if (result.status === 200) {
        toast.success(result.message);
        window.location.reload();

        setEditField(null);
        setBase64Image(null);
      } else {
        toast.error(result.error || "خطایی رخ داده است.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("خطایی در ارسال فرم به وجود آمده است.");
    } finally {
      setIsSubmit(false);
    }
  };

  const handleEditImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result;
      const image = new window.Image();
      image.src = imageUrl;
      image.onload = () => {
        if (image.width < 150 || image.height < 150) {
          toast.error("تصویر باید حداقل 150x150 پیکسل باشد.");
          setSelectedImage(null);
        } else {
          setSelectedImage(imageUrl);
          setModalOpen(true);
        }
      };
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // تابع برای تغییر سوال امنیتی با استفاده از سرور اکشن
  const onSubmitSecurityQuestion = async (data) => {
    if (!data.question || !data.answer) {
      toast.error("سوال و پاسخ جدید الزامی است.");
      return;
    }
    try {
      // استفاده مستقیم از سرور اکشن
      const result = await ChangeSecurityQuestion(data.question, data.answer);

      if (result.status === 200) {
        toast.success(result.message);
        // به‌روزرسانی وضعیت کاربر
        setUser((prevUser) => ({
          ...prevUser,
          securityQuestion: {
            question: data.question,
            answer: data.answer, // در صورت نیاز می‌توانید پاسخ را رمز‌گذاری کنید
          },
        }));
        setIsEditingSecurityQuestion(false);
        securityQuestionForm.reset();
      } else {
        toast.error(result.error || "خطایی رخ داده است.");
      }
    } catch (error) {
      console.error("Error changing security question:", error);
      toast.error("خطایی در تغییر سوال امنیتی رخ داده است.");
    }
  };

  return (
    <>
      {/* Head برای SEO */}
      <Head>
        <title>{user ? `${user.name} | پروفایل` : "نمایه کاربری"}</title>
        <meta
          name="description"
          content={
            user
              ? `پروفایل کاربری ${user.name} در وب‌سایت ما.`
              : "ویرایش پروفایل کاربری خود را انجام دهید."
          }
        />
        <meta
          name="keywords"
          content="پروفایل, ویرایش پروفایل, اطلاعات کاربری"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* افزودن داده‌های ساختار یافته Person schema */}
        {user && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: user.name,
                url: `/profile/${user.userUniqName}`,
                image: avatarUrl,
                description: user.bio || "",
                email: user.email,
                telephone: user.phone,
                // افزودن سایر فیلدهای مربوط به پروفایل
              }),
            }}
          />
        )}
      </Head>

      <FormTemplate >
      <main>
          <div className="bg-white dark:bg-zinc-700 shadow-lg rounded-2xl mt-16 p-8 md:p-12 max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-MorabbaBold text-gray-800 dark:text-gray-200 pt-10">
                نمایه کاربری
              </h1>
              <div className="hidden">
                <LocationSvg />
                <PhoneSvg />
                <TextPage />
                <BirtdaySvg />
                <Emailsvg />
                <Locksvg />
                <keySvg />
              </div>
            </header>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              {/* فیلد مخفی userImage */}
              <input type="hidden" {...register("userImage")} />

              {/* بخش تصویر پروفایل و نام کاربری */}
              <section className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32">
                  <NextImage
                    src={avatarUrl}
                    alt={`پروفایل ${user?.name || "کاربر"}`}
                    width={128}
                    height={128}
                    className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition duration-200"
                    title="تغییر عکس پروفایل"
                    onClick={handleEditImage}
                    aria-label="تغییر عکس پروفایل"
                  >
                    <PencilIcon />
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  ref={fileInputRef}
                  className="hidden"
                />
                {modalOpen && selectedImage && (
                  <Modal
                    imgSrc={selectedImage}
                    updateAvatar={updateAvatar}
                    closeModal={() => setModalOpen(false)}
                  />
                )}
                <div className="w-full text-center">
                  {editField === "userUniqName" ? (
                    <input
                      type="text"
                      name="userUniqName"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                      {...register("userUniqName", {
                        required: "نام کاربری الزامی است.",
                      })}
                      onBlur={() => setEditField(null)}
                      autoFocus
                      aria-label="نام کاربری"
                    />
                  ) : (
                    <h2
                      onClick={() => setEditField("userUniqName")}
                      className="text-2xl font-semibold cursor-pointer hover:text-blue-500 transition duration-200"
                      tabIndex={0}
                      role="button"
                      onKeyPress={(e) =>
                        e.key === "Enter" && setEditField("userUniqName")
                      }
                      aria-label="ویرایش نام کاربری"
                    >
                      {watchedFields.userUniqName ||
                        user?.userUniqName ||
                        "نام کاربری خود را وارد کنید"}
                    </h2>
                  )}
                  {errors.userUniqName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.userUniqName.message}
                    </p>
                  )}
                </div>
              </section>
              <div className="flex justify-between items-center">

                <Link href="/Shop/allShop" className="mt-8 gap-2 first-line:flex-col text-center items-center justify-center">
                  <h2 className="text-lg font-MorabbaBold text-gray-800 dark:text-gray-200 mb-4">
                    غرفه‌هایی که دنبال می‌کنید
                  </h2>
                  {followingShops.length > 0 ? (
                    <AvatarGroupTailwind
                      avatars={followingShops.map((shop) => shop.avatarUrl)}
                      max={4}
                      size={50} // اندازه آواتارها به پیکسل
                      overlap={25} // میزان همپوشانی به پیکسل
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      شما هنوز هیچ غرفه‌ای را دنبال نکرده‌اید.
                    </p>
                  )}
                  ({followingShops.length})
                </Link>
                {/* غرفه های ایجاد شده */}

                <Link href="/Shop/userShop" className="mt-8  gap-2 flex-col text-center items-center justify-center">
                  <h2 className="text-lg font-MorabbaBold text-gray-800 dark:text-gray-200 mb-4">
                    غرفه‌های شما
                  </h2>
                  {UserShops.length > 0 ? (
                    <AvatarGroupTailwind
                      avatars={UserShops.map((shop) => shop.avatarUrl)}
                      max={4}
                      size={50} // اندازه آواتارها به پیکسل
                      overlap={25} // میزان همپوشانی به پیکسل
                    />
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">
                      شما هنوز هیچ غرفه‌ای را ایجاد نکرده‌اید.
                    </p>
                  )}
                  ({UserShops.length})
                </Link>
              </div>

              {/* اطلاعات کاربری */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* نام کامل */}
                <div className="w-full flex flex-col">
                  {editField === "name" ? (
                    <>
                      <label
                        htmlFor="name"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        نام کامل
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                        {...register("name", {
                          required: "نام کامل الزامی است.",
                        })}
                        onBlur={() => setEditField(null)}
                        autoFocus
                        aria-required="true"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor="name"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        نام کامل
                      </label>
                      <span
                        onClick={() => setEditField("name")}
                        className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) =>
                          e.key === "Enter" && setEditField("name")
                        }
                        aria-label="ویرایش نام کامل"
                      >
                        {watchedFields.name ||
                          user?.name ||
                          "نام کامل خود را وارد کنید"}
                      </span>
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* تلفن همراه */}
                <div className="w-full flex flex-col">
                  <label
                    htmlFor="phone"
                    className="mb-2 text-gray-700 dark:text-gray-300"
                  >
                    تلفن همراه
                  </label>
                  {editField === "phone" ? (
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                      {...register("phone", {
                        required: "تلفن همراه الزامی است.",
                      })}
                      onBlur={() => setEditField(null)}
                      autoFocus
                      aria-required="true"
                      aria-label="تلفن همراه"
                    />
                  ) : (
                    <span
                      onClick={() => setEditField("phone")}
                      className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                      tabIndex={0}
                      role="button"
                      onKeyPress={(e) =>
                        e.key === "Enter" && setEditField("phone")
                      }
                      aria-label="ویرایش تلفن همراه"
                    >
                      {watchedFields.phone ||
                        user?.phone ||
                        "تلفن همراه خود را وارد کنید"}
                    </span>
                  )}
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      این فیلد الزامی است.
                    </p>
                  )}
                </div>

                {/* ایمیل */}
                <div className="w-full flex flex-col">
                  {editField === "email" ? (
                    <>
                      <label
                        htmlFor="email"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        ایمیل
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                        {...register("email", {
                          required: "ایمیل الزامی است.",
                          pattern: {
                            value:
                              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|((".+")))\@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/,
                            message: "ایمیل معتبر نیست.",
                          },
                        })}
                        onBlur={() => setEditField(null)}
                        autoFocus
                        aria-required="true"
                        aria-label="ایمیل"
                      />
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor="email"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        ایمیل
                      </label>
                      <span
                        onClick={() => setEditField("email")}
                        className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) =>
                          e.key === "Enter" && setEditField("email")
                        }
                        aria-label="ویرایش ایمیل"
                      >
                        {watchedFields.email ||
                          user?.email ||
                          "ایمیل خود را اینجا وارد کنید"}
                      </span>
                    </>
                  )}
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message || "ایمیل نامعتبر است."}
                    </p>
                  )}
                </div>

                {/* تاریخ تولد */}
                <div className="w-full flex flex-col">
                  <label
                    htmlFor="dateOfBirth"
                    className="mb-2 text-gray-700 dark:text-gray-300"
                  >
                    تاریخ تولد
                  </label>
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    rules={{
                      validate: (value) =>
                        value === null ||
                        value < new Date() ||
                        "تاریخ تولد باید در گذشته باشد.",
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        id="dateOfBirth"
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        value={value}
                        onChange={(date) => {
                          if (date) {
                            onChange(date.toDate());
                          } else {
                            onChange(null);
                          }
                        }}
                        inputClass="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                        placeholder="انتخاب تاریخ تولد"
                        aria-label="تاریخ تولد"
                      />
                    )}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.dateOfBirth.message || "تاریخ تولد نامعتبر است."}
                    </p>
                  )}
                </div>

                {/* احراز هویت دو مرحله‌ای */}
                <div className="w-full flex items-center">
                  <label
                    htmlFor="twoFactorEnabled"
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="twoFactorEnabled"
                      name="twoFactorEnabled"
                      {...register("twoFactorEnabled")}
                      className="form-checkbox h-5 w-5 text-blue-600"
                      aria-label="فعال‌سازی اعتبارسنجی دو مرحله‌ای"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      فعال‌سازی اعتبارسنجی دو مرحله‌ای
                    </span>
                  </label>
                </div>
              </section>

              {/* سوال امنیتی */}
              <section className="bg-gray-100 dark:bg-zinc-600 p-6 rounded-lg shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-MorabbaBold text-gray-800 dark:text-gray-200">
                    سوال امنیتی
                  </h2>
                  {user?.securityQuestion?.question &&
                  user?.securityQuestion?.answer ? (
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => setIsEditingSecurityQuestion(true)}
                      aria-label="ویرایش سوال امنیتی"
                    >
                      ویرایش
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-green-600 dark:text-green-400 hover:underline"
                      onClick={() => setIsEditingSecurityQuestion(true)}
                      aria-label="افزودن سوال امنیتی"
                    >
                      افزودن
                    </button>
                  )}
                </div>

                {!user?.securityQuestion?.question ||
                !user?.securityQuestion?.answer ? (
                  <p className="text-gray-700 dark:text-gray-300">
                    شما هنوز سوال امنیتی تعریف نکرده‌اید. لطفاً با کلیک روی دکمه
                     افزودن سوال و پاسخ امنیتی خود را تعیین کنید.
                  </p>
                ) : null}

                {user?.securityQuestion?.question &&
                user?.securityQuestion?.answer &&
                !isEditingSecurityQuestion ? (
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      سوال امنیتی شما به صورت زیر است:
                    </p>
                    <p className="mt-2 text-gray-900 dark:text-gray-100 font-semibold">
                      {user.securityQuestion.question}
                    </p>
                  </div>
                ) : (
                  isEditingSecurityQuestion && (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label
                          htmlFor="newQuestion"
                          className="mb-2 text-gray-700 dark:text-gray-300"
                        >
                          پرسش امنیتی جدید
                        </label>
                        <input
                          type="text"
                          id="newQuestion"
                          name="newQuestion"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            securityQuestionForm.formState.errors.question
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500 dark:border-zinc-500"
                          } dark:bg-zinc-700 text-gray-800 dark:text-gray-200`}
                          {...securityQuestionForm.register("question", {
                            required: "پرسش امنیتی الزامی است.",
                            minLength: {
                              value: 5,
                              message: "پرسش باید حداقل ۵ حرف باشد.",
                            },
                          })}
                          aria-required="true"
                          aria-label="پرسش امنیتی جدید"
                          placeholder="پرسش امنیتی جدید خود را وارد کنید"
                        />
                        {securityQuestionForm.formState.errors.question && (
                          <p className="text-red-500 text-sm mt-1">
                            {
                              securityQuestionForm.formState.errors.question
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="newAnswer"
                          className="mb-2 text-gray-700 dark:text-gray-300"
                        >
                          پاسخ امنیتی جدید
                        </label>
                        <input
                          type="text"
                          id="newAnswer"
                          name="newAnswer"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            securityQuestionForm.formState.errors.answer
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-blue-500 dark:border-zinc-500"
                          } dark:bg-zinc-700 text-gray-800 dark:text-gray-200`}
                          {...securityQuestionForm.register("answer", {
                            required: "پاسخ امنیتی الزامی است.",
                            minLength: {
                              value: 3,
                              message: "پاسخ باید حداقل ۳ حرف باشد.",
                            },
                          })}
                          aria-required="true"
                          aria-label="پاسخ امنیتی جدید"
                          placeholder="پاسخ امنیتی جدید خود را وارد کنید"
                        />
                        {securityQuestionForm.formState.errors.answer && (
                          <p className="text-red-500 text-sm mt-1">
                            {
                              securityQuestionForm.formState.errors.answer
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingSecurityQuestion(false);
                            securityQuestionForm.reset();
                          }}
                          className="px-4 py-2 bg-gray-300 dark:bg-zinc-500 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-400 transition duration-200"
                          aria-label="لغو ویرایش سوال امنیتی"
                        >
                          لغو
                        </button>
                        <button
                          type="button"
                          onClick={securityQuestionForm.handleSubmit(
                            onSubmitSecurityQuestion
                          )}
                          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
                          aria-label="ذخیره سوال امنیتی جدید"
                        >
                          ذخیره
                        </button>
                      </div>
                    </div>
                  )
                )}
              </section>

              {/* آدرس و بیوگرافی */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* آدرس */}
                <div className="w-full flex flex-col">
                  {editField === "address" ? (
                    <>
                      <label
                        htmlFor="address"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        آدرس
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200 h-24 resize-none"
                        {...register("address", {
                          required: "آدرس الزامی است.",
                        })}
                        onBlur={() => setEditField(null)}
                        autoFocus
                        aria-required="true"
                        aria-label="آدرس"
                      ></textarea>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          این فیلد الزامی است.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor="address"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        آدرس
                      </label>
                      <span
                        onClick={() => setEditField("address")}
                        className="cursor-pointer p-4 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200 h-24 flex items-center"
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) =>
                          e.key === "Enter" && setEditField("address")
                        }
                        aria-label="ویرایش آدرس"
                      >
                        {watchedFields.address ||
                          user?.address ||
                          "در این قسمت می‌توانید آدرس خود را وارد کنید"}
                      </span>
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          این فیلد الزامی است.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* بیوگرافی */}
                <div className="w-full flex flex-col">
                  {editField === "bio" ? (
                    <>
                      <label
                        htmlFor="bio"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        بیوگرافی
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200 h-24 resize-none"
                        {...register("bio", {
                          required: "بیوگرافی الزامی است.",
                        })}
                        onBlur={() => setEditField(null)}
                        autoFocus
                        aria-required="true"
                        aria-label="بیوگرافی"
                      ></textarea>
                      {errors.bio && (
                        <p className="text-red-500 text-sm mt-1">
                          این فیلد الزامی است.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <label
                        htmlFor="bio"
                        className="mb-2 text-gray-700 dark:text-gray-300"
                      >
                        بیوگرافی
                      </label>
                      <span
                        onClick={() => setEditField("bio")}
                        className="cursor-pointer p-4 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200 h-24 flex items-center"
                        tabIndex={0}
                        role="button"
                        onKeyPress={(e) =>
                          e.key === "Enter" && setEditField("bio")
                        }
                        aria-label="ویرایش بیوگرافی"
                      >
                        {watchedFields.bio ||
                          user?.bio ||
                          "اینجا بیوگرافی خود را وارد کنید"}
                      </span>
                      {errors.bio && (
                        <p className="text-red-500 text-sm mt-1">
                          این فیلد الزامی است.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* دکمه ارسال فرم */}
              <section className="flex justify-center">
                <button
                  type="submit"
                  disabled={(!isDirty && !base64Image) || isSubmit}
                  className={`w-full md:w-1/2 p-3 rounded-lg text-white font-semibold transition duration-200 ${
                    (!isDirty && !base64Image) || isSubmit
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } flex items-center justify-center`}
                  aria-disabled={(!isDirty && !base64Image) || isSubmit}
                  aria-label="ذخیره تغییرات"
                >
                  {isSubmit ? (
                    <HashLoader size={20} color="#fff" />
                  ) : (
                    "ذخیره تغییرات"
                  )}
                </button>
              </section>
            </form>

            <Toaster />
          </div>
        </main>
      </FormTemplate>
    </>
  );
}

export default ProfilePage;
