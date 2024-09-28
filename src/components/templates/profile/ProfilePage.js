"use client";

import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState, useRef } from "react";
import NextImage from "next/image";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useSession } from "next-auth/react";
import { GetUserData, UpdateUserProfile } from "@/components/signinAndLogin/Actions/UsersServerActions";
import usericone from "@/public/Images/jpg/user.webp";
import PencilIcon from "@/module/svgs/PencilIcon";
import Modal from "./Modal";
import LocationSvg from "@/module/svgs/location";
import TextPage from "@/module/svgs/TextPageSvg";
import PhoneSvg from "@/module/svgs/phoneSvg1";
import "react-image-crop/dist/ReactCrop.css";
import Link from "next/link";

function ProfilePage() {
  const { data: session } = useSession();
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // تصویر انتخاب شده قبل از باز شدن مودال
  const [avatarUrl, setAvatarUrl] = useState(usericone); // تغییر به useState

  const [editField, setEditField] = useState(null); // مدیریت فیلد در حال ویرایش
  const fileInputRef = useRef(null);

  const updateAvatar = (imgSrc) => {
    setAvatarUrl(imgSrc); // به‌روزرسانی state
    // Optional: به‌روزرسانی محلی یا ارسال به سرور
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset, // اضافه کردن reset

    watch, // اضافه کردن watch
    formState: { errors, dirtyFields, isDirty },
  } = useForm({
    mode: "all",
  });

  // مشاهده مقادیر فرم
  const watchedFields = watch();

  // دریافت اطلاعات کاربر تنها یک بار در ابتدا
  useEffect(() => {
    const fetchUserData = async () => {
      const res = await GetUserData();
      if (res.status === 200) {
        setUser(res.user);
        console.log(res.user);

        // استفاده از reset به جای setValue برای تنظیم مقادیر اولیه
        reset(res.user);

        // به‌روزرسانی avatarUrl با تصویر دریافت شده از سرور
        if (res.user.userImage) {
          setAvatarUrl(res.user.userImage);
        }
      }
    };
    fetchUserData();
  }, [reset]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      const result = await UpdateUserProfile(formData); // فراخوانی سرور اکشن

      if (result.status === 200) {
        toast.success(result.message);
        setUser(result.data);
        // استفاده از reset برای به‌روزرسانی مقادیر اولیه پس از موفقیت
        reset(result.data);
        setEditField(null); // بستن حالت ویرایش پس از موفقیت
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
          <div className="hidden">
            <LocationSvg />
            <PhoneSvg />
            <TextPage />
          </div>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex gap-2 items-center justify-around mt-10 mb-20">
            {/* /////////////////////userImage (دایره‌ای) //////////////////////////// */}
            <div className="flex items-center justify-center ">
              <div className="relative w-32 h-32 cursor-pointer">
                {/* /////////////////////////userAvatar///////////////////// */}
                <div className="flex flex-col items-center mb-10">
                  {/* ///////////////userUniqName/////////// */}
                  <div className="w-full text-center ">
                    {editField === "userUniqName" ? (
                      <input
                        type="text"
                        name="userUniqName"
                        className="border border-gray-300 rounded p-1 w-full"
                        {...register("userUniqName", { required: true })}
                        onBlur={() => setEditField(null)} // فقط بستن حالت ویرایش
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditField("userUniqName")}
                        className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        {watchedFields.userUniqName || user?.userUniqName || "---"}
                      </span>
                    )}
                    {errors.userUniqName && (
                      <p className="text-red-500 text-sm">
                        این فیلد الزامی است.
                      </p>
                    )}
                  </div>
                  {/* ///////////////userImage/////////// */}

                  <div className="relative mb-5">
                    <NextImage
                      src={avatarUrl}
                      alt="Avatar"
                      width={150}
                      height={150}
                      className="border-2 border-gray-400 rounded-full object-cover"
                      name="userImage"
                      id="userImage"
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
                  {/* ///////////////username/////////// */}

                  <div className="w-full text-center">
                    {editField === "username" ? (
                      <input
                        type="text"
                        name="username"
                        className="border border-gray-300 rounded p-1 w-full"
                        {...register("username", { required: true })}
                        onBlur={() => setEditField(null)} // فقط بستن حالت ویرایش
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditField("username")}
                        className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        {watchedFields.username || user?.username || "---"}
                      </span>
                    )}
                    {errors.username && (
                      <p className="text-red-500 text-sm">
                        این فیلد الزامی است.
                      </p>
                    )}
                  </div>
                  {/* ///////////////phone/////////// */}
                  <div className="w-full flex items-center text-center">
                    <svg className="rotate-90" width="24" height="24">
                      <use href="#PhoneSvg"></use>
                    </svg>
                    {editField === "phone" ? (
                      <input
                        type="text"
                        name="phone"
                        className="border border-gray-300 rounded p-1 w-full"
                        {...register("phone", { required: true })}
                        onBlur={() => setEditField(null)} // فقط بستن حالت ویرایش
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setEditField("phone")}
                        className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      >
                        {watchedFields.phone || user?.phone || "---"}
                      </span>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        این فیلد الزامی است.
                      </p>
                    )}
                  </div>
                  {/* ///////////////hiddenComponents//////////////// */}
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
            {/* ////////////////////////////following////////////////////////////// */}
            <div className="flexCenter gap-5 mt-10">
              <Link href="/Shop/userShop">
                <div className="flex-col gap-2 text-center">
                  <p>1</p>
                  <p>فروشگاه‌های من</p>
                </div>
              </Link>

              <Link href="/Shop/allserShop">
                <div className="flex-col gap-2 text-center">
                  <p>126</p>
                  <p>فروشگاه‌های دنبال شده</p>
                </div>
              </Link>
            </div>
          </div>
          {/* ///////////////////////////////آدرس//////////////////////////////// */}
          <div className="w-full md:flex text-center justify-center pt-20">
            <div className="flex gap-2 items-start w-full md:w-1/2 ">
              <svg width="24" height="24">
                <use href="#LocationSvg"></use>
              </svg>
              {editField === "address" ? (
                <textarea
                  name="address"
                  className="border border-gray-300 rounded p-1 w-full"
                  {...register("address", { required: true })}
                  onBlur={() => setEditField(null)} // فقط بستن حالت ویرایش
                  autoFocus
                ></textarea>
              ) : (
                <span
                  onClick={() => setEditField("address")}
                  className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                  {watchedFields.address || user?.address || "در این قسمت می‌توانید آدرستان را وارد کنید"}
                </span>
              )}
              {errors.address && (
                <p className="text-red-500 text-sm">این فیلد الزامی است.</p>
              )}
            </div>

            {/* ///////////////////////////////بیوگرافی//////////////////////////////// */}
            <div className="w-full flex gap-2 items-start md:w-1/2">
              <svg width="24" height="24">
                <use href="#TextPage"></use>
              </svg>

              {editField === "bio" ? (
                <textarea
                  name="bio"
                  className="border border-gray-300 rounded p-1 w-full"
                  {...register("bio", { required: true })}
                  onBlur={() => setEditField(null)} // فقط بستن حالت ویرایش
                  autoFocus
                ></textarea>
              ) : (
                <span
                  onClick={() => setEditField("bio")}
                  className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                >
                  {watchedFields.bio || user?.bio || "اینجا بیوگرافیتان را وارد کنید"}
                </span>
              )}
              {errors.bio && (
                <p className="text-red-500 text-sm">این فیلد الزامی است.</p>
              )}
            </div>
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={!isDirty || isSubmit}
            className={`mt-5 p-2 rounded ${
              !isDirty || isSubmit
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmit ? <HashLoader size={20} color="#fff" /> : "ذخیره"}
          </button>
        </form>

        
        {/* //////////////////////////////////////////////////////////////// */}

        <Toaster />
      </div>
    </FormTemplate>
  );
}

export default ProfilePage;
