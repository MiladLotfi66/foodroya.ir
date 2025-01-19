// InvoiceCard.jsx
"use client";
import React, { useState } from "react";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import ActionButton from "../rols/ActionButton";
import * as Tooltip from "@radix-ui/react-tooltip";
import moment from "moment-jalaali";
import UserMiniInfo from "@/module/home/UserMiniInfo";
import { calculateProductStock, getAccountBalance } from "./invoiceItemsServerActions";
// نگاشت نوع فاکتور به فارسی
const invoiceTypeMap = {
  Purchase: "خرید",
  Sale: "فروش",
  PurchaseReturn: "برگشت از خرید",
  SaleReturn: "برگشت از فروش",
  Waste: "ضایعات",
  // سایر انواع فاکتورها را اینجا اضافه کنید
};

const InvoiceCard = ({ invoice, handleDeleteInvoice, handleEditClick }) => {
  // تبدیل تاریخ به فرمت شمسی قابل خواندن و ارقام فارسی
  const formattedCreatedAt = moment(invoice.createdAt).format("jYYYY/jMM/jDD HH:mm");
  const formattedUpdatedAt = moment(invoice.updatedAt).format("jYYYY/jMM/jDD HH:mm");

  // تبدیل نوع فاکتور به فارسی
  const invoiceType = invoiceTypeMap[invoice.type] || invoice.type;

  // بررسی اینکه آیا فاکتور ویرایش شده است یا خیر
  // به جای مقایسه مستقیم، مقایسه تا دقیقه‌ها
  const createdMoment = moment(invoice.createdAt);
  const updatedMoment = moment(invoice.updatedAt);
  const isEdited =
    updatedMoment.diff(createdMoment, "minutes") > 0 ||
    (invoice.createdBy?._id &&
      invoice.updatedBy?._id &&
      invoice.createdBy._id !== invoice.updatedBy._id);

  // وضعیت نمایش اطلاعات ویرایش شده
  const [showEditInfo, setShowEditInfo] = useState(false);

  // تابع تغییر وضعیت نمایش اطلاعات ویرایش شده
  const handleToggleEditInfo = () => {
    setShowEditInfo(!showEditInfo);
  };

  return (
    <div className="relative rounded-xl bg-white dark:bg-zinc-700 shadow-md p-6 transition-transform duration-300 hover:scale-105">
      <div className="flex flex-col  justify-between items-start md:items-center gap-6">
        {/* بخش اطلاعات فاکتور */}
        <div className="flex flex-col space-y-4 w-full">
          <div className="flex gap-12 items-center">

          {/* نوع فاکتور */}
          <div className="text-2xl font-MorabbaBold text-orange-300 font-bold   ">
            {invoiceType}
          </div>
      {/* مخاطب */}
      <div className="flex items-center">
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          مخاطب:
        </span>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          {invoice.contact.name}
        </span>
      </div>
          </div>

          {/* بخش اقلام فاکتور */}
          <div>
          
            {invoice.InvoiceItems && invoice.InvoiceItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b dark:border-zinc-600 text-left">نام محصول</th>
                      <th className="py-2 px-4 border-b dark:border-zinc-600 text-right">تعداد</th>
                      <th className="py-2 px-4 border-b dark:border-zinc-600 text-right">قیمت واحد</th>
                      <th className="py-2 px-4 border-b dark:border-zinc-600 text-right">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.InvoiceItems.map((item) => (
                      <tr key={item._id} className="even:bg-gray-50 dark:even:bg-zinc-600">
                        <td className="py-2 px-4 border-b dark:border-zinc-600">
                          {item.product ? item.product.title : "نام محصول"}
                        </td>
                        <td className="py-2 px-4 border-b dark:border-zinc-600 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-4 border-b dark:border-zinc-600 text-right">
                    {item.unitPrice}
                        </td>
                        <td className="py-2 px-4 border-b dark:border-zinc-600 text-right">
                          {item.totalPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">اقلامی برای نمایش وجود ندارد.</p>
            )}
          </div>

          {/* توضیحات فاکتور */}
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              توضیحات:
            </span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {invoice.description || "ندارد"}
            </span>
          </div>

          {/* خلاصه فاکتور: تعداد اقلام و جمع کل */}
          <div className="flex flex-col sm:flex-row justify-between mt-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              تعداد کل اقلام: <span className="font-medium">{invoice.totalItems}</span>
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              جمع کل فاکتور: <span className="font-medium">{Number(invoice.totalPrice).toLocaleString()} تومان</span>
            </p>
          </div>

          {/* ایجاد کننده */}
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              ایجاد کننده:
            </span>
            {invoice.createdBy ? (
              <UserMiniInfo
                userImage={invoice.createdBy.userImage}
                name={invoice.createdBy.name}
                username={invoice.createdBy.userUniqName}
              />
            ) : (
              <span className="ml-2 text-gray-600 dark:text-gray-400">-</span>
            )}
          </div>

          {/* تاریخ ایجاد */}
          <div className="flex ">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
             تاریخ:
            </span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formattedCreatedAt}
            </span>
          </div>

          {/* بخش اطلاعات ویرایش‌کننده (تنها در صورت ویرایش نمایش داده می‌شود) */}
          {isEdited && (
            <>
              {/* ویرایش کننده */}
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  ویرایش کننده:
                </span>
                {invoice.updatedBy ? (
                  <UserMiniInfo
                    userImage={invoice.updatedBy.userImage}
                    name={invoice.updatedBy.name}
                    username={invoice.updatedBy.userUniqName}
                  />
                ) : (
                  <span className="ml-2 text-gray-600 dark:text-gray-400">-</span>
                )}
              </div>

              {/* تاریخ ویرایش */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  ویرایش شده در:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {formattedUpdatedAt}
                </span>
              </div>
            </>
          )}
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex justify-center items-center gap-2 ">
          <Tooltip.Provider>
            {/* ویرایش فاکتور */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <ActionButton
                  onClick={() => calculateProductStock("677cf7c005cca83b6f8a7279")}
                  Icon={EditSvg}
                  label="ویرایش فاکتور"
                  className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400"
                />
              </Tooltip.Trigger>
              <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                ویرایش فاکتور
                <Tooltip.Arrow className="fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Root>

            {/* حذف فاکتور */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <ActionButton
                  onClick={() => handleDeleteInvoice(invoice._id)}
                  Icon={DeleteSvg}
                  label="حذف فاکتور"
                  className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
                />
              </Tooltip.Trigger>
              <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                حذف فاکتور
                <Tooltip.Arrow className="fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Root>
               {/* دکمه نمایش اطلاعات ویرایش شده (تنها در صورت ویرایش) */}
      {isEdited && (
        <div className="mt-4">
          <button
            onClick={handleToggleEditInfo}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          >
            {showEditInfo ? "مخفی کردن اطلاعات ویرایش" : "نمایش اطلاعات ویرایش"}
          </button>
          {showEditInfo && (
            <div className="mt-2 bg-gray-100 dark:bg-zinc-600 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                تاریخ ویرایش: <span className="font-medium">{formattedUpdatedAt}</span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ویرایش شده توسط:{" "}
                {invoice.updatedBy ? invoice.updatedBy.name : "-"}
              </p>
            </div>
          )}
        </div>
      )}
          </Tooltip.Provider>
        </div>
      </div>

   
    </div>
  );
};

export default InvoiceCard;
