"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { DeleteInvoiceItems, UpdateInvoiceItem } from "./invoiceItemsServerActions";
import { Toaster, toast } from "react-hot-toast";

function InvoiceItemCard({ invoiceItem: initialInvoiceItem, editFunction, onDelete }) {
  const [invoiceItem, setInvoiceItem] = useState(initialInvoiceItem); // مدیریت وضعیت کالا
  const [errors, setErrors] = useState({}); // مدیریت خطاهای ورودی

  useEffect(() => {
    // هر بار که props کالا تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setInvoiceItem(initialInvoiceItem);
  }, [initialInvoiceItem]);

  // تابع برای مدیریت تغییرات در ورودی‌ها
  const handleChange = (e, field) => {
    const value = e.target.value;
    setInvoiceItem((prevItem) => ({
      ...prevItem,
      [field]: field === 'quantity' ? parseInt(value, 10) : parseFloat(value),
    }));
  };

  // تابع برای محاسبه مجدد جمع کل
  useEffect(() => {
    setInvoiceItem((prevItem) => ({
      ...prevItem,
      totalPrice: prevItem.quantity * prevItem.unitPrice,
    }));
  }, [invoiceItem.quantity, invoiceItem.unitPrice]);

  const deleteFunc = async () => {
    try {
      const response = await DeleteInvoiceItems(invoiceItem._id);
      if (response.status === 200) {
        onDelete(); // حذف کالا از لیست
        toast.success("کالا با موفقیت حذف شد."); // فعال‌کردن toast موفقیت
      } else {
        throw new Error(response.message || "خطا در حذف کالا.");
      }
    } catch (error) {
      console.error("خطا در حذف کالا:", error);
      toast.error("خطا در حذف کالا.");
    }
  };

  const updateFunc = async () => {
    try {
      const response = await UpdateInvoiceItem(invoiceItem._id, invoiceItem);
      if (response.status === 200) {
        toast.success("کالا با موفقیت به‌روزرسانی شد.");
        if (editFunction) {
          editFunction(invoiceItem);
        }
      } else {
        throw new Error(response.message || "خطا در به‌روزرسانی کالا.");
      }
    } catch (error) {
      console.error("خطا در به‌روزرسانی کالا:", error);
      toast.error("خطا در به‌روزرسانی کالا.");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!invoiceItem.quantity || invoiceItem.quantity < 1) {
      newErrors.quantity = "تعداد باید حداقل 1 باشد.";
    }
    if (invoiceItem.unitPrice === undefined || invoiceItem.unitPrice < 0) {
      newErrors.unitPrice = "قیمت واحد باید غیرمنفی باشد.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // فراخوانی validate و updateFunc قبل از بروزرسانی والد
  useEffect(() => {
    if (invoiceItem.quantity !== initialInvoiceItem.quantity || invoiceItem.unitPrice !== initialInvoiceItem.unitPrice) {
      if (validate()) {
        updateFunc();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceItem.quantity, invoiceItem.unitPrice]);

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

          {/* فیلد قابل ویرایش تعداد */}
          <div className="mt-2">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              تعداد:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={invoiceItem.quantity}
              onChange={(e) => handleChange(e, 'quantity')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              min="1"
            />
            {errors.quantity && <span className="text-red-500 text-xs">{errors.quantity}</span>}
          </div>

          {/* فیلد قابل ویرایش قیمت واحد */}
          <div className="mt-2">
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
              قیمت واحد:
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={invoiceItem.unitPrice}
              onChange={(e) => handleChange(e, 'unitPrice')}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              min="0"
              step="0.01"
            />
            {errors.unitPrice && <span className="text-red-500 text-xs">{errors.unitPrice}</span>}
          </div>

          {/* نمایش جمع کل */}
          <div className="mt-2">
            <p className="text-sm">جمع کل: {invoiceItem.totalPrice}</p>
          </div>
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
