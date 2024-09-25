"use client";

import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import Image from "next/image";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useSession } from "next-auth/react";
import { GetUserData } from "@/components/signinAndLogin/Actions/UsersServerActions";
import usericone from "@/public/Images/jpg/user.webp";

function ProfilePage() {
  const { data: session } = useSession();
  const [isSubmit, setIsSubmit] = useState(false);
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageError, setImageError] = useState(false);  // برای مدیریت خطا در بارگذاری تصویر

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
    try {
      const response = await updateUserData(formData);
      toast.success("اطلاعات با موفقیت ذخیره شد");
      setUser(response.data);
    } catch (error) {
      toast.error("خطا در ذخیره اطلاعات");
    }
    setIsSubmit(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImageError(false);  // در صورت انتخاب تصویر جدید، خطای قبلی حذف می‌شود
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById("userImageInput").click();
  };

  return (
    <FormTemplate>
      <div className="bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl mt-36 p-5">
        <div className="flex justify-between md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">نمایه</h1>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* /////////////////////userImage (دایره‌ای) //////////////////////////// */}
          <div className="flex items-center justify-center mb-5">
            <input
              type="file"
              id="userImageInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <div className="relative w-32 h-32 cursor-pointer" onClick={handleImageClick}>
            <Image
  src={previewImage ? previewImage : (user?.userImage && !imageError ? user?.userImage : usericone)}
  alt="تصویر کاربر"
  fill
  className="rounded-full object-cover"
  onError={() => setImageError(true)}  // در صورت خطا، به تصویر پیش‌فرض سوئیچ می‌کنیم
/>
            </div>
          </div>


          {/* /////////////////////userUniqName//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="userUniqName" className="w-1/5 text-xs md:text-sm">نام کاربری</label>
            <input className="inputStyle grow w-4/5" type="text" name="userUniqName" id="userUniqName" {...register("userUniqName")} />
          </div>
          {errors.userUniqName && <div className="text-xs text-red-400">{errors.userUniqName.message}</div>}
          
          {/* /////////////////////username//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="username" className="w-1/5 text-xs md:text-sm">نام کاربر</label>
            <input className="inputStyle grow w-4/5" type="text" name="username" id="username" {...register("username")} />
          </div>
          {errors.username && <div className="text-xs text-red-400">{errors.username.message}</div>}

          {/* /////////////////////phone//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="phone" className="w-1/5 text-xs md:text-sm">شماره تماس</label>
            <input className="inputStyle grow w-4/5" type="text" name="phone" id="phone" {...register("phone")} />
          </div>
          {errors.phone && <div className="text-xs text-red-400">{errors.phone.message}</div>}

          {/* /////////////////////email//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="email" className="w-1/5 text-xs md:text-sm">ایمیل</label>
            <textarea className="textAriaStyle grow w-4/5" name="email" id="email" {...register("email")} />
          </div>
          {errors.email && <div className="text-xs text-red-400">{errors.email.message}</div>}

          {/* /////////////////////userShops//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="userShops" className="w-1/5 text-xs md:text-sm">فروشگاه های من</label>
            <input className="inputStyle grow w-4/5" type="text" name="userShops" id="userShops" {...register("userShops")} />
          </div>
          {errors.userShops && <div className="text-xs text-red-400">{errors.userShops.message}</div>}

          {/* /////////////////////folloewdShops//////////////////////////// */}
          <div className="flex items-center">
            <label htmlFor="folloewdShops" className="w-1/5 text-xs md:text-sm">فروشگاههای دنبال شده</label>
            <input className="inputStyle grow w-4/5" type="text" name="folloewdShops" id="folloewdShops" {...register("folloewdShops")} />
          </div>
          {errors.folloewdShops && <div className="text-xs text-red-400">{errors.folloewdShops.message}</div>}

          {/* دکمه ارسال */}
          <button type="submit" className="mt-5 p-2 bg-blue-500 hover:bg-blue-700 text-white rounded">
            {isSubmit ? <HashLoader size={20} color="#fff" /> : "ذخیره"}
          </button>
        </form>
        <Toaster />
      </div>
    </FormTemplate>
  );
}

export default ProfilePage;
