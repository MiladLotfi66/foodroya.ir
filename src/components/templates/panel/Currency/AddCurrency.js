// app/currencies/AddCurrency.jsx
"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader"; // در صورت نیاز به Loader
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import CurrencySchema from "./CurrencySchema";
import { useEffect, useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg"; // در صورت نیاز به یک SVG برای عکس
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from 'next/navigation';
import { AddCurrencyAction,EditCurrencyAction } from "@/components/signinAndLogin/Actions/currencies";


function AddCurrency({ currency = {}, onClose, refreshCurrencies }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      title: currency?.title || "",
      shortName: currency?.shortName || "",
      exchangeRate: currency?.exchangeRate || "",
      decimalPlaces: currency?.decimalPlaces || 2,
      status: currency?.status || "فعال",
      shopUniqName: shopUniqName || "",
    },
    resolver: yupResolver(CurrencySchema),
  });

 

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await CurrencySchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();

    

      formDataObj.append("shopUniqName", formData.shopUniqName);
      formDataObj.append("title", formData.title);
      formDataObj.append("shortName", formData.shortName);
      formDataObj.append("exchangeRate", formData.exchangeRate);
      formDataObj.append("decimalPlaces", formData.decimalPlaces);
      formDataObj.append("status", formData.status);

      if (currency?._id) {
        formDataObj.append("id", currency._id);
      }

      let result;
      if (currency?._id) {
        // اگر ارز برای ویرایش است
        result = await EditCurrencyAction(formDataObj, shopUniqName);
      } else {
        // اگر ارز جدید باشد
        result = await AddCurrencyAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshCurrencies();
        const successMessage = currency && currency.id ? "ارز با موفقیت ویرایش شد!" : "ارز با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        const errorMessage = currency && currency.id ? "خطایی در ویرایش ارز رخ داد." : "خطایی در ایجاد ارز رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error handling currency:", error);
      toast.error("مشکلی در پردازش ارز وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formSubmitting = async (formData) => {
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
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {currency?._id ? "ویرایش ارز" : "افزودن ارز"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(formSubmitting)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        <div>
          <label className="block mb-1">عنوان ارز</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block mb-1">نام اختصاری ارز</label>
          <input
            type="text"
            {...register("shortName")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.shortName && <p className="text-red-500">{errors.shortName.message}</p>}
        </div>

        <div>
          <label className="block mb-1">نرخ برابری با ارز پایه</label>
          <input
            type="number"
            step="0.000001"
            {...register("exchangeRate")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.exchangeRate && <p className="text-red-500">{errors.exchangeRate.message}</p>}
        </div>

        <div>
          <label className="block mb-1">تعداد اعشار</label>
          <input
            type="number"
            min="0"
            max="6"
            {...register("decimalPlaces")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.decimalPlaces && <p className="text-red-500">{errors.decimalPlaces.message}</p>}
        </div>

        <div>
          <label className="block mb-1">وضعیت</label>
          <select
            {...register("status")}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="فعال">فعال</option>
            <option value="غیرفعال">غیرفعال</option>
          </select>
          {errors.status && <p className="text-red-500">{errors.status.message}</p>}
        </div>

        {/* سایر فیلدهای مربوط به ارز می‌تواند اینجا اضافه شود */}

      

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          disabled={isSubmit}
        >
          {isSubmit ? <HashLoader size={20} color="#fff" /> : (currency?._id ? "ویرایش ارز" : "افزودن ارز")}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddCurrency;
