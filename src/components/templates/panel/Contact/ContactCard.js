// app/currencies/ContactCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  EnableContactAction,
  DisableContactAction,
  DeleteCurrencies,
} from "@/components/signinAndLogin/Actions/currenciesServerActions";
import { Toaster, toast } from "react-hot-toast";

function ContactCard({ contact: initialContact, editFunction, onDelete }) {
  const [contact, setContact] = useState(initialContact); // مدیریت وضعیت مخاطب

  useEffect(() => {
    // هر بار که props مخاطب تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setContact(initialContact);
  }, [initialContact]);

  const enableFunc = async () => {
    try {
      const response = await EnableContactAction(contact._id);
      if (response.status === 200) {
        setContact({ ...contact, status: "فعال" }); // بروزرسانی وضعیت مخاطب بدون رفرش
        toast.success("مخاطب فعال شد.");
      } else {
        throw new Error(response.message || "خطا در فعال‌سازی مخاطب.");
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی مخاطب:", error);
      toast.error("خطا در فعال‌سازی مخاطب.");
    }
  };

  const disableFunc = async () => {
    try {
      const response = await DisableContactAction(contact._id);
      if (response.status === 200) {
        setContact({ ...contact, status: "غیرفعال" }); // بروزرسانی وضعیت مخاطب بدون رفرش
        toast.success("مخاطب غیرفعال شد.");
      } else {
        throw new Error(response.message || "خطا در غیرفعال‌سازی مخاطب.");
      }
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی مخاطب:", error);
      toast.error("خطا در غیرفعال‌سازی مخاطب.");
    }
  };

  const deleteFunc = async () => {
    try {
      const response = await DeleteCurrencies(contact._id);
      if (response.status === 200) {
        onDelete(); // حذف مخاطب از لیست
        // toast.success("مخاطب با موفقیت حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف مخاطب.");
      }
    } catch (error) {
      console.error("خطا در حذف مخاطب:", error);
      toast.error("خطا در حذف مخاطب.");
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
            {contact.title} ({contact.shortName})
          </h2>
          <p className="text-sm">نرخ برابری: {contact.exchangeRate}</p>
          <p className="text-sm">تعداد اعشار: {contact.decimalPlaces}</p>
          <p
            className={`text-sm ${
              contact.status === "فعال" ? "text-green-500" : "text-red-500"
            }`}
          >
            وضعیت: {contact.status}
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
          {contact.status === "فعال" ? (
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

export default ContactCard;
