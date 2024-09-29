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
  const [selectedImage, setSelectedImage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(usericone);
  const [base64Image, setBase64Image] = useState(null);

  const [editField, setEditField] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors, dirtyFields, isDirty },
  } = useForm({
    mode: "all",
    defaultValues: {
      userImage: "", // اطمینان از مقدار پیش‌فرض
    },
  });

  // تعریف watchedFields با استفاده از watch()
  const watchedFields = watch();

  // دیباگ: مشاهده وضعیت فرم
  useEffect(() => {
  }, [watchedFields, isDirty, dirtyFields]);

  // دیباگ: مشاهده تغییرات base64Image
  useEffect(() => {
  }, [base64Image]);

  // به‌روزرسانی userImage با استفاده از setValue و گزینه shouldDirty
  useEffect(() => {
    setValue("userImage", base64Image, { shouldDirty: true });
  }, [base64Image, setValue]);

  const updateAvatar = (imgSrc) => {
    setAvatarUrl(imgSrc);
    setBase64Image(imgSrc);
    setModalOpen(false);
  };

  // دریافت اطلاعات کاربر تنها یک بار در ابتدا
  useEffect(() => {
    const fetchUserData = async () => {
      const res = await GetUserData();
      if (res.status === 200) {
        setUser(res.user);

        reset(res.user);

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
  
      // بررسی اینکه آیا userImage به‌روزرسانی شده است (به عنوان Base64)
      if (formData.userImage && formData.userImage.startsWith('data:image/')) {
        // اگر userImage به صورت Base64 است، آن را پردازش کنید
        profileData.userImage = formData.userImage.replace(/^data:image\/\w+;base64,/, '');
      } else {
        // اگر userImage به‌روزرسانی نشده است، آن را از profileData حذف کنید
        delete profileData.userImage;
      }
  
      console.log('Profile Data:', profileData); // دیباگ کردن داده‌های پروفایل
  
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
          {/* فیلد مخفی userImage بدون ویژگی value */}
          <input
            type="hidden"
            {...register("userImage")}
          />
          
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
                        onBlur={() => setEditField(null)}
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
                        onBlur={() => setEditField(null)}
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
                        onBlur={() => setEditField(null)}
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
          <div className="w-full md:flex gap-3  justify-center pt-20 ">
            <div className="flex gap-2 items-start text-start w-full md:w-1/2 ">
              <svg width="24" height="24" className="flex-shrink-0">
                <use href="#LocationSvg"></use>
              </svg>
              {editField === "address" ? (
                <textarea
                  name="address"
                  className="border border-gray-300 rounded p-1 w-full "
                  {...register("address", { required: true })}
                  onBlur={() => setEditField(null)}
                  autoFocus
                ></textarea>
              ) : (
                <span
                  onClick={() => setEditField("address")}
                  className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded break-words overflow-auto"
                >
                  {watchedFields.address || user?.address || "در این قسمت می‌توانید آدرستان را وارد کنید"}
                </span>
              )}
              {errors.address && (
                <p className="text-red-500 text-sm">این فیلد الزامی است.</p>
              )}
            </div>

            {/* ///////////////////////////////بیوگرافی//////////////////////////////// */}
            <div className="w-full flex gap-2 items-start text-start md:w-1/2 break-words">
              <svg width="24" height="24" className="flex-shrink-0">
                <use href="#TextPage"></use>
              </svg>

              {editField === "bio" ? (
                <textarea
                  name="bio"
                  className="border border-gray-300 rounded p-1 w-full "
                  {...register("bio", { required: true })}
                  onBlur={() => setEditField(null)}
                  autoFocus
                ></textarea>
              ) : (
                <span
                  onClick={() => setEditField("bio")}
                  className="block p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded break-words overflow-auto "
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
            disabled={(!isDirty && !base64Image) || isSubmit}
            className={`mt-5 p-2 rounded ${
              (!isDirty && !base64Image) || isSubmit
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
