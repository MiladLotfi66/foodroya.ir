"use client";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { getLastPurchasedPrice } from "./invoiceItemsServerActions";
 function InvoiceItemCard({ invoiceItem, editFunction, onDelete, onUpdate }) {
  const { title, image, quantity = 1, unitPrice = 0, description = "" , productId } = invoiceItem;

  const totalPrice = (quantity || 0) * (unitPrice || 0);
  const [lastPrice, setLastPrice] = useState(0);
const [priceLoading, setPriceLoading] = useState({});

  useEffect(() => {
    const fetchPrices = async () => {
      setPriceLoading(true);
      try {
        const price = await getLastPurchasedPrice(productId);
        
        setLastPrice(price);
      } catch (error) {
        console.error(error);
      } finally {
        setPriceLoading(false);
      }
    };
  
    fetchPrices();
  }, [productId]);
  
  // تابع تغییر مقادیر ورودی‌ها
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
    } else if (field === "description") {
      updatedValue = value; // برای توضیحات، نیازی به تبدیل نیست
    }

    const newQuantity = field === "quantity" ? updatedValue : quantity;
    const newUnitPrice = field === "unitPrice" ? updatedValue : unitPrice;
    const newDescription = field === "description" ? updatedValue : description;

    const updatedItem = {
      ...invoiceItem,
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      description: newDescription,
      totalPrice: newQuantity * newUnitPrice,
    };

    onUpdate(updatedItem); // گزارش تغییر به والد
  };

  // تابع حذف آیتم که تنها به والد اطلاع می‌دهد
  const deleteFunc = () => {
    onDelete(); // والد مسئول انجام عملیات حذف است
  };

  return (
    <div className="relative bg-white dark:bg-zinc-800 shadow-md rounded-2xl p-4 transition duration-300 ease-in-out">
        <h2 className="text-sm sm:text-md lg:text-lg font-bold text-gray-900 dark:text-white line-clamp-3 h-20 items-center text-center content-center">
            {title}
          </h2>
      <div className="flex gap-2 justify-between items-center">
        {/* قسمت تصویر */}

        <div className="flex-shrink-0">
          <img
            src={image || "https://via.placeholder.com/150"}
            alt={title}
            className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-cover rounded-md mt-1"
            loading="lazy"
          />
        </div>

        {/* اطلاعات آیتم */}
        <div className="flex-1">

          {/* فیلد قابل ویرایش تعداد */}
          <div >
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
        </div>
      </div>

      {/* فیلد توضیحات */}
      <div className="mt-2">
        <label htmlFor="description" className="block text-sm text-gray-700 dark:text-gray-300">
          توضیحات:
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => handleChange(e, "description")}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-zinc-700 dark:text-white"
          placeholder="توضیحات کالا را وارد کنید"
          rows="3"
        />
      </div>
            {/* آخرین قیمت خرید*/}

      <p htmlFor="LastPrice" className="block text-sm text-gray-700 dark:text-gray-300">
          آخرین قیمت خرید: {Number(lastPrice).toLocaleString() } تومان 

        </p>
      {/* نمایش جمع کل و دکمه حذف */}
      <div className="mt-3 flex justify-between">
        <p className="text-sm sm:text-base">
          جمع کل: {totalPrice.toLocaleString()} تومان
        </p>
        <button
          onClick={deleteFunc}
          className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition duration-300 ease-in-out"
          aria-label="delete"
        >
          <DeleteSvg />
        </button>
      </div>

      <Toaster />
    </div>
  );
}

export default InvoiceItemCard;
