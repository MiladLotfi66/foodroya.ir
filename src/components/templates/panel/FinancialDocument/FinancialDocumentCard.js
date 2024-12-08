// app/financialDocuments/FinancialDocumentCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  EnableFinancialDocumentAction,
  DisableFinancialDocumentAction,
  DeleteFinancialDocuments,
} from  "./FinancialDocumentsServerActions";
import { Toaster, toast } from "react-hot-toast";

function FinancialDocumentCard({ financialDocument: initialFinancialDocument, editFunction, onDelete }) {
  const [financialDocument, setFinancialDocument] = useState(initialFinancialDocument); // مدیریت وضعیت سند مالی

  useEffect(() => {
    // هر بار که props سند مالی تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setFinancialDocument(initialFinancialDocument);
  }, [initialFinancialDocument]);

  const enableFunc = async () => {
    try {
      const response = await EnableFinancialDocumentAction(financialDocument._id);
      if (response.status === 200) {
        setFinancialDocument({ ...financialDocument, status: "فعال" }); // بروزرسانی وضعیت سند مالی بدون رفرش
        toast.success("سند مالی فعال شد.");
      } else {
        throw new Error(response.message || "خطا در فعال‌سازی سند مالی.");
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی سند مالی:", error);
      toast.error("خطا در فعال‌سازی سند مالی.");
    }
  };

  const disableFunc = async () => {
    try {
      const response = await DisableFinancialDocumentAction(financialDocument._id);
      if (response.status === 200) {
        setFinancialDocument({ ...financialDocument, status: "غیرفعال" }); // بروزرسانی وضعیت سند مالی بدون رفرش
        toast.success("سند مالی غیرفعال شد.");
      } else {
        throw new Error(response.message || "خطا در غیرفعال‌سازی سند مالی.");
      }
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی سند مالی:", error);
      toast.error("خطا در غیرفعال‌سازی سند مالی.");
    }
  };

  const deleteFunc = async () => {
    try {
      const response = await DeleteFinancialDocuments(financialDocument._id);
      if (response.status === 200) {
        onDelete(); // حذف سند مالی از لیست
        // toast.success("سند مالی با موفقیت حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف سند مالی.");
      }
    } catch (error) {
      console.error("خطا در حذف سند مالی:", error);
      toast.error("خطا در حذف سند مالی.");
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
            {financialDocument.title} ({financialDocument.shortName})
          </h2>
          <p className="text-sm">نرخ برابری: {financialDocument.exchangeRate}</p>
          <p className="text-sm">تعداد اعشار: {financialDocument.decimalPlaces}</p>
          <p
            className={`text-sm ${
              financialDocument.status === "فعال" ? "text-green-500" : "text-red-500"
            }`}
          >
            وضعیت: {financialDocument.status}
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
          {financialDocument.status === "فعال" ? (
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

export default FinancialDocumentCard;
