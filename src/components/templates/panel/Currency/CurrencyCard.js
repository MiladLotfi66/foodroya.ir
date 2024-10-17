// app/currencies/CurrencyCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  EnableCurrencyAction,
  DisableCurrencyAction,
  DeleteCurrencies,
} from "@/components/signinAndLogin/Actions/currencies";
import { Toaster, toast } from "react-hot-toast";

function CurrencyCard({ currency: initialCurrency, editFunction, onDelete }) {
  const [currency, setCurrency] = useState(initialCurrency); // مدیریت وضعیت ارز

  useEffect(() => {
    // هر بار که props ارز تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  const enableFunc = async () => {
    try {
      const response = await EnableCurrencyAction(currency._id);
      if (response.status === 200) {
        setCurrency({ ...currency, status: "فعال" }); // بروزرسانی وضعیت ارز بدون رفرش
        toast.success("ارز فعال شد.");
      } else {
        throw new Error(response.message || "خطا در فعال‌سازی ارز.");
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی ارز:", error);
      toast.error("خطا در فعال‌سازی ارز.");
    }
  };

  const disableFunc = async () => {
    try {
      const response = await DisableCurrencyAction(currency._id);
      if (response.status === 200) {
        setCurrency({ ...currency, status: "غیرفعال" }); // بروزرسانی وضعیت ارز بدون رفرش
        toast.success("ارز غیرفعال شد.");
      } else {
        throw new Error(response.message || "خطا در غیرفعال‌سازی ارز.");
      }
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی ارز:", error);
      toast.error("خطا در غیرفعال‌سازی ارز.");
    }
  };

  const deleteFunc = async () => {
    try {
      const response = await DeleteCurrencies(currency._id);
      if (response.status === 200) {
        onDelete(); // حذف ارز از لیست
        // toast.success("ارز با موفقیت حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف ارز.");
      }
    } catch (error) {
      console.error("خطا در حذف ارز:", error);
      toast.error("خطا در حذف ارز.");
    }
  };

  return (
    <div className="relative bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <div className="hidden">
          <DeleteSvg />
          <EditSvg />
          <ShareSvg />
          <EyeSvg />
          <EyeslashSvg />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            {currency.title} ({currency.shortName})
          </h2>
          <p className="text-sm">نرخ برابری: {currency.exchangeRate}</p>
          <p className="text-sm">تعداد اعشار: {currency.decimalPlaces}</p>
          <p
            className={`text-sm ${
              currency.status === "فعال" ? "text-green-500" : "text-red-500"
            }`}
          >
            وضعیت: {currency.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Delete Icon */}
          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="delete"
            onClick={deleteFunc}
          >
            <use href="#DeleteSvg"></use>
          </svg>
          {/* Edit Icon */}
          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="edit"
            onClick={editFunction}
          >
            <use href="#EditSvg"></use>
          </svg>
          {/* Share Icon */}
          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="share"
          >
            <use href="#ShareSvg"></use>
          </svg>
          {/* Enable/Disable Icon */}
          {currency.status === "فعال" ? (
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="disable"
              onClick={disableFunc}
            >
              <use href="#EyeslashSvg"></use>
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="enable"
              onClick={enableFunc}
            >
              <use href="#EyeSvg"></use>
            </svg>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default CurrencyCard;
