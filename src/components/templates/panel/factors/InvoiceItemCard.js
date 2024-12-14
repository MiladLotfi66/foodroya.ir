// app/invoiceItems/InvoiceItemCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  EnableInvoiceItemAction,
  DisableInvoiceItemAction,
  DeleteInvoiceItems,
} from "./invoiceItemsServerActions";
import { Toaster, toast } from "react-hot-toast";

function InvoiceItemCard({ invoiceItem: initialInvoiceItem, editFunction, onDelete }) {
  const [invoiceItem, setInvoiceItem] = useState(initialInvoiceItem); // مدیریت وضعیت کالا

  useEffect(() => {
    // هر بار که props کالا تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setInvoiceItem(initialInvoiceItem);
  }, [initialInvoiceItem]);

  const enableFunc = async () => {
    try {
      const response = await EnableInvoiceItemAction(invoiceItem._id);
      if (response.status === 200) {
        setInvoiceItem({ ...invoiceItem, status: "فعال" }); // بروزرسانی وضعیت کالا بدون رفرش
        toast.success("کالا فعال شد.");
      } else {
        throw new Error(response.message || "خطا در فعال‌سازی کالا.");
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی کالا:", error);
      toast.error("خطا در فعال‌سازی کالا.");
    }
  };

  const disableFunc = async () => {
    try {
      const response = await DisableInvoiceItemAction(invoiceItem._id);
      if (response.status === 200) {
        setInvoiceItem({ ...invoiceItem, status: "غیرفعال" }); // بروزرسانی وضعیت کالا بدون رفرش
        toast.success("کالا غیرفعال شد.");
      } else {
        throw new Error(response.message || "خطا در غیرفعال‌سازی کالا.");
      }
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی کالا:", error);
      toast.error("خطا در غیرفعال‌سازی کالا.");
    }
  };

  const deleteFunc = async () => {
    try {
      const response = await DeleteInvoiceItems(invoiceItem._id);
      if (response.status === 200) {
        onDelete(); // حذف کالا از لیست
        // toast.success("کالا با موفقیت حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف کالا.");
      }
    } catch (error) {
      console.error("خطا در حذف کالا:", error);
      toast.error("خطا در حذف کالا.");
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
            {invoiceItem.title} ({invoiceItem.shortName})
          </h2>
          <p className="text-sm">نرخ برابری: {invoiceItem.exchangeRate}</p>
          <p className="text-sm">تعداد اعشار: {invoiceItem.decimalPlaces}</p>
          <p
            className={`text-sm ${
              invoiceItem.status === "فعال" ? "text-green-500" : "text-red-500"
            }`}
          >
            وضعیت: {invoiceItem.status}
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
          {invoiceItem.status === "فعال" ? (
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

export default InvoiceItemCard;
