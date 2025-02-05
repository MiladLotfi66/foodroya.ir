"use client";

import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import CopySvg from "@/module/svgs/CopySvg";
import CutSvg from "@/module/svgs/CutSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import { Toaster, toast } from "react-hot-toast";
import { deleteAccount, activateAccount, deactivateAccount } from "./accountActions";
import UserMicroCard from "@/module/home/UserMicroCard";
// import PropTypes from 'prop-types';

function AccountCard({ account: initialAccount, editFunction, onDelete, onAccountClick = () => {} }) {
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

  return (
    <div className="relative bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl p-4">
      
      <div className="flex justify-between items-center">
        <div>
        <div className="hidden">
        <DeleteSvg/>
        <EditSvg/>
        <CopySvg/>
        <CutSvg/>
        <EyeslashSvg/>
        <EyeSvg/>
      </div>
          {/* افزودن رویداد کلیک به عنوان حساب */}
          <h2
            className="text-xl font-bold text-blue-700 dark:text-teal-400 cursor-pointer"
            onClick={handleAccountClick}
          >
            {account.title}
          </h2>
          <p className="text-sm">مانده حساب: {account.balance}</p>
          <p className="text-sm">کد حساب: {account.accountCode}</p>
          <p className="text-sm">نوع حساب: {account.accountType}</p>
          <p className={`text-sm ${account.accountStatus === "فعال" ? "text-green-500" : "text-red-500"}`}>
            وضعیت: {account.accountStatus}
          </p>
          <p className="text-sm flex items-center">
            <span>ایجاد کننده:</span>
            <UserMicroCard user={account.createdBy} />
          </p>
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
                    {/* copy Icon */}
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="Copy"
              // onClick={CopyFunction}
            >
              <use href="#CopySvg"></use>
            </svg>
                      {/* Cut Icon */}
          {!account.isSystem && (
            <svg
              width="24"
              height="24"
              className="cursor-pointer"
              aria-label="Cut"
              // onClick={CutFunction}
            >
              <use href="#CutSvg"></use>
            </svg>
          )}


        </div>
      </div>
      <Toaster />
    </div>
  );
}



export default AccountCard;
