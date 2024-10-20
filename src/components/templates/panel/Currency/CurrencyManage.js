// app/currencies/CurrencyManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import CurrencyCard from "./CurrencyCard";
import AddCurrency from "./AddCurrency";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { useParams } from 'next/navigation';
import { AddCurrencyAction, DeleteCurrencies, EditCurrencyAction ,GetAllCurrencies} from "@/components/signinAndLogin/Actions/currenciesServerActions";
import { Toaster, toast } from "react-hot-toast";

function CurrencyManage() {
  const [currencies, setCurrencies] = useState([]);
  const [isOpenAddCurrency, setIsOpenAddCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [selectedCurrencyFile, setSelectedCurrencyFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { shopUniqName } = params;

  // بهینه‌سازی refreshCurrencies با استفاده از useCallback
  const refreshCurrencies = useCallback(async () => {
    try {
      if (!shopUniqName) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const ShopId = await GetShopIdByShopUniqueName(shopUniqName);

      if (!ShopId.ShopID) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }

      const response = await GetAllCurrencies(ShopId.ShopID);

      setCurrencies(response.currencies);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("خطا در دریافت ارزها.");
    }
  }, [shopUniqName]);

  useEffect(() => {
    refreshCurrencies();
  }, [refreshCurrencies]);

  const handleDeleteCurrency = useCallback((currencyId) => {
    setCurrencies((prevCurrencies) => prevCurrencies.filter(currency => currency._id !== currencyId));
    toast.success("ارز با موفقیت حذف شد.");
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddCurrency(false);
      setSelectedCurrency(null);
      setSelectedCurrencyFile(null); // ریست کردن فایل ارز
    }
  }, []);

  const handleEditClick = useCallback((currency) => {
    setSelectedCurrency(currency);
    setSelectedCurrencyFile(null); // ریست کردن فایل ارز در حالت ویرایش
    setIsOpenAddCurrency(true);
  }, []);

  const handleAddCurrencyClick = useCallback(() => {
    setIsOpenAddCurrency(true);
    setSelectedCurrency(null);
    setSelectedCurrencyFile(null); // ریست کردن فایل ارز در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddCurrency(false);
    setSelectedCurrency(null);
    setSelectedCurrencyFile(null);
  }, []);

  return (
    <FormTemplate>
      {isOpenAddCurrency && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddCurrency
              currency={selectedCurrency}
              currencyFile={selectedCurrencyFile}
              onClose={handleCloseModal}
              refreshCurrencies={refreshCurrencies} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت ارزها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add currency"
            onClick={handleAddCurrencyClick}
          >
            افزودن ارز
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {currencies.map((currency) => (
            <CurrencyCard
              className="p-2 md:p-4"
              key={currency._id}
              currency={currency}
              editFunction={() => handleEditClick(currency)}
              onDelete={() => handleDeleteCurrency(currency._id)} // پاس دادن تابع حذف
            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default CurrencyManage;
