// app/priceTemplates/AddPriceTemplate.jsx
"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader"; // در صورت نیاز به Loader
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import PriceTemplateSchema from "./PriceTemplateSchema";
import { useEffect, useState } from "react";
import PhotoSvg from "@/module/svgs/PhotoSvg"; // در صورت نیاز به یک SVG برای عکس
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from 'next/navigation';
import { AddPriceTemplateAction, EditPriceTemplateAction } from "@/components/signinAndLogin/Actions/priceTemplatesServerActions";

function AddPriceTemplate({ priceTemplate = {}, onClose, refreshPriceTemplates }) {
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
      name: priceTemplate?.name || "",
      description: priceTemplate?.description || "",
      basePrice: priceTemplate?.basePrice || "",
      decimalPlaces: priceTemplate?.decimalPlaces || 2,
      status: priceTemplate?.status || "فعال",
      shopUniqName: shopUniqName || "",
    },
    resolver: yupResolver(PriceTemplateSchema),
  });

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await PriceTemplateSchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();

      formDataObj.append("shopUniqName", formData.shopUniqName);
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("basePrice", formData.basePrice);
      formDataObj.append("decimalPlaces", formData.decimalPlaces);
      formDataObj.append("status", formData.status);

      if (priceTemplate?._id) {
        formDataObj.append("id", priceTemplate._id);
      }

      let result;
      if (priceTemplate?._id) {
        // اگر قالب قیمتی برای ویرایش است
        result = await EditPriceTemplateAction(formDataObj, shopUniqName);
      } else {
        // اگر قالب قیمتی جدید باشد
        result = await AddPriceTemplateAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshPriceTemplates();
        const successMessage = priceTemplate && priceTemplate._id ? "قالب قیمتی با موفقیت ویرایش شد!" : "قالب قیمتی با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        toast.error(result.message || "خطایی در پردازش قالب قیمتی رخ داد.");
      }
    } catch (error) {
      console.error("Error handling price template:", error);
      toast.error("مشکلی در پردازش قالب قیمتی وجود دارد.");
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
          {priceTemplate?._id ? "ویرایش قالب قیمتی" : "افزودن قالب قیمتی"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(formSubmitting)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        <div>
          <label className="block mb-1">نام قالب قیمتی</label>
          <input
            type="text"
            {...register("name")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block mb-1">توضیحات قالب قیمتی</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            required
          ></textarea>
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block mb-1">قیمت پایه</label>
          <input
            type="number"
            step="0.01"
            {...register("basePrice")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.basePrice && <p className="text-red-500">{errors.basePrice.message}</p>}
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

        {/* سایر فیلدهای مربوط به قالب قیمتی می‌تواند اینجا اضافه شود */}
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          disabled={isSubmit}
        >
          {isSubmit ? <HashLoader size={20} color="#fff" /> : (priceTemplate?._id ? "ویرایش قالب قیمتی" : "افزودن قالب قیمتی")}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddPriceTemplate;
