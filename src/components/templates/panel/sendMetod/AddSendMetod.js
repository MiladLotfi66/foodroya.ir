"use client";

import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";// فرض کنید که این آیکون ها و Server Actions در مسیرهای گفته شده قرار دارند.
import PhotoSvg from "@/module/svgs/PhotoSvg";
import CloseSvg from "@/module/svgs/CloseSvg";
import { AddSendMetodAction, EditSendMetodAction } from "./SendMetodServerActions";
import * as yup from "yup";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

// تعریف اسکیمای Yup برای اعتبارسنجی فرم
const SendMetodSchema = yup.object().shape({
  Title: yup.string().required("فیلد عنوان اجباری است."),
  Description: yup.string(), // در صورت نیاز می توانید required کنید
  Price: yup
    .string()
    .required("فیلد قیمت اجباری است.")
    .test(
      "is-valid-price",
      "قیمت معتبر نیست. قیمت باید یک عدد یا کلمه 'رایگان' باشد.",
      (value) => {
        if (value === "رایگان") return true;
        return !isNaN(Number(value));
      }
    ),
  imageUrl: yup.mixed().required("انتخاب تصویر الزامی است."),
  SendMetodStatus: yup.boolean().required("وضعیت روش ارسال اجباری است."),
});

function SendMetodForm({ sendMetod = {}, onClose, refreshSendMetods }) {
  // وضعیت‌های لوکال
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState(sendMetod?.imageUrl || null);
  const [isMounted, setIsMounted] = useState(false);
  const { baseCurrency } = useShopInfoFromRedux();
  const params = useParams();// دریافت ShopId از مسیر (در Next.js)
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
      ShopId: sendMetod?.ShopId || "",
      Title: sendMetod?.Title || "",
      Description: sendMetod?.Description || "",
      Price: sendMetod?.Price || "",
      imageUrl: null, // برای فایل آپلودی
      SendMetodStatus: sendMetod?.SendMetodStatus !== undefined ? sendMetod.SendMetodStatus : true,
    },
    resolver: yupResolver(SendMetodSchema),
  }); // تنظیم فیلد تصویر در صورت موجود بودن مقدار قبلی
  useEffect(() => {
    if (sendMetod?.imageUrl) {
      setSelectedImage(sendMetod.imageUrl);
      setValue("imageUrl", sendMetod.imageUrl);
    }
  }, [sendMetod, setValue]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // تغییرات تصویر: نمایش پیش‌نمایش و تنظیم مقدار فایل جدید
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
      setValue("imageUrl", e.target.files[0]);
    }
  };

  // ارسال فرم به سرور: پشتیبانی از افزودن و ویرایش
  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      // در اینجا Yup به صورت خودکار از طریق yupResolver اعتبارسنجی صورت می‌دهد.
      const formDataObj = new FormData();

      // بررسی می‌کنیم که اگر در حالت ویرایش هستیم و مقدار تصویر به صورت رشته (آدرس تصویر) است،
      // همان آدرس قبلی را ارسال می‌کنیم؛ در غیر اینصورت فایل جدید را اضافه می‌کنیم.
      if (sendMetod?.imageUrl && typeof formData.imageUrl === "string") {
        formDataObj.append("imageUrl", sendMetod.imageUrl);
      } else if (formData.imageUrl) {
        formDataObj.append("imageUrl", formData.imageUrl);
      }
      formDataObj.append("ShopId", ShopId);
      formDataObj.append("Title", formData.Title);
      formDataObj.append("Description", formData.Description);
      formDataObj.append("Price", formData.Price);
      formDataObj.append("SendMetodStatus", formData.SendMetodStatus);
      if (sendMetod?._id) {
        formDataObj.append("id", sendMetod._id);
      }
      let result;
      if (sendMetod?._id) {
        // ویرایش روش ارسال
        result = await EditSendMetodAction(formDataObj, ShopId);
      } else {
        // افزودن روش ارسال جدید
        result = await AddSendMetodAction(formDataObj);
      }
      if (result.status === 201 ||result.status === 200) {
        await refreshSendMetods();
        const successMessage =
          sendMetod && sendMetod._id
            ? "روش ارسال با موفقیت ویرایش شد!"
            : "روش ارسال با موفقیت ایجاد شد!";
        toast.success(successMessage);
        setSelectedImage(null);
        reset();
        onClose();
      } else {
        const errorMessage =
          sendMetod && sendMetod._id
            ? " خطایی در ویرایش روش ارسال رخ داد."
            : "خطایی در ایجاد روش ارسال رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error handling SendMetod:", error);
      toast.error("مشکلی در پردازش روش ارسال وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const onFormSubmit = async (data) => {
    await handleFormSubmit(data);
  };

  return (
    <div className="overflow-y-auto max-h-screen p-4">
      {/* دکمه بستن پنجره */}
      <div className="flex justify-between mb-4">
        <button aria-label="close" onClick={onClose} className="hover:text-orange-300">
          <CloseSvg />
        </button>
        <h1 className="text-3xl font-bold">
          {sendMetod?._id ? "ویرایش روش ارسال" : "افزودن روش ارسال"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
        {/* SendMetodStatus */}
        <div className="flex items-center">
          <label htmlFor="SendMetodStatus" className="w-1/4 text-sm">
            وضعیت روش ارسال
          </label>
          <input
            type="checkbox"
            id="SendMetodStatus"
            defaultChecked={sendMetod?.SendMetodStatus !== undefined ? sendMetod.SendMetodStatus : true}
            {...register("SendMetodStatus")}
            className="w-5 h-5"
          />
          {errors.SendMetodStatus && (
            <div className="text-xs text-red-400">{errors.SendMetodStatus.message}</div>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="Title" className="text-sm">
            عنوان
          </label>
          <input
            type="text"
            id="Title"
            placeholder="عنوان روش ارسال"
            {...register("Title")}
            className="inputStyle"
          />
          {errors.Title && <div className="text-xs text-red-400">{errors.Title.message}</div>}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label htmlFor="Description" className="text-sm">
            توضیحات
          </label>
          <textarea
            id="Description"
            placeholder="توضیحات روش ارسال"
            {...register("Description")}
            className="textareaStyle p-2 mx-2 bg-gray-200 dark:bg-gray-600/90  rounded-md "
          />
          {errors.Description && (
            <div className="text-xs text-red-400">{errors.Description.message}</div>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <label htmlFor="Price" className="text-sm">
          قیمت (عدد یا “رایگان”)
                    </label>
                    <div className="flex items-center">

          <input
            type="text"
            id="Price"
            placeholder='مثال: 15000 یا "رایگان"'
            {...register("Price")}
            className="inputStyle"
            />
            <p>{baseCurrency.title}</p>
            </div>
          {errors.Price && <div className="text-xs text-red-400">{errors.Price.message}</div>}
        </div>

        {/* تصویر روش ارسال */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt="Selected"
                onClick={() => document.getElementById("imageUrl").click()}
                className="cursor-pointer rounded-md bg-gray-200"
                width={120}
                height={120}
              />
            ) : (
              <label
                htmlFor="imageUrl"
                className="cursor-pointer flex flex-col items-center justify-center rounded-md bg-gray-200 p-4 w-32 h-32"
              >
                <PhotoSvg />
                <span className="text-xs mt-2">انتخاب تصویر</span>
              </label>
            )}
            <input
              type="file"
              id="imageUrl"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.imageUrl && (
              <div className="text-xs text-red-400">{errors.imageUrl.message}</div>
            )}
          </div>
        </div>

        {/* دکمه ارسال فرم */}
        <button
          type="submit"
          disabled={isSubmit}
          className={
            isSubmit
              ? "flex items-center justify-center gap-2 bg-gray-400 text-white rounded-md py-2"
              : "bg-teal-600 hover:bg-teal-700 text-white rounded-md py-2"
          }
        >
          {isSubmit ? "در حال ثبت" : "ثبت"}
          {isSubmit && <HashLoader size={25} color="#fff" />}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default SendMetodForm;
