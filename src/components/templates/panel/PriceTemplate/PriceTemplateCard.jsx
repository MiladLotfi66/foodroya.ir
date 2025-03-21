// app/PriceTemplateCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import {
  DeletePriceTemplates,
} from "./PriceTemplateActions";
import { Toaster, toast } from "react-hot-toast";

function PriceTemplateCard({ priceTemplate: initialPriceTemplate, editFunction, onDelete ,hasAddPermission,
  hasEditPermission,
  hasDeletePermission}) {
  const [priceTemplate, setPriceTemplate] = useState(initialPriceTemplate); // مدیریت وضعیت قالب قیمتی

  useEffect(() => {
    // هر بار که props قالب قیمتی تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setPriceTemplate(initialPriceTemplate);
  }, [initialPriceTemplate]);

  const deleteFunc = async () => {
    try {
      const response = await DeletePriceTemplates(priceTemplate._id);
      if (response.status === 200) {
        onDelete(); // حذف قالب قیمتی از لیست
        toast.success("قالب قیمتی با موفقیت حذف شد.");
      } else {
        toast.error(response.message || "خطا در حذف قالب قیمتی.");
      }
    } catch (error) {
      console.error("خطا در حذف قالب قیمتی:", error);
      toast.error(response.message || "خطا در حذف قالب قیمتی.");
    }
  };

  return (
    <div className="relative bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <div className="hidden">
          <DeleteSvg />
          <EditSvg />
          <ShareSvg />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            {priceTemplate.name} {/* فرض بر این است که قالب قیمتی دارای نام است */}
          </h2>
          <p className="text-sm"> {priceTemplate.title}</p> {/* فرض بر این است که قالب قیمتی دارای توضیحات است */}
          {/* <p
            className={`text-sm ${
              priceTemplate.status === "فعال" ? "text-green-500" : "text-red-500"
            }`}
          >
            وضعیت: {priceTemplate.status}
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          {/* Delete Icon */}
          {hasDeletePermission &&

          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="delete"
            onClick={deleteFunc}
          >
            <use href="#DeleteSvg"></use>
          </svg>}
          {/* Edit Icon */}
          {hasEditPermission &&

          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="edit"
            onClick={editFunction}
          >
            <use href="#EditSvg"></use>
          </svg>
  }
          {/* Share Icon */}
          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="share"
            onClick={() => {
              // عملکرد به اشتراک گذاری قالب قیمتی را تعریف کنید
              // به عنوان مثال، می‌توانید لینک قالب قیمتی را کپی کنید یا آن را به اشتراک بگذارید
              toast("قالب قیمتی به اشتراک گذاشته شد.");
            }}
          >
            <use href="#ShareSvg"></use>
          </svg>
       
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default PriceTemplateCard;
