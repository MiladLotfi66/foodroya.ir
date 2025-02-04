"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import SendMetodCard from "./SendMetodCard";
import { GetAllSendMetods } from "./SendMetodServerActions";
import AddSendMetod from "./AddSendMetod";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

function SendMetodManage() {
  const [sendMetods, setSendMetods] = useState([]);
  const [isOpenAddSendMetod, setIsOpenAddSendMetod] = useState(false);
  const [selectedSendMetod, setSelectedSendMetod] = useState(null);
  const [selectedSendMetodFile, setSelectedSendMetodFile] = useState(null); // افزودن استیت جدید

  const {
     currentShopId,
     shopPanelImage,
      } = useShopInfoFromRedux();
   const ShopId  = currentShopId;
    const BGImage=shopPanelImage;
  // بهینه‌سازی refreshSendMetods با استفاده از useCallback
  const refreshSendMetods = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetAllSendMetods(ShopId);

      setSendMetods(response.sendMetods);
    } catch (error) {
      console.error("Error fetching sendMetods:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    refreshSendMetods();
  }, [refreshSendMetods]);

  const handleDeleteSendMetod = useCallback((sendMetodId) => {
    setSendMetods((prevSendMetods) =>
      prevSendMetods.filter((sendMetod) => sendMetod._id !== sendMetodId)
    );
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddSendMetod(false);
      setSelectedSendMetod(null);
      setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال
    }
  }, []);

  const handleEditClick = useCallback((sendMetod) => {
    setSelectedSendMetod(sendMetod);
    setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال در حالت ویرایش
    setIsOpenAddSendMetod(true);
  }, []);

  const handleAddSendMetodClick = useCallback(() => {
    setIsOpenAddSendMetod(true);
    setSelectedSendMetod(null);
    setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddSendMetod(false);
    setSelectedSendMetod(null);
    setSelectedSendMetodFile(null);
  }, []);

  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddSendMetod && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddSendMetod
              sendMetod={selectedSendMetod}
              sendMetodFile={selectedSendMetodFile}
              onClose={handleCloseModal}
              refreshSendMetods={refreshSendMetods} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت روش ارسال ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add baner"
            onClick={handleAddSendMetodClick}
          >
            افزودن روش ارسال
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {sendMetods.map((sendMetod) => (
           <SendMetodCard
           key={sendMetod._id}
           sendMetod={sendMetod}
           editfunction={() => handleEditClick(sendMetod)}
           onDelete={() => handleDeleteSendMetod(sendMetod._id)}
           updateSendMetod={(updatedData) => {
             setSendMetods((prev) =>
               prev.map((item) =>
                 item._id === updatedData._id ? updatedData : item
               )
             );
           }}
         />
         
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default SendMetodManage;
