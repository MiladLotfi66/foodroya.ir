// app/accounts/AccountManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import AccountCard from "./AccountCard";
import AddAccount from "./AddAccount";
import Breadcrumb from "@/utils/Breadcrumb"; // وارد کردن کامپوننت Breadcrumb
import { Toaster, toast } from "react-hot-toast";
import { GetAllAccounts } from "./accountActions"; // فرض می‌کنیم تابع GetAllAccounts وجود دارد
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

 

function AccountManage() {
  const [accounts, setAccounts] = useState([]);
  const [isOpenAddAccount, setIsOpenAddAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [path, setPath] = useState([{ id: null, title: "همه حساب‌ها", accountCode: "" }]); // مسیر اولیه با اطلاعات کامل
  const {
    currentShopId,
    shopPanelImage,
     } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
   const BGImage=shopPanelImage;

  // بهینه‌سازی refreshAccounts با استفاده از useCallback
  const refreshAccounts = useCallback(
    async (parentId = null) => {
      try {
        if (!ShopId) {
          console.error("شماره یکتای فروشگاه موجود نیست.");
          return;
        }
        if (!ShopId) {
          console.error("فروشگاهی با این نام یافت نشد.");
          return;
        }
        const response = await GetAllAccounts(ShopId, parentId);

        if (response.status === 200) {
          setAccounts(response.Accounts);
        } else {
          throw new Error(response.message || "خطا در دریافت حساب‌ها.");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast.error("خطا در دریافت حساب‌ها.");
      }
    },
    [ShopId]
  );

  useEffect(() => {
    // بارگذاری حساب‌های ریشه زمانی که کامپوننت بارگذاری می‌شود
    refreshAccounts();
  }, [refreshAccounts]);

  const handleDeleteAccount = useCallback((accountId) => {
    setAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account._id !== accountId)
    );
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddAccount(false);
      setSelectedAccount(null);
    }
  }, []);

  const handleEditClick = useCallback((account) => {
    setSelectedAccount(account);
    setIsOpenAddAccount(true);
  }, []);

  const handleAddAccountClick = useCallback(() => {
    setIsOpenAddAccount(true);
    setSelectedAccount(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddAccount(false);
    setSelectedAccount(null);
  }, []);

  // تابع برای مدیریت کلیک روی breadcrumb
  const handleBreadcrumbClick = useCallback(
    (index) => {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      const selectedCrumb = newPath[newPath.length - 1];
      refreshAccounts(selectedCrumb.id);
    },
    [path, refreshAccounts]
  );

  // تابع برای مدیریت کلیک روی حساب‌ها برای رفتن به زیرمجموعه‌ها
  const handleAccountClick = useCallback(
    (account) => {
      const newPath = [...path, { id: account._id, title: account.title, accountCode: account.accountCode }];
      setPath(newPath);
      refreshAccounts(account._id);
    },
    [path, refreshAccounts]
  );

  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddAccount && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddAccount
              account={selectedAccount}
              parentAccount={path[path.length - 1].id !== null ? path[path.length - 1] : null} // ارسال حساب والد
              onClose={handleCloseModal}
              refreshAccounts={() => refreshAccounts(path[path.length - 1]?.id)}
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-MorabbaBold">مدیریت حساب‌ها</h1>
          {path.length > 1 && (
            <button
              className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
              aria-label="add account"
              onClick={handleAddAccountClick}
            >
              افزودن حساب
            </button>
          )}
        </div>

        {/* اضافه کردن کامپوننت Breadcrumb */}
        <Breadcrumb path={path} onBreadcrumbClick={handleBreadcrumbClick} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {accounts.map((account) => (
            <AccountCard
              className="p-2 md:p-4"
              key={account._id}
              account={account}
              editFunction={() => handleEditClick(account)}
              onDelete={() => handleDeleteAccount(account._id)}
              onAccountClick={() => handleAccountClick(account)} // اضافه کردن رویداد کلیک
            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default AccountManage;
