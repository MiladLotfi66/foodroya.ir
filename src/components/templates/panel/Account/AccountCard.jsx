"use client";

import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import { Toaster, toast } from "react-hot-toast";
import product_placeholder from "@/public/Images/PNG/product-placeholder.png"
import CashregisterIMG from "@/public/Images/PNG/cash_register.png"
import warehouseIMG from "@/public/Images/PNG/warehouse.png"
import personIMG from "@/public/Images/PNG/person.png"
import companyIMG from "@/public/Images/PNG/company.png"
import bankIMG from "@/public/Images/PNG/bank.png"
import categoryIMG from "@/public/Images/PNG/category.png"           
import productCategoryIMG from "@/public/Images/PNG/productCategory.png"           
import noteIMG from "@/public/Images/PNG/note.jpeg"
import secretAccountIMG from "@/public/Images/PNG/secretAccount.png"
import { deleteAccount, activateAccount, deactivateAccount } from "./accountActions";
import UserMicroCard from "@/module/home/UserMicroCard";
import Image from "next/image";
import FallbackImage from "@/utils/fallbackImage";

function AccountCard({ account: initialAccount, editFunction, onDelete, onAccountClick = () => {}, onToggleSelect, isSelected }) {
  const [account, setAccount] = useState(initialAccount);

  useEffect(() => {
    setAccount(initialAccount);
  }, [initialAccount]);

  const handleDelete = async () => {
    const confirmDelete = confirm("آیا از حذف این حساب مطمئن هستید؟");
    if (!confirmDelete) return;

    const result = await deleteAccount(account._id);
    if (result.success) {
      onDelete();
      toast.success("حساب با موفقیت حذف شد.");
    } else {
      toast.error(result.message || "خطا در حذف حساب.");
    }
  };

  const renderAccountIcon = (accountType) => {
    switch (accountType) {
      case "دسته بندی کالا":
       
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={productCategoryIMG}
        alt="تصویر دسته بندی کالا"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;
      case "حساب انتظامی":
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={secretAccountIMG}
        alt="تصویر حساب انتظامی"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;

      case "حساب عادی":
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={noteIMG}
        alt="تصویر حساب عادی"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;
      case "کالا":
        return  (
          <FallbackImage
          className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
          src={account?.productId?.images?.[0]} // استفاده از اولین تصویر موجود
          alt="تصویر کالا"
          width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
          height={32}
          quality={60}
          placeholder={product_placeholder}
        />

     
      )
        
      case "اشخاص حقیقی":
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={personIMG}
        alt="تصویر اشخاص حقیقی"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;
      case "گروه حساب":
      return  <Image
      className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
      src={categoryIMG}
      alt="تصویر گروه حساب"
      width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
      height={32}
      quality={60}
    />;     
     case "انبار":
        return  (
          <Image
          className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
          src={warehouseIMG}
          alt="تصویر انبار"
          width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
          height={32}
          quality={60}
        />
              )
      case "صندوق":
        return (<Image
          className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
          src={CashregisterIMG}
          alt="تصویر صندوق"
          width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
          height={32}
          quality={60}
        />);
      case "اشخاص حقوقی":
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={companyIMG}
        alt="تصویر اشخاص حقوقی"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;
            case "حساب بانکی":
        return  <Image
        className="rounded-md object-cover w-12 h-12" // تعیین اندازه و رفتار
        src={bankIMG}
        alt="تصویر حساب بانکی"
        width={32} // مطابقت با کلاس Tailwind (مثلاً w-8 = 32px)
        height={32}
        quality={60}
      />;
      default:
        return null;
    }
  };

  const handleActivate = async () => {
    const result = await activateAccount(account._id);
    if (result.success) {
      setAccount(result.data);
      toast.success("حساب فعال شد.");
    } else {
      toast.error(result.message || "خطا در فعال‌سازی حساب.");
    }
  };

  const handleDeactivate = async () => {
    const result = await deactivateAccount(account._id);
    if (result.success) {
      setAccount(result.data);
      toast.success("حساب غیرفعال شد.");
    } else {
      toast.error(result.message || "خطا در غیرفعال‌سازی حساب.");
    }
  };

  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick(account);
    }
  };
    const excludedAccountTypes = [
      "اشخاص حقوقی",
      "اشخاص حقیقی",
      "گروه حساب",
      "دسته بندی کالا",
      "انبار"
    ];
  
  

  return (
    <div className={`relative bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl p-4 ${account.accountStatus === "فعال" ? "border-2 border-green-500" : "border-2 border-red-500"}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="hidden">
            <DeleteSvg/>
            <EditSvg/>
            <EyeslashSvg/>
            <EyeSvg/>
          </div>
          {!account.isSystem && !excludedAccountTypes.includes(account.accountType) && (
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={isSelected}
          onChange={() => onToggleSelect(account._id)}
        />
      )}           
          <div className="flex items-center gap-4 mb-4">

            <div className="flex items-center ">
              {renderAccountIcon(account.accountType)}
            </div>
            <div
              className="flex text-xl font-bold text-blue-700 dark:text-teal-400 cursor-pointer hover:underline"
              onClick={handleAccountClick}
            >
              {account.title}
            </div>
          </div>

          {/* <p className="text-sm">مانده حساب: {account.balance}</p> */}
          {/* <p className="text-sm">کد حساب: {account.accountCode}</p> */}
          <p className="text-sm flex">
            نوع حساب: {account.accountType}
          </p>
          <p className={`text-sm ${account.accountStatus === "فعال" ? "text-green-500" : "text-red-500"}`}>
           {account.accountStatus}
          </p>
          <div className="text-sm flex gap-2 items-center">
            <span>ایجاد کننده:</span>
            <UserMicroCard user={account.createdBy} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Delete Icon */}
          {!account.isSystem && (
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="delete"
              onClick={handleDelete}
            >
              <use href="#DeleteSvg"></use>
            </svg>
          )}
          {/* Edit Icon */}
          {!account.isSystem && (
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="edit"
              onClick={editFunction}
            >
              <use href="#EditSvg"></use>
            </svg>
          )}
          {/* Enable/Disable Icon */}
          {!account.isSystem && (
            account.accountStatus === "فعال" ? (
              <svg
                width="24"
                height="24"
                className="cursor-pointer"
                aria-label="disable"
                onClick={handleDeactivate}
              >
                <use href="#EyeslashSvg"></use>
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                className="cursor-pointer"
                aria-label="enable"
                onClick={handleActivate}
              >
                <use href="#EyeSvg"></use>
              </svg>
            )
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default AccountCard;
