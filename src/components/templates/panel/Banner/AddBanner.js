"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { useEffect, useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg";
import Image from "next/image";


function AddBanner({ banner = {} }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bannerStatus, setBannerStatus] = useState(banner?.BannerStatus !== undefined ? banner.BannerStatus : true);


  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    defaultValues: { 
      BannerBigTitle: banner?.BannerBigTitle || "",
      BannersmallDiscription: banner?.BannersmallDiscription || "",
      BannerStep: banner?.BannerStep || "",
      BannerDiscription: banner?.BannerDiscription || "",
      BannerImage: null,
      BannerTextColor: banner?.BannerTextColor || "#000000",
      BannerLink: banner?.BannerLink || "",
      BannerStatus: banner?.BannerStatus !== undefined ? banner?.BannerStatus : true,
    },
    resolver: yupResolver(BannerSchima),
  });

  const handleFormSubmit = async (formData) => {


    setIsSubmit(true);
    try {
      // اعتبارسنجی مقادیر فرم با استفاده از Yup schema
      await BannerSchima.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();
      formDataObj.append("BannerImage", formData.BannerImage[0]);
      formDataObj.append("BannerBigTitle", formData.BannerBigTitle);
      formDataObj.append("BannersmallDiscription", formData.BannersmallDiscription);
      formDataObj.append("BannerDiscription", formData.BannerDiscription);
      formDataObj.append("BannerStep", formData.BannerStep);
      formDataObj.append("BannerTextColor", formData.BannerTextColor);
      formDataObj.append("BannerStatus", formData.BannerStatus);
      formDataObj.append("BannerLink", formData.BannerLink);

      const res = await fetch(`/api/panel/banner${banner?._id ? `/${banner._id}` : ''}`, {
        method: banner?._id ? "PATCH" : "PUT",
        body: formDataObj,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("بنر با موفقیت ثبت شد");
        setSelectedImage(null);
        reset(); // پاک کردن مقادیر فرم پس از ثبت
      } else {
        toast.error(result.message || "خطایی رخ داده است");
      }
    } catch (error) {
      if (error ) {
        // نمایش خطاهای اعتبارسنجی
          toast.error(error.message);
        
      } else {
        toast.error("خطایی در ارسال درخواست به سرور رخ داد");
      }
    }
    setIsSubmit(false);
  };



  useEffect(() => {
    if (banner?.imageUrl) {
      setSelectedImage(banner.imageUrl);
      setValue("BannerImage", banner.BannerImage); // setValue برای تنظیم مقدار تصویر بنر
    }
  }, [banner, setValue]);

  const formsubmitting = async (formData) => {
    console.log("formsubmitting called");
    setIsSubmit(true);
    await handleFormSubmit(formData);
    setIsSubmit(false);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setValue("BannerImage", e.target.files); // ثبت فایل انتخابی در فرم
    }
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="flex justify-between p-2 md:p-5 mt-4">
        <h1 className="text-3xl font-MorabbaBold">
          {banner?._id ? "ویرایش بنر" : "افزودن بنر"}
        </h1>
      </div>
      <form onSubmit={handleSubmit((data) => {
        formsubmitting(data);
      })} className="flex flex-col gap-4 p-2 md:p-4">
        <div className="flex items-center">
          <label htmlFor="BannerStatus" className="w-1/5 text-xs md:text-sm">وضعیت بنر</label>
          <input
            className="inputStyle w-1/5"
            type="checkbox"
            name="BannerStatus"
            id="BannerStatus"
            checked={bannerStatus}
                        {...register("BannerStatus")}
          />
        </div>
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
        <div className="flex items-center">
          <div className="w-1/2">
            {selectedImage ? (
              <Image
                onClick={() => document.getElementById('imageUrl').click()}
                src={selectedImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
                width={60}
                height={60}
                quality={60}
              />
            ) : (
              <label
                htmlFor="imageUrl"
                className="text-xs md:text-sm grow container flexCenter gap-2 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-20 md:w-44"
              >
                <PhotoSvg />
                <span className="hidden md:inline-block">انتخاب تصویر</span>
              </label>
            )}
            <input
              className="hidden"
              id="imageUrl"
              type="file"
              name="imageUrl"
              accept="image/*"
              onChange={handleImageChange}
            />
            {errors.imageUrl && (
              <div className="text-xs text-red-400">
                {errors.imageUrl.message}
              </div>
            )}
          </div>
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
