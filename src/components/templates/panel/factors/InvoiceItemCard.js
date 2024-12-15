// app/InvoiceItemCard.jsx

"use client";
import React from "react";
import { Toaster, toast } from "react-hot-toast";
import DeleteSvg from "@/module/svgs/DeleteSvg";

function InvoiceItemCard({ invoiceItem, editFunction, onDelete, onUpdate }) {
  const { _id, title, image, quantity, unitPrice } = invoiceItem;

  // محاسبه totalPrice در فرزند (در صورتی که والد آن را ارسال نکرده باشد)
  const totalPrice = invoiceItem.totalPrice !== undefined 
    ? invoiceItem.totalPrice 
    : (quantity * unitPrice);

  // تابع برای مدیریت تغییرات ورودی‌ها
  const handleChange = (e, field) => {
    const value = e.target.value;
    let updatedValue;

    if (field === "quantity") {
      updatedValue = parseInt(value, 10);
      if (isNaN(updatedValue) || updatedValue < 1) {
        toast.error("تعداد باید حداقل 1 باشد.");
        return;
      }
    } else if (field === "unitPrice") {
      updatedValue = parseFloat(value);
      if (isNaN(updatedValue) || updatedValue < 0) {
        toast.error("قیمت واحد باید غیرمنفی باشد.");
        return;
      }
    }

    const newQuantity = field === "quantity" ? updatedValue : quantity;
    const newUnitPrice = field === "unitPrice" ? updatedValue : unitPrice;

    const updatedItem = {
      ...invoiceItem,
      [field]: updatedValue,
      totalPrice: newQuantity * newUnitPrice,
    };

    onUpdate(updatedItem); // گزارش تغییر به والد
  };

  const deleteFunc = async () => {
    try {
      const response = await DeleteInvoiceItems(_id);
      if (response.status === 200) {
        onDelete();
        toast.success("کالا با موفقیت حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف کالا.");
      }
    } catch (error) {
      console.error("خطا در حذف کالا:", error);
      toast.error("خطا در حذف کالا.");
    }
  };

  return (
    <div className="relative bg-white dark:bg-zinc-800 shadow-md rounded-2xl p-4 transition duration-300 ease-in-out">
      <div className="hidden">
        <DeleteSvg />
      </div>
      <div className="flex gap-2 justify-between items-start">
        {/* بخش تصویر و دکمه حذف */}
        <div className="flex-shrink-0">
          <svg
            width="24"
            height="24"
            className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition duration-300 ease-in-out"
            aria-label="delete"
            onClick={deleteFunc}
          >
            <use href="#DeleteSvg"></use>
          </svg>
          <img
            src={image || "https://via.placeholder.com/150"}
            alt={title}
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-md mt-1"
            loading="lazy"
          />
        </div>

        <div className="ml-4 flex-1">
          <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* فیلد قابل ویرایش تعداد */}
          <div className="mt-3">
            <label htmlFor="quantity" className="block text-sm text-gray-700 dark:text-gray-300">
              تعداد:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => handleChange(e, "quantity")}
              className={`mt-1 block w-full p-1 border ${
                quantity < 1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white`}
              min="1"
            />
          </div>

          {/* فیلد قابل ویرایش قیمت واحد */}
          <div className="mt-2">
            <label htmlFor="unitPrice" className="block text-sm text-gray-700 dark:text-gray-300">
              قیمت واحد:
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={unitPrice}
              onChange={(e) => handleChange(e, "unitPrice")}
              className={`mt-1 block w-full p-1 border ${
                unitPrice < 0 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white`}
              min="0"
              step="0.01"
            />
          </div>

          {/* نمایش جمع کل */}
          <div className="mt-3">
            <p className="text-sm sm:text-base">
              جمع کل: {totalPrice.toLocaleString()} تومان
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default InvoiceItemCard;
