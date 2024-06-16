"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg";

function AddBanner() {
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // *******************hook use form********************

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      BannerBigTitle: "",
      BannersmallDiscription: "",
      BannerStep: "",
      BannerDiscription: "",
      BannerImage: null,
    },
    resolver: yupResolver(BannerSchima),
  });

  // *******************submit ********************

  const formsubmitting = async (formData) => {
    setIsSubmit(true);
  
    try {
      const formDataObj = new FormData();
      formDataObj.append('BannerImage', formData.BannerImage[0]);
      formDataObj.append('BannerBigTitle', formData.BannerBigTitle);
      formDataObj.append('BannersmallDiscription', formData.BannersmallDiscription);
      formDataObj.append('BannerDiscription', formData.BannerDiscription);
      formDataObj.append('BannerStep', formData.BannerStep);
  
      const res = await fetch('/api/panel/banner', {
        method: 'PUT',
        body: formDataObj,
      });
  
      const result = await res.json();
      if (res.ok) {
        toast.success("بنر با موفقیت ثبت شد");
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
    <div className="absolute bg-no-repeat bg-cover bg-center bg-[url('../../public/Images/jpg/chefSign.jfif')] w-[100%] h-[90%] md:h-full">
      <div className="container">
        <div className="hidden">
          <PhotoSvg />
        </div>
        <div className="bg-white dark:bg-zinc-700 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%]">
          {/* *******************header******************** */}

          <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
            <h1 className="text-3xl font-MorabbaBold">بنر صفحه اصلی</h1>
          </div>

          {/* *******************main******************** */}

          <form
            onSubmit={handleSubmit(formsubmitting)}
            className="login-form flex flex-col gap-4 p-2 md:p-4"
          >
            {/* *******************BannerBigTitle******************** */}

            <div className="flex items-center">
              <svg className="w-5 h-5"></svg>
              <input
                className="inputStyle grow"
                type="text"
                name="BannerBigTitle"
                placeholder="عنوان بنر"
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
              <svg className="w-5 h-5"></svg>
              <input
                className="inputStyle grow"
                type="text"
                name="BannersmallDiscription"
                placeholder="توضیح مختصر"
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
              <svg className="w-5 h-5"></svg>
              <textarea
                className="textAriaStyle grow"
                name="BannerDiscription"
                placeholder="توضیحات بنر"
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
              <svg className="w-5 h-5"></svg>
              <input
                className="inputStyle grow"
                type="number"
                name="BannerStep"
                placeholder="نوبت بنر"
                {...register("BannerStep")}
              />
            </div>
            {errors.BannerStep && (
              <div className="text-xs text-red-400">
                {errors.BannerStep.message}
              </div>
            )}

            {/* *******************BannerImage******************** */}

            {selectedImage ? (
              <img
                onClick={() => document.getElementById('BannerImage').click()}
                src={selectedImage}
                alt="Selected"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-40"
              />
            ) : (
              <label
                htmlFor="BannerImage"
                className="grow container flexCenter gap-3 cursor-pointer bg-gray-200 dark:bg-gray-600 py-2 rounded-md h-20 w-40"
              >
                <PhotoSvg />
                انتخاب تصویر
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
          </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default AddBanner;
