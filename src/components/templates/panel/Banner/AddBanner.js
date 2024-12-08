"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { useEffect, useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg";
import Image from "next/image";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from 'next/navigation';
import { AddBannerAction, EditBannerAction } from  "./BannerServerActions";
function AddBanner({ banner = {}, onClose, refreshBanners }) {
  // وضعیت‌ها و متغیرهای ضروری
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(banner?.imageUrl || null);
  const [isMounted, setIsMounted] = useState(false);

  const params = useParams();
  const { ShopId } = params;


  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      ShopId: banner?.ShopId || "",
      BannerBigTitle: banner?.BannerBigTitle || "",
      BannersmallDiscription: banner?.BannersmallDiscription || "",
      BannerStep: banner?.BannerStep || "",
      BannerDiscription: banner?.BannerDiscription || "",
      BannerImage: null,
      BannerTextColor: banner?.BannerTextColor || "#000000",
      BannerLink: banner?.BannerLink || "",
      BannerStatus:
        banner?.BannerStatus !== undefined ? banner?.BannerStatus : true,
    },
    resolver: yupResolver(BannerSchima),
  });

  useEffect(() => {
    if (banner?.imageUrl) {
      setSelectedImage(banner.imageUrl);
      setValue("BannerImage", banner.imageUrl);
    }
  }, [banner, setValue]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setValue("BannerImage", e.target.files[0]);
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await BannerSchima.validate(formData, { abortEarly: false });
      const formDataObj = new FormData();

      if (banner?.imageUrl && typeof formData.BannerImage === "string") {
        formDataObj.append("BannerImage", banner.imageUrl);
      } else if (formData.BannerImage) {
        formDataObj.append("BannerImage", formData.BannerImage);
      }

      formDataObj.append("ShopId", ShopId);
    
          formDataObj.append("BannerBigTitle", formData.BannerBigTitle);
      formDataObj.append("BannersmallDiscription", formData.BannersmallDiscription);
      formDataObj.append("BannerDiscription", formData.BannerDiscription);
      formDataObj.append("BannerStep", formData.BannerStep);
      formDataObj.append("BannerTextColor", formData.BannerTextColor);
      formDataObj.append("BannerStatus", formData.BannerStatus);
      formDataObj.append("BannerLink", formData.BannerLink);
      if (banner?._id) {
        formDataObj.append("id", banner._id);
      }

      let result;
      if (banner?._id) {
        // اگر بنر برای ویرایش است
        result = await EditBannerAction(formDataObj, ShopId);
      } else {
        // اگر بنر جدید باشد
        result = await AddBannerAction(formDataObj);
      }

      if (result.status === 201) {
        
        await refreshBanners();
        const successMessage = banner && banner.id ? "بنر با موفقیت ویرایش شد!" : "بنر با موفقیت ایجاد شد!";
        toast.success(successMessage);

        setSelectedImage(null);
        reset();
        onClose();
      } else {
        const errorMessage = banner && banner.id ? "خطایی در ویرایش بنر رخ داد." : "خطایی در ایجاد بنر رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error handling banner:", error);
      toast.error("مشکلی در پردازش بنر وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formsubmitting = async (formData) => {
    await handleFormSubmit(formData);
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        <CloseSvg />
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button
          aria-label="close"
          className="hover:text-orange-300"
          onClick={onClose}
        >
          <svg
            width="34"
            height="34"
          >
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {banner?._id ? "ویرایش بنر" : "افزودن بنر"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          formsubmitting(data);
        })}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* BannerStatus */}
        <div className="flex items-center">
          <label htmlFor="BannerStatus" className="w-1/5 text-xs md:text-sm">وضعیت بنر</label>
          <input
            className="inputStyle w-1/5"
            type="checkbox"
            name="BannerStatus"
            id="BannerStatus"
            defaultChecked={true}
            {...register("BannerStatus")}
          />
        </div>

        {/* BannerBigTitle */}
        <div className="flex items-center">
          <label htmlFor="BannerBigTitle" className="w-1/5 text-xs md:text-sm">عنوان بنر</label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="BannerBigTitle"
            id="BannerBigTitle"
            {...register("BannerBigTitle")}
          />
        </div>
        {errors.BannerBigTitle && (
          <div className="text-xs text-red-400">
            {errors.BannerBigTitle.message}
          </div>
        )}

        {/* BannersmallDiscription */}
        <div className="flex items-center">
          <label htmlFor="BannersmallDiscription" className="w-1/5 text-xs md:text-sm">توضیح مختصر</label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="BannersmallDiscription"
            id="BannersmallDiscription"
            {...register("BannersmallDiscription")}
          />
        </div>
        {errors.BannersmallDiscription && (
          <div className="text-xs text-red-400">
            {errors.BannersmallDiscription.message}
          </div>
        )}

        {/* BannerDiscription */}
        <div className="flex items-center">
          <label htmlFor="BannerDiscription" className="w-1/5 text-xs md:text-sm">توضیحات بنر</label>
          <textarea
            className="textAriaStyle grow w-4/5"
            name="BannerDiscription"
            id="BannerDiscription"
            {...register("BannerDiscription")}
          />
        </div>
        {errors.BannerDiscription && (
          <div className="text-xs text-red-400">
            {errors.BannerDiscription.message}
          </div>
        )}

        {/* BannerStep */}
        <div className="flex items-center">
          <label htmlFor="BannerStep" className="w-1/5 text-xs md:text-sm">نوبت بنر</label>
          <input
            className="inputStyle grow w-4/5"
            type="number"
            name="BannerStep"
            id="BannerStep"
            {...register("BannerStep")}
          />
        </div>
        {errors.BannerStep && (
          <div className="text-xs text-red-400">
            {errors.BannerStep.message}
          </div>
        )}

        {/* BannerLink */}
        <div className="flex items-center">
          <label htmlFor="BannerLink" className="w-1/5 text-xs md:text-sm">لینک بنر</label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="BannerLink"
            id="BannerLink"
            {...register("BannerLink")}
          />
        </div>
        {errors.BannerLink && (
          <div className="text-xs text-red-400">
            {errors.BannerLink.message}
          </div>
        )}

        {/* BannerImage */}
        <div className="flex items-center">
          <div className="w-1/2">
            {selectedImage ? (
              <Image
                onClick={() => document.getElementById('BannerImage').click()}
                src={selectedImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="BannerImage"
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب تصویر</span>
              </label>
            )}

            <input
              className="hidden"
              id="BannerImage"
              type="file"
              name="BannerImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.BannerImage && (
              <div className="text-xs text-red-400">
                {errors.BannerImage.message}
              </div>
            )}
          </div>

          {/* BannerTextColor */}
          <div className="w-1/2">
            <label
              htmlFor="BannerTextColor"
              className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
            >
              <input
                className="grow"
                type="color"
                name="BannerTextColor"
                id="BannerTextColor"
                {...register("BannerTextColor")}
              />
              <span className="hidden md:inline-block">انتخاب رنگ متن</span>
            </label>
          </div>
          {errors.BannerTextColor && (
            <div className="text-xs text-red-400">
              {errors.BannerTextColor.message}
            </div>
          )}
        </div>

        {/* دکمه ارسال فرم */}
        <button
          type="submit"
          className={
            isSubmit
              ? "flexCenter gap-x-2 h-11 md:h-14 bg-gray-400 rounded-xl text-white mt-4"
              : "h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4"
          }
          disabled={isSubmit}
        >
          {isSubmit ? "در حال ثبت" : "ثبت"}
          {isSubmit ? <HashLoader size={25} color="#fff" /> : ""}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddBanner;

