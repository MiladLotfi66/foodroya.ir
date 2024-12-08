// app/currencies/PriceTemplateManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import PriceTemplateCard from "./PriceTemplateCard";
import AddPriceTemplate from "./AddPriceTemplate";
import { useParams } from 'next/navigation';
import { AddPriceTemplateAction, DeletePriceTemplates, EditPriceTemplateAction, GetAllPriceTemplates } from "./PriceTemplateActions";
import { Toaster, toast } from "react-hot-toast";

function PriceTemplateManage() {
  const [priceTemplates, setPriceTemplates] = useState([]);
  const [isOpenAddPriceTemplate, setIsOpenAddPriceTemplate] = useState(false);
  const [selectedPriceTemplate, setSelectedPriceTemplate] = useState(null);
  const [selectedPriceTemplateFile, setSelectedPriceTemplateFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { ShopId } = params;

  // بهینه‌سازی refreshPriceTemplates با استفاده از useCallback
  const refreshPriceTemplates = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      const response = await GetAllPriceTemplates(ShopId);
      setPriceTemplates(response.PriceTemplates);
    } catch (error) {
      console.error("Error fetching price templates:", error);
      toast.error("خطا در دریافت قالب‌های قیمتی.");
    }
  }, [ShopId]);

  useEffect(() => {
    refreshPriceTemplates();
  }, [refreshPriceTemplates]);

  const handleDeletePriceTemplate = useCallback((priceTemplateId) => {
    setPriceTemplates((prevPriceTemplates) => prevPriceTemplates.filter(template => template._id !== priceTemplateId));
    toast.success("قالب قیمتی با موفقیت حذف شد.");
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddPriceTemplate(false);
      setSelectedPriceTemplate(null);
      setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی
    }
  }, []);

  const handleEditClick = useCallback((priceTemplate) => {
    setSelectedPriceTemplate(priceTemplate);
    setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی در حالت ویرایش
    setIsOpenAddPriceTemplate(true);
  }, []);

  const handleAddPriceTemplateClick = useCallback(() => {
    setIsOpenAddPriceTemplate(true);
    setSelectedPriceTemplate(null);
    setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddPriceTemplate(false);
    setSelectedPriceTemplate(null);
    setSelectedPriceTemplateFile(null);
  }, []);

  return (
    <FormTemplate>
      {isOpenAddPriceTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddPriceTemplate
              priceTemplate={selectedPriceTemplate}
              priceTemplateFile={selectedPriceTemplateFile}
              onClose={handleCloseModal}
              refreshPriceTemplates={refreshPriceTemplates} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت قالب‌های قیمتی</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add price template"
            onClick={handleAddPriceTemplateClick}
          >
            افزودن قالب قیمتی
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {priceTemplates?.map((priceTemplate) => (
            <PriceTemplateCard
              className="p-2 md:p-4"
              key={priceTemplate._id}
              priceTemplate={priceTemplate}
              editFunction={() => handleEditClick(priceTemplate)}
              onDelete={() => handleDeletePriceTemplate(priceTemplate._id)} // پاس دادن تابع حذف
            />
          ))}
        </div>
      </div>
      {/* <Toaster /> */}
    </FormTemplate>
  );
}

export default PriceTemplateManage;
