"use client";
import React, { useState, useEffect } from "react";
import {
   DeleteFinancialDocuments,
} from "./FinancialDocumentsServerActions";
import UserMiniInfo from "@/module/home/UserMiniInfo";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ChevronDown from "@/module/svgs/ChevronDown";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

function FinancialDocumentCard({
  financialDocument: initialFinancialDocument,
  editFunction,
  onDelete,
  ShopId,
  onError,
  hasAddPermission,
  hasEditPermission,
  hasDeletePermission
}) {
  const [financialDocument, setFinancialDocument] = useState(
    initialFinancialDocument
  ); // مدیریت وضعیت سند مالی
  const [showAllTransactions, setShowAllTransactions] = useState(false); // مدیریت نمایش تراکنش‌ها
  const [showEditFields, setShowEditFields] = useState(false); // مدیریت نمایش فیلدهای ویرایش
    const { baseCurrency} = useShopInfoFromRedux();
  
  const decimalPlaces = baseCurrency.decimalPlaces;


  useEffect(() => {
    // هر بار که props سند مالی تغییر می‌کند، state محلی به‌روزرسانی می‌شود
    setFinancialDocument(initialFinancialDocument);
  }, [initialFinancialDocument]);



  const deleteFunc = async () => {
    const isConfirmed = window.confirm("آیا از حذف این سند مالی اطمینان دارید؟");
    if (!isConfirmed) return; // اگر کاربر لغو کند، ادامه نده
  
    try {
      if (initialFinancialDocument.transactions[0].type==="invoice") {
        onError("برای حذف سند مالی فاکتور ها باید خود فاکتور را حذف کنید."); // ارسال پیام خطا به والد

      }else{

        const response = await DeleteFinancialDocuments(financialDocument._id,ShopId);
        if (response.status === 200) {
          onDelete(); // حذف سند مالی از لیست
        } else {
          onError("خطا در حذف سند مالی."); // ارسال پیام خطا به والد

        }
      }
    } catch (error) {
      // toast.error("خطا در حذف سند مالی.");
    }
  };



  const description = financialDocument.description || "";

  // تعیین تعداد تراکنش‌های نمایش داده شده بر اساس وضعیت showAllTransactions
  const transactionsToDisplay = showAllTransactions
    ? financialDocument.transactions
    : financialDocument.transactions.slice(0, 4);

  // فرمت تاریخ به صورت قابل خواندن
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fa-IR", options);
  };
  const formatter = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  return (
    <div className="relative bg-white dark:bg-zinc-700 shadow-lg rounded-2xl p-6 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="hidden">
          <DeleteSvg />
          <EditSvg />
          <ChevronDown />
        </div>
        <div>
          <span className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-gray-200">
            ایجاد کننده:
            {(
              <UserMiniInfo
                userImage={financialDocument.createdBy.userImage}
                name={financialDocument.createdBy.name}
                username={financialDocument.createdBy.userUniqName}
              />
            ) || "-"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Delete Icon */}
          {hasDeletePermission &&

          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="delete"
            onClick={deleteFunc}
          >
            <use href="#DeleteSvg"></use>
          </svg>
}
          {/* Edit Icon */}
          {hasEditPermission &&

          <svg
            width="24"
            height="24"
            className="cursor-pointer"
            aria-label="edit"
            onClick={editFunction}
          >
            <use href="#EditSvg"></use>
          </svg>
}
        </div>
      </div>

      {/* بخش واحد پول و توضیحات (یکبار نمایش داده می‌شود) */}
      <div className="  flex justify-between mb-4">
        
        <div className="flex justify-between mb-4" >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            تاریخ ایجاد: {formatDate(financialDocument.createdAt)}
          </span>
           <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            نوع: {financialDocument?.type?"فاکتور":"سند مالی"}
          </span>
        </div>
      </div>

      {/* بخش نمایش تراکنش‌ها */}
      <div className="overflow-x-auto ">
        {financialDocument.transactions.length > 0 ? (
          <>
            <table className="min-w-full bg-transparent h-44 ">
              <thead>
                <tr className="bg-gray-200 dark:bg-zinc-600">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    عنوان حساب
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    بدهکار
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                    بستانکار
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactionsToDisplay?.map((transaction, index) => (
                  <tr
                    key={transaction?._id}
                    className={`border-b dark:border-zinc-500 ${
                      index % 2 === 0
                        ? "bg-gray-50 dark:bg-zinc-700"
                        : "bg-white dark:bg-zinc-800"
                    } hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors`}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {transaction?.account?.title}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {formatter.format(transaction?.debit)}

                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {formatter.format(transaction?.credit)}

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* دکمه نمایش/مخفی کردن فیلدهای ویرایش */}
            <div className="flex items-center justify-between">

            <div>
              <button
                onClick={() => setShowEditFields(!showEditFields)}
                className="mt-2 px-4 py-2 bg-gray-300 dark:bg-zinc-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-zinc-500 transition-colors"
              >
                {showEditFields ? (
                  <span className="flex">
                    کمتر
                    <svg className="w-5 h-5 rotate-180">
                      <use href="#ChevronDown"></use>
                    </svg>
                  </span>
                ) : (
                  <span className="flex">
                    {" "}
                    بیشتر
                    <svg className="w-5 h-5 ">
                      <use href="#ChevronDown"></use>
                    </svg>
                  </span>
                )}
              </button>
            </div>

            {/* دکمه نمایش/مخفیکه کردن تراکنش‌ها */}
            {financialDocument.transactions.length > 4 && (
              <div 
              className="mt-2 flex justify-center">

                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showAllTransactions
                    ? "نمایش کمتر"
                    : `${
                        financialDocument.transactions.length - 4
                      } تراکنش دیگر`}
                </button>
              </div>
            )}
                        </div>

          </>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            تراکنشی وجود ندارد.
          </p>
        )}
      </div>

      {/* بخش اطلاعات اضافی */}
      <div className="mt-6 space-y-2">
        {/* ///////////////توضیحات//////////////// */}
        {showEditFields && description && (
          <div className="my-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              توضیحات: {description}
            </span>
          </div>
        )}
        {/* فیلد تاریخ ویرایش */}
        {showEditFields && (
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              تاریخ ویرایش: {formatDate(financialDocument.updatedAt)}
            </span>
          </div>
        )}
        {/* فیلد ویرایش‌کننده */}
        {showEditFields && (
          <div>
            <span className="flex gap-2 items-center text-sm font-medium text-gray-700 dark:text-gray-200">
              ویرایش کننده:
              {(
                <UserMiniInfo
                  userImage={financialDocument.updatedBy.userImage}
                  name={financialDocument.updatedBy.name}
                  username={financialDocument.updatedBy.userUniqName}
                />
              ) || "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialDocumentCard;
