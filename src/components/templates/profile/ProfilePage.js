"use client";

import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState, useRef } from "react";
import NextImage from "next/image";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useSession } from "next-auth/react";
import { GetUserData } from "@/components/signinAndLogin/Actions/UsersServerActions";
import usericone from "@/public/Images/jpg/user.webp";
import PencilIcon from "@/module/svgs/PencilIcon";
import Modal from "./Modal";

import "react-image-crop/dist/ReactCrop.css";

function ProfilePage() {
  const { data: session } = useSession();
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(false); // برای مدیریت خطا در بارگذاری تصویر

  const [crop, setCrop] = useState({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [croppedImage, setCroppedImage] = useState(null);
  const imageRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // تصویر انتخاب شده قبل از باز شدن مودال
  const avatarUrl = useRef(usericone);

  const updateAvatar = (imgSrc) => {
    avatarUrl.current = imgSrc;
    // Optionally update user state or send to server
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "all",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await GetUserData();
      if (res.status === 200) {
        setUser(res.user);
        for (const [key, value] of Object.entries(res.user)) {
          setValue(key, value);
        }
      }
    };
    fetchUserData();
  }, [setValue]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    // ... اعتبار سنجی و ارسال داده‌ها به سرور
    setIsSubmit(false);
  };

  // مرجع به input فایل
  const fileInputRef = useRef(null);

  // عملکرد برای باز کردن دیالوگ انتخاب فایل
  const handleEditImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // عملکرد برای انتخاب فایل
  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result;
      // بررسی اندازه تصویر
      const image = new window.Image(); // استفاده از سازنده بومی
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

    // ریست کردن مقدار input
    e.target.value = "";
  };

  return (
    <FormTemplate>
      <div className="bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl mt-36 p-5">
        <div className="flex justify-between md:mt-10">
          <h1 className="text-3xl font-MorabbaBold">نمایه</h1>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* /////////////////////userImage (دایره‌ای) //////////////////////////// */}
          <div className="flex items-center justify-center mb-5 pb-5">
            <div className="relative w-32 h-32 cursor-pointer">
              <div className="flex flex-col items-center ">
                <div className="relative">
                <NextImage
                    src={avatarUrl.current}
                    alt="Avatar"
                    width={150}
                    height={150}
                    className="border-2 border-gray-400 rounded-full object-cover"
                    name="userUniqName"
                    id="userUniqName"
                    {...register("userUniqName")}
                  />
                  <button
                    type="button"
                    className="absolute -bottom-3 left-0 right-0 m-auto w-fit p-[.35rem] rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600"
                    title="Change photo"
                    onClick={handleEditImage}
                  >
                    <PencilIcon />
                  </button>
                </div>
              </div>
            </div>
            {/* input فایل مخفی */}
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
          </div>

          {/* /////////////////////userUniqName//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="userUniqName" className="w-1/5 text-xs md:text-sm">
              نام کاربری
            </label>

            <input
              className="inputStyle grow w-4/5"
              type="text"
              name="userUniqName"
              id="userUniqName"
              {...register("userUniqName")}
            />
          </div>
          {errors.userUniqName && (
            <div className="text-xs text-red-400">
              {errors.userUniqName.message}
            </div>
          )}

          {/* /////////////////////username//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="username" className="w-1/5 text-xs md:text-sm">
              نام کاربر
            </label>
            <input
              className="inputStyle grow w-4/5"
              type="text"
              name="username"
              id="username"
              {...register("username")}
            />
          </div>
          {errors.username && (
            <div className="text-xs text-red-400">
              {errors.username.message}
            </div>
          )}

          {/* /////////////////////phone//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="phone" className="w-1/5 text-xs md:text-sm">
              شماره تماس
            </label>
            <input
              className="inputStyle grow w-4/5"
              type="text"
              name="phone"
              id="phone"
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <div className="text-xs text-red-400">{errors.phone.message}</div>
          )}

          {/* /////////////////////email//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="email" className="w-1/5 text-xs md:text-sm">
              ایمیل
            </label>
            <textarea
              className="textAriaStyle grow w-4/5"
              name="email"
              id="email"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="text-xs text-red-400">{errors.email.message}</div>
          )}

          {/* /////////////////////userShops//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="userShops" className="w-1/5 text-xs md:text-sm">
              فروشگاه های من
            </label>
            <input
              className="inputStyle grow w-4/5"
              type="text"
              name="userShops"
              id="userShops"
              {...register("userShops")}
            />
          </div>
          {errors.userShops && (
            <div className="text-xs text-red-400">
              {errors.userShops.message}
            </div>
          )}

          {/* /////////////////////folloewdShops//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="folloewdShops" className="w-1/5 text-xs md:text-sm">
              فروشگاههای دنبال شده
            </label>
            <input
              className="inputStyle grow w-4/5"
              type="text"
              name="folloewdShops"
              id="folloewdShops"
              {...register("folloewdShops")}
            />
          </div>
          {errors.folloewdShops && (
            <div className="text-xs text-red-400">
              {errors.folloewdShops.message}
            </div>
          )}

          {/* دکمه ارسال */}
          <button
            type="submit"
            className="mt-5 p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
          >
            {isSubmit ? <HashLoader size={20} color="#fff" /> : "ذخیره"}
          </button>
        </form>
        <Toaster />
      </div>
    </FormTemplate>
  );
}

export default ProfilePage;
