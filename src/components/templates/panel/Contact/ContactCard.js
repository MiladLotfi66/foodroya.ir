// app/currencies/ContactCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import UserMiniInfo from "@/module/home/UserMiniInfo";
import { DeleteContacts } from "./contactsServerActions";

function ContactCard({ contact: initialContact, editFunction, onDelete, onError }) { // افزودن onError به props
  const [contact, setContact] = useState(initialContact);

  useEffect(() => {
    setContact(initialContact);
  }, [initialContact]);

  const deleteFunc = async () => {
    try {
      const response = await DeleteContacts(contact._id);
      
      if (response.status === 200) {
        onDelete(); // حذف مخاطب از لیست
        // نمایش پیام موفقیت از والد
        // Optional: می‌توانید یک onSuccess نیز اضافه کنید
      } else {
        // ارسال پیام خطا به والد
        onError(response.message || "خطا در حذف مخاطب.");
      }
    } catch (error) {
      console.error("خطا در حذف مخاطب:", error);
      // ارسال پیام خطا به والد
      onError(error.message || "خطای غیرمنتظره در حذف مخاطب.");
    }
  };

  return (
    <div className="relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-6 transition-transform transform hover:scale-105">
      <div className="flex justify-between items-start">
        {/* بخش اطلاعات مخاطب */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 truncate">
            {contact.name} 
          </h2> 
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 truncate">
             ({contact.phone})
          </h2>
          {contact.userAccount && (
                       <UserMiniInfo
                       userImage={contact.userAccount.userImage}
                       name={contact.userAccount.name}
                       username={contact.userAccount.userUniqName}
                     />
                   )}
          <div className="mt-3 space-y-1">
            {contact.email && (
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                <span className="font-medium truncate">ایمیل:</span> {contact.email}
              </p>
            )}
            {contact.address && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                <span className="font-medium ">آدرس:</span> {contact.address}
              </p>
            )}
          </div>
        </div>

        {/* بخش آیکون‌های عملیات */}
        <div className="flex flex-col items-end space-y-2">
          {/* دکمه‌های عملیات */}
          <div className="flex gap-2">
            <button
              aria-label="حذف"
              className="text-red-500 hover:text-red-700"
              onClick={deleteFunc}
            >
              <DeleteSvg />
            </button>
            <button
              aria-label="ویرایش"
              className="text-blue-500 hover:text-blue-700"
              onClick={editFunction}
            >
              <EditSvg />
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactCard;
