"use client";
import DatePicker from "react-multi-date-picker";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import BirtdaySvg from "@/module/svgs/BirtdaySvg";
import { useForm, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState, useRef } from "react";
import NextImage from "next/image";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useSession } from "next-auth/react";
import {
  GetUserData,
  UpdateUserProfile,
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
import { GetUserShopsCount } from "@/components/signinAndLogin/Actions/ShopServerActions";

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
  const fileInputRef = useRef(null);

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
          securityQuestion: res.user.securityQuestion || { question: "", answer: "" },
        });

        if (res.user.userImage) {
          setAvatarUrl(res.user.userImage);
          setBase64Image(res.user.userImage);
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
      if (profileData.userImage && profileData.userImage.startsWith("data:image/")) {
        profileData.userImage = profileData.userImage.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
      } else {
        delete profileData.userImage;
      }

      // پردازش سوال امنیتی
      if (profileData.securityQuestion) {
        profileData.securityQuestion = {
          question: profileData.securityQuestion.question.trim(),
          answer: profileData.securityQuestion.answer.trim(),
        };
      }

      console.log("Profile Data:", profileData); // دیباگ کردن داده‌های پروفایل

      const result = await UpdateUserProfile(profileData);

      if (result.status === 200) {
        toast.success(result.message);
        setUser(result.data);
        reset(result.data);
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

  return (
    <FormTemplate>
      <div className="bg-white dark:bg-zinc-700 shadow-lg rounded-2xl mt-16 p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-MorabbaBold text-gray-800 dark:text-gray-200">نمایه کاربری</h1>
          <div className="hidden">
            <LocationSvg />
            <PhoneSvg />
            <TextPage />
            <BirtdaySvg />
            <Emailsvg />
            <Locksvg />
            <keySvg />
          </div>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* فیلد مخفی userImage */}
          <input type="hidden" {...register("userImage")} />

          {/* بخش تصویر پروفایل و نام کاربری */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-32 h-32">
              <NextImage
                src={avatarUrl}
                alt="Avatar"
                width={128}
                height={128}
                className="rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition duration-200"
                title="تغییر عکس پروفایل"
                onClick={handleEditImage}
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
                  {...register("userUniqName", { required: "نام کاربری الزامی است." })}
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setEditField("userUniqName")}
                  className="text-2xl font-semibold cursor-pointer hover:text-blue-500 transition duration-200"
                >
                  {watchedFields.userUniqName || user?.userUniqName || "نام کاربری خود را وارد کنید"}
                </h2>
              )}
              {errors.userUniqName && (
                <p className="text-red-500 text-sm mt-1">{errors.userUniqName.message}</p>
              )}
            </div>
          </div>

          {/* اطلاعات کاربری */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* نام کاربری */}
            <div className="w-full flex flex-col">
              {editField === "username" ? (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">نام کامل</label>
                  <input
                    type="text"
                    name="username"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                    {...register("username", { required: "نام کامل الزامی است." })}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </>
              ) : (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">نام کامل</label>
                  <span
                    onClick={() => setEditField("username")}
                    className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                  >
                    {watchedFields.username || user?.username || "نام کامل خود را وارد کنید"}
                  </span>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </>
              )}
            </div>

            {/* تلفن همراه */}
            <div className="w-full flex flex-col">
              <label className="mb-2 text-gray-700 dark:text-gray-300">تلفن همراه</label>
              {editField === "phone" ? (
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200"
                  {...register("phone", { required: "تلفن همراه الزامی است." })}
                  onBlur={() => setEditField(null)}
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setEditField("phone")}
                  className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                >
                  {watchedFields.phone || user?.phone || "تلفن همراه خود را وارد کنید"}
                </span>
              )}
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">این فیلد الزامی است.</p>
              )}
            </div>

            {/* ایمیل */}
            <div className="w-full flex flex-col">
              {editField === "email" ? (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">ایمیل</label>
                  <input
                    type="email"
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
                  />
                </>
              ) : (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">ایمیل</label>
                  <span
                    onClick={() => setEditField("email")}
                    className="cursor-pointer p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200"
                  >
                    {watchedFields.email || user?.email || "ایمیل خود را اینجا وارد کنید"}
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
              <label className="mb-2 text-gray-700 dark:text-gray-300">تاریخ تولد</label>
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
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="twoFactorEnabled"
                  {...register("twoFactorEnabled")}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  فعال‌سازی اعتبارسنجی دو مرحله‌ای
                </span>
              </label>
            </div>
          </div>

          {/* سوال امنیتی */}
          <div className="bg-gray-100 dark:bg-zinc-600 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-MorabbaBold mb-4 text-gray-800 dark:text-gray-200">سوال امنیتی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* پرسش امنیتی */}
              <div className="w-full flex flex-col">
                <label className="mb-2 text-gray-700 dark:text-gray-300">پرسش امنیتی</label>
                <input
                  type="text"
                  placeholder="پرسش امنیتی خود را وارد کنید"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.securityQuestion?.question
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500 dark:border-zinc-500"
                  } dark:bg-zinc-700 text-gray-800 dark:text-gray-200`}
                  {...register("securityQuestion.question", {
                    required: "پرسش امنیتی الزامی است.",
                    minLength: { value: 5, message: "پرسش باید حداقل ۵ حرف باشد." },
                  })}
                />
                {errors.securityQuestion?.question && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.securityQuestion.question.message}
                  </p>
                )}
              </div>

              {/* پاسخ امنیتی */}
              <div className="w-full flex flex-col">
                <label className="mb-2 text-gray-700 dark:text-gray-300">پاسخ امنیتی</label>
                <input
                  type="text"
                  placeholder="پاسخ امنیتی خود را وارد کنید"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.securityQuestion?.answer
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500 dark:border-zinc-500"
                  } dark:bg-zinc-700 text-gray-800 dark:text-gray-200`}
                  {...register("securityQuestion.answer", {
                    required: "پاسخ امنیتی الزامی است.",
                    minLength: { value: 3, message: "پاسخ باید حداقل ۳ حرف باشد." },
                  })}
                />
                {errors.securityQuestion?.answer && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.securityQuestion.answer.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* آدرس و بیوگرافی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* آدرس */}
            <div className="w-full flex flex-col">
              {editField === "address" ? (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">آدرس</label>
                  <textarea
                    name="address"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200 h-24 resize-none"
                    {...register("address", { required: "آدرس الزامی است." })}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  ></textarea>
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">این فیلد الزامی است.</p>
                  )}
                </>
              ) : (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">آدرس</label>
                  <span
                    onClick={() => setEditField("address")}
                    className="cursor-pointer p-4 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200 h-24 flex items-center"
                  >
                    {watchedFields.address || user?.address || "در این قسمت می‌توانید آدرس خود را وارد کنید"}
                  </span>
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">این فیلد الزامی است.</p>
                  )}
                </>
              )}
            </div>

            {/* بیوگرافی */}
            <div className="w-full flex flex-col">
              {editField === "bio" ? (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">بیوگرافی</label>
                  <textarea
                    name="bio"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-600 dark:border-zinc-500 text-gray-800 dark:text-gray-200 h-24 resize-none"
                    {...register("bio", { required: "بیوگرافی الزامی است." })}
                    onBlur={() => setEditField(null)}
                    autoFocus
                  ></textarea>
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1">این فیلد الزامی است.</p>
                  )}
                </>
              ) : (
                <>
                  <label className="mb-2 text-gray-700 dark:text-gray-300">بیوگرافی</label>
                  <span
                    onClick={() => setEditField("bio")}
                    className="cursor-pointer p-4 bg-gray-100 dark:bg-zinc-600 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-500 transition duration-200 h-24 flex items-center"
                  >
                    {watchedFields.bio || user?.bio || "اینجا بیوگرافی خود را وارد کنید"}
                  </span>
                  {errors.bio && (
                    <p className="text-red-500 text-sm mt-1">این فیلد الزامی است.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* دکمه ارسال فرم */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={(!isDirty && !base64Image) || isSubmit}
              className={`w-full md:w-1/2 p-3 rounded-lg text-white font-semibold transition duration-200 ${
                (!isDirty && !base64Image) || isSubmit
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
            >
              {isSubmit ? <HashLoader size={20} color="#fff" /> : "ذخیره تغییرات"}
            </button>
          </div>
        </form>

        <Toaster />
      </div>
    </FormTemplate>
  );
}

export default ProfilePage;