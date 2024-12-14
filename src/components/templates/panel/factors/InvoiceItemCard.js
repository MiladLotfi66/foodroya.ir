// app/invoiceItems/InvoiceItemCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import {
  DeleteInvoiceItems,
} from "./invoiceItemsServerActions";
import { Toaster, toast } from "react-hot-toast";

function InvoiceItemCard({ invoiceItem: initialInvoiceItem, editFunction, onDelete }) {
  const [invoiceItem, setInvoiceItem] = useState(initialInvoiceItem); // مدیریت وضعیت کالا
console.log("invoiceItem",invoiceItem);

  useEffect(() => {
    // هر بار که props کالا تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setInvoiceItem(initialInvoiceItem);
  }, [initialInvoiceItem]);

 


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
        </div>

        <div>
           {/* بخش تصویر */}
           <div className="relative items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0">
                          <img
                            src={invoiceItem.image || "https://via.placeholder.com/150"}
                            alt={invoiceItem.title}
                            className="w-full h-full object-cover rounded-md mt-1"
                            loading="lazy"
                          />
                     
                        </div>
          <h2 className="text-xl font-bold">
            {invoiceItem.title} 
          </h2>
          <p className="text-sm">تعداد: {invoiceItem.quantity}</p>
          <p className="text-sm">قیمت واحد: {invoiceItem.unitPrice}</p>
          <p className="text-sm">جمع کل: {invoiceItem.totalPrice}</p>
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
       
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default InvoiceItemCard;
