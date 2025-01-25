"use client";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { getLastPurchasedPrice } from "./invoiceItemsServerActions";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

 function InvoiceItemCard({ invoiceItem, editFunction, onDelete, onUpdate,invoiceType }) {
    const { baseCurrency } = useShopInfoFromRedux();
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
  const convertPersianToEnglish = (value) => {
    // تبدیل اعداد فارسی به انگلیسی
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let processedValue = value;
    
    // تبدیل اعداد فارسی به انگلیسی
    for (let i = 0; i < persianNumbers.length; i++) {
      processedValue = processedValue.replace(persianNumbers[i], englishNumbers[i]);
    }
  
    // حالا محدودیت‌های مربوط به اعشار اعمال می‌شود
    const decimalPlaces = baseCurrency.decimalPlaces;  // تعداد ارقام اعشاری برای فرمت ارز
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimalPlaces}}`);
    const newValue = processedValue.match(regex) ? processedValue.match(regex)[0] : processedValue;
  
    return newValue;
  };
  
  
  // تابع تغییر مقادیر ورودی‌ها
// تابع تغییر مقادیر ورودی‌ها
const handleChange = (e, field) => {
  const rawValue = e.target.value;
  let updatedValue = rawValue;

  // برای فیلد unitPrice تبدیل و محدودیت‌ها اعمال می‌شود
  if (field === "unitPrice") {
    updatedValue = convertPersianToEnglish(rawValue); // تبدیل اعداد فارسی به انگلیسی
    updatedValue = parseFloat(updatedValue); // تبدیل به عدد اعشاری
    
  } else if (field === "quantity") {
    let parsedValue = parseInt(updatedValue, 10);
    if (isNaN(parsedValue) || parsedValue < 1) {
      toast.error("تعداد باید حداقل 1 باشد.");
      return;
    }
    updatedValue = parsedValue;
  } else if (field === "description") {
    updatedValue = rawValue; // برای توضیحات، نیازی به تبدیل نیست
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

  onUpdate(updatedItem);
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
        
          <div  className= {invoiceType!=="Waste"?"mt-2":"hidden mt-2"}>
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
  step="any" // اجازه وارد کردن اعشار
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
          آخرین قیمت خرید: {Number(lastPrice).toLocaleString() } {baseCurrency.title} 

        </p>
      {/* نمایش جمع کل و دکمه حذف */}
      <div className="mt-3 flex justify-between">
        <p className="text-sm sm:text-base">
          جمع کل: {totalPrice.toLocaleString()} {baseCurrency.title}
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
