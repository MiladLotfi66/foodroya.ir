"use client";

import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  SendMetodServerEnableActions,
  SendMetodServerDisableActions,
  DeleteSendMetods,
} from "./SendMetodServerActions";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

function SendMetodCard({ sendMetod: initialSendMetod, editfunction, onDelete ,updateSendMetod }) {
    const { baseCurrency } = useShopInfoFromRedux();
  
  const [sendMetod, setSendMetod] = useState(initialSendMetod);

  useEffect(() => {
    setSendMetod(initialSendMetod);
  }, [initialSendMetod]);

  const enableFunc = async () => {
    try {
      await SendMetodServerEnableActions(sendMetod._id);
      const updatedSendMetod = { ...sendMetod, SendMetodStatus: true };
      setSendMetod(updatedSendMetod);
      // به روزرسانی در والد به صورت محلی
      if (typeof updateSendMetod === "function") {
        updateSendMetod(updatedSendMetod);
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی روش ارسال:", error);
    }
  };
  

  const disableFunc = async () => {
    try {
      await SendMetodServerDisableActions(sendMetod._id);
      const updatedSendMetod = { ...sendMetod, SendMetodStatus: false };
      setSendMetod(updatedSendMetod);
      // به روزرسانی در والد به صورت محلی
      if (typeof updateSendMetod === "function") {
        updateSendMetod(updatedSendMetod);
      }
    } catch (error) {
      console.error("خطا در فعال‌سازی روش ارسال:", error);
    }
  };

  const deleteFunc = async () => {
    try {
      await DeleteSendMetods(sendMetod._id);
      onDelete();
    } catch (error) {
      console.error("خطا در حذف روش ارسال:", error);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* بخش تصویر */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={sendMetod.imageUrl}
          alt={sendMetod.SendMetodBigTitle}
          className="w-full h-full object-cover"
        />
        
        {/* وضعیت غیرفعال */}
        {!sendMetod.SendMetodStatus && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">غیرفعال</span>
          </div>
        )}

        {/* دکمه‌های اقدام در بالای تصویر */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={deleteFunc}
              className="p-2  bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
              title="حذف"
            >
              <DeleteSvg className="w-5 h-5 text-red-600" />
            </button>
            
            <button
              onClick={editfunction}
              className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
              title="ویرایش"
            >
              <EditSvg className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <button
            onClick={sendMetod.SendMetodStatus ? disableFunc : enableFunc}
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
            title={sendMetod.SendMetodStatus ? "غیرفعال کردن" : "فعال کردن"}
          >
            {sendMetod.SendMetodStatus ? (
              <EyeslashSvg className="w-5 h-5 text-gray-700" />
            ) : (
              <EyeSvg className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* بخش اطلاعات */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-800">
            {sendMetod.Title}
          </h3>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
            {sendMetod.Price} {baseCurrency.title}
          </span>
        </div>

       
        
        <p className="text-sm text-gray-500">
          {sendMetod.Description}
        </p>

       
      </div>
    </div>
  );
}

export default SendMetodCard;