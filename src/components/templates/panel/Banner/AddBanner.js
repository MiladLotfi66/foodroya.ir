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
import { AddBannerAction, EditBannerAction } from "@/components/signinAndLogin/Actions/BannerServerActions";

function AddBanner({ banner = {}, onClose, refreshBanners }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(banner?.imageUrl || null);
  const [isMounted, setIsMounted] = useState(false);

  const params = useParams();
  const { shopUniqName } = params;

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
  }, [banner, setValue]); // اضافه کردن setValue به آرایه‌ی dependencies

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
      formDataObj.append("shopUniqName", shopUniqName);
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
        result = await EditBannerAction(formDataObj, shopUniqName);
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
        {/* فرم کامل شما ... */}
        <Toaster />
      </form>
    </div>
  );
}

export default AddBanner;
