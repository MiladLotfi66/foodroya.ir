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
import { pasteAccounts } from "./accountActions";
 

function AccountManage() {
  const [accounts, setAccounts] = useState([]);
  const [isOpenAddAccount, setIsOpenAddAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [clipboard, setClipboard] = useState({
    accounts: [],
    action: null, // "copy" یا "cut"
  });
  
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

  //////////////
  const handleToggleSelectAccount = useCallback((accountId) => {
    setSelectedAccounts((prevSelected) => {
      if (prevSelected.includes(accountId)) {
        return prevSelected.filter((id) => id !== accountId);
      } else {
        return [...prevSelected, accountId];
      }
    });
  }, []);

  const handleCopySelectedAccounts = async () => {
    try {
      // فرض کنید یک اکشن یا API برای کپی حساب‌ها تعریف شده باشد
      // مثلا copyAccounts(selectedAccounts) یا هر منطق دیگری
      setClipboard({ accounts: selectedAccounts, action: "copy" });
      setSelectedAccounts([]);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("خطا در کپی حساب‌ها.");
    }
  };
  
  const handleCutSelectedAccounts = async () => {
    try {
      // فرض کنید یک اکشن یا API برای برش حساب‌ها تعریف شده باشد
      setClipboard({ accounts: selectedAccounts, action: "cut" });
      setSelectedAccounts([]);
    } catch (error) {
      console.error("Cut error:", error);
      toast.error("خطا در برش حساب‌ها.");
    }
  };
  
  const handlePasteAccounts = async () => {
    try {
      // تعیین والد مقصد: آخرین حساب موجود در مسیر انتخاب شده
      const parentAccountId = path[path.length - 1]?.id;
  
      // فرض می‌کنیم تابع pasteAccounts وجود داشته باشد
      const result = await pasteAccounts(clipboard.accounts, parentAccountId, ShopId, clipboard.action);
      
      if (result.success) {
        toast.success("حساب‌ها با موفقیت درج شدند.");
        // تازه کردن لیست حساب‌ها برای والد مقصد
        refreshAccounts(parentAccountId);
        // پاک کردن clipboard بعد از عملیات موفق
        setClipboard({ accounts: [], action: null });
      } else {
        toast.error(result.message || "خطا در چسباندن حساب‌ها.");
      }
    } catch (error) {
      console.error("Paste error:", error);
      toast.error("خطا در چسباندن حساب‌ها.");
    }
  };
  
  ////////////////
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
      if (account.accountType==="گروه حساب"||account.accountType==="دسته بندی کالا"||account.accountType==="انبار") {
        const newPath = [...path, { id: account._id, title: account.title, accountCode: account.accountCode }];
        setPath(newPath);
        refreshAccounts(account._id);
      }
    },
    [path, refreshAccounts]
  );

  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddAccount && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 "
          onClick={handleOverlayClick}
        >



          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-2 md:p-4"
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

      <div className=" bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36 p-2 md:p-4 ">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت حساب‌ها</h1>
          {path.length > 1 && (
            <button
              className="h-8 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-2 md:mt-4 p-2 md:p-4"
              aria-label="add account"
              onClick={handleAddAccountClick}
            >
افزودن
            </button>

          )}

        </div>
                    {/* //////////////////////// */}
                    <div className="flex justify-end gap-2 md:gap-4 mb-2 md:mb-4 text-xs md:text-base">
                        {/* دکمه چسباندن */}

{clipboard.accounts.length > 0 && (
  <button
    className="h-8 md:h-14 bg-blue-600 rounded-xl hover:bg-blue-700 text-white p-2 md:p-4 mb-1 md:mb-2"
    onClick={handlePasteAccounts}
  >
چسباندن  </button>
)}
  {/* دکمه کپی */}
  {selectedAccounts.length > 0 && (
    <button
      className="h-8 md:h-14 bg-green-600 rounded-xl hover:bg-green-700 text-white p-2 md:p-4"
      onClick={() => handleCopySelectedAccounts()}
    >کپی
    </button>
  )}
  {/* دکمه برش */}
  {selectedAccounts.length > 0 && (
    <button
      className="h-8 md:h-14 bg-red-600 rounded-xl hover:bg-red-700 text-white p-2 md:p-4"
      onClick={() => handleCutSelectedAccounts()}
    >
      برش  </button>
  )}

</div>

{/* /////////////////////// */}
        {/* اضافه کردن کامپوننت Breadcrumb */}
        <Breadcrumb path={path} onBreadcrumbClick={handleBreadcrumbClick} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-2 gap-2 md:gap-6 p-2 md:p-4 pb-8 md:pb-16 max-h-[50vh]  overflow-y-auto">
          {accounts.map((account) => (
            <AccountCard
              className="p-2 md:p-4"
              key={account._id}
              account={account}
              editFunction={() => handleEditClick(account)}
              onDelete={() => handleDeleteAccount(account._id)}
              onAccountClick={() => handleAccountClick(account)} // اضافه کردن رویداد کلیک
              onToggleSelect={handleToggleSelectAccount}
              isSelected={selectedAccounts.includes(account._id)}
        
            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default AccountManage;
