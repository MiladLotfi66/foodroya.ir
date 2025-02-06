"use client";

import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import { Toaster, toast } from "react-hot-toast";
import { deleteAccount, activateAccount, deactivateAccount } from "./accountActions";
import UserMicroCard from "@/module/home/UserMicroCard";
import { MdAccountBalance } from "react-icons/md";
import { RiAccountPinBoxLine } from "react-icons/ri";
import { FaPersonShelter } from "react-icons/fa6";
import { TbCashRegister } from "react-icons/tb";
import { AiFillProduct } from "react-icons/ai";
import { MdFolderOpen } from "react-icons/md";
import { FaBarsProgress } from "react-icons/fa6";
import { LuWarehouse } from "react-icons/lu";
import { FaRegNewspaper } from "react-icons/fa";
import { SlNotebook } from "react-icons/sl";

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
        return <FaBarsProgress className="text-3xl"/>;
      case "حساب انتظامی":
        return <SlNotebook  className="text-3xl"/>

        // return <LuNotebookPen className="text-3xl"/>;
      case "حساب عادی":
        return <FaRegNewspaper className="text-3xl"/>;
      case "کالا":
        return <AiFillProduct className="text-3xl"/>;
      case "اشخاص حقیقی":
        return <RiAccountPinBoxLine className="text-3xl"/>;
      case "گروه حساب":
        return <MdFolderOpen className="text-3xl"/>;
      case "انبار":
        return <LuWarehouse className="text-3xl"/>;
      case "صندوق":
        return <TbCashRegister className="text-3xl"/>;
      case "اشخاص حقوقی":
        return <FaPersonShelter className="text-3xl"/>;
      case "حساب بانکی":
        return <MdAccountBalance className="text-3xl"/>;
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
            {!account.isSystem && (account.accountType!=="گروه حساب"||account.accountType!=="دسته بندی کالا"||account.accountType!=="انبار")&&(
              <input
                type="checkbox"
                className="h-6 w-6"
                checked={isSelected}
                onChange={(e) => onToggleSelect(account._id)}
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
