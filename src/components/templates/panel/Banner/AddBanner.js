"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg";
import Image from "next/image";

function AddBanner() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    reset,  // اضافه کردن متد reset
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      BannerBigTitle: "",
      BannersmallDiscription: "",
      BannerStep: "",
      BannerDiscription: "",
      BannerImage: null,
      BannerTextColor: "#000000",
      BannerLink: "",
      BannerStatus: true,
    },
    resolver: yupResolver(BannerSchima),
  });

  // *******************submit ********************

  const formsubmitting = async (formData) => {
    setIsSubmit(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("BannerImage", formData.BannerImage[0]);
      formDataObj.append("BannerBigTitle", formData.BannerBigTitle);
      formDataObj.append("BannersmallDiscription", formData.BannersmallDiscription);
      formDataObj.append("BannerDiscription", formData.BannerDiscription);
      formDataObj.append("BannerStep", formData.BannerStep);
      formDataObj.append("BannerTextColor", formData.BannerTextColor);
      formDataObj.append("BannerStatus", formData.BannerStatus);
      formDataObj.append("BannerLink", formData.BannerLink);


      const res = await fetch("/api/panel/banner", {
        method: "PUT",
        body: formDataObj,
      });

      const result = await res.json();
      if (res.ok) {
         // ریست کردن فرم بعد از ثبت موفقیت‌آمیز
        toast.success("بنر با موفقیت ثبت شد");
        window.location.reload();

        // setSelectedImage(null);  // ریست کردن تصویر انتخاب شده
      } else {
        toast.error(result.message || "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error("خطایی در ارسال درخواست به سرور رخ داد");
    } finally {
      setIsSubmit(false);
    }
  };

  ////////////////////////////////////

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setValue("BannerImage", e.target.files); // ثبت فایل انتخابی در فرم
    }
  };

  ////////////////////////////////////

  return (

    
    <div className="overflow-y-auto max-h-screen">

        {/* *******************header******************** */}

        <div className="flex justify-between p-2 md:p-5 mt-4 ">
          <h1 className="text-3xl font-MorabbaBold">افزودن بنر</h1>
        </div>

        {/* *******************main******************** */}
        <form
          onSubmit={handleSubmit(formsubmitting)}
          className=" flex flex-col gap-4 p-2 md:p-4"
        >
          {/* *******************BannerStatus******************** */}

          <div className="flex items-center ">
            <label htmlFor="BannerStatus" className="w-1/5 text-xs md:text-sm">وضعیت بنر</label>
            <input
              className="inputStyle w-1/5 "
              type="checkbox"
              name="BannerStatus"
              id="BannerStatus"
              defaultChecked={true}
              {...register("BannerStatus")}
            />
          </div>

          {/* *******************BannerBigTitle******************** */}

          <div className="flex items-center">
            <label htmlFor="BannerBigTitle" className="w-1/5 text-xs md:text-sm">عنوان بنر</label>
            <input
              className="inputStyle grow w-4/5 "
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

          {/* *******************BannersmallDiscription******************** */}

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

          {/* *******************BannerDiscription******************** */}

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

          {/* *******************BannerStep******************** */}

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
                    {/* *******************BannerLink******************** */}

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

          {/* *******************BannerImage******************** */}

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

            {/* *******************BannerTextColor******************** */}

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

          {/* *******************button**************************** */}

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
