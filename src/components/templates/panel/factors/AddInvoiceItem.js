"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { FaFolder, FaSearch } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import Breadcrumb from '@/utils/Breadcrumb';
import { GetAllAccountsByOptions, GetAccountIdBystoreIdAndAccountCode } from '../Account/accountActions';
import Pagination from "../Product/Pagination";
import { Toaster, toast } from "react-hot-toast";

function AddInvoiceItem({ onClose, onAddNewInvoiceItem ,invoiceType ,  initialPath = ['انبار'],
  initialParentAccountId = null,
  onPathChange,
  onParentAccountIdChange
}) { // باقی‌مانده پراپ‌ها تغییر نکرده‌اند
  const params = useParams();
  const { ShopId } = params;
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState(initialPath);
  const [parentAccountId, setParentAccountId] = useState(initialParentAccountId);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [anbarAccountId, setAnbarAccountId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12;
  const { register,  formState: { errors } } = useForm();
  const allowedInvoiceTypes = ["Sale","PurchaseReturn","Waste"];
  const isAllowedInvoiceType = allowedInvoiceTypes.includes(invoiceType);

  const fetchAnbarAccountId = useCallback(async () => {
    try {
      const response = await GetAccountIdBystoreIdAndAccountCode(ShopId, "1000-1-2");
      if (response.success && response.accountId) {
        setAnbarAccountId(response.accountId);
        if (!parentAccountId) { // فقط اگر parentAccountId از والد دریافت نشده باشد
          setParentAccountId(response.accountId);
          setPath(['خانه', { id: response.accountId, title: "انبار" }]);
          onPathChange(['خانه', { id: response.accountId, title: "انبار" }]);
          onParentAccountIdChange(response.accountId);
        }
      } else {
        throw new Error("حساب انبار یافت نشد.");
      }
    } catch (error) {
      console.error('خطا در دریافت حساب انبار:', error);
    }
  }, [ShopId, parentAccountId, onPathChange, onParentAccountIdChange]);

  useEffect(() => {
    if (ShopId) {
      fetchAnbarAccountId();
    }
  }, [ShopId, fetchAnbarAccountId]);

  // بهینه‌سازی refreshAccounts با استفاده از useCallback
  const refreshAccounts = useCallback(async () => {
    if (!parentAccountId) {
      console.error("شناسه والد موجود نیست.");
      return;
    }

    try {
      setLoading(true);
      setSelectedParentAccount(parentAccountId);
      const options = {
        fields: ['_id', 'title', 'accountType', 'accountStatus', 'productId', 'Features'],
        populateFields: [
          {
            path: 'productId',
            populate: [
              { path: 'pricingTemplate' },
              { path: 'tags' },
              { path: 'Features',
                populate: [
                  { path: 'featureKey' },
                ]
              }
            ]
          },
        ],
        limit,
        page: currentPage,
        sort: { accountType: 1 },
        additionalFilters: searchQuery
          ? { title: { $regex: searchQuery, $options: 'i' } }
          : {}
      };
      const response = await GetAllAccountsByOptions(ShopId, parentAccountId, options);

      if (response.status === 200) {
        setAccounts(response.Accounts);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } else {
        throw new Error(response.message || "خطا در دریافت حساب‌ها.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب‌ها:", error);
      // toast.error("خطا در دریافت حساب‌ها.");
    } finally {
      setLoading(false);
    }
  }, [ShopId, parentAccountId, currentPage, searchQuery, limit]);

  // بارگذاری اولیه: دریافت حساب انبار
  // useEffect(() => {
  //   if (ShopId) {
  //     fetchAnbarAccountId();
  //   }
  // }, [ShopId]);

  // واکنش به تغییرات parentAccountId, currentPage, یا searchQuery
  useEffect(() => {
    if (parentAccountId) {
      refreshAccounts();
    }
  }, [parentAccountId, currentPage, searchQuery, refreshAccounts]);

  // توابع مدیریت باز کردن حساب و به‌روزرسانی مسیر
  const handleOpenAccount = useCallback((account) => {
    const newPath = [...path, { id: account._id, title: account.title }];
    setPath(newPath);
    onPathChange(newPath); // اطلاع دادن به والد
    setParentAccountId(account._id);
    onParentAccountIdChange(account._id); // اطلاع دادن به والد
    setCurrentPage(1);
  }, [path, onPathChange, onParentAccountIdChange]);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback((index) => {
    const selectedCrumb = path[index];
    let newPath;
    let newParentAccountId;
    if (typeof selectedCrumb === 'string') {
      // برچسب ابتدایی "خانه" را مدیریت می‌کنیم
      newPath = ['خانه'];
      newParentAccountId = anbarAccountId;
    } else {
      newPath = path.slice(0, index + 1);
      newParentAccountId = selectedCrumb.id;
    }
    setPath(newPath);
    onPathChange(newPath); // اطلاع دادن به والد
    setParentAccountId(newParentAccountId);
    onParentAccountIdChange(newParentAccountId); // اطلاع دادن به والد
    setCurrentPage(1);
  }, [path, anbarAccountId, onPathChange, onParentAccountIdChange]);


  // سایر توابع مدیریت انتخاب حساب
  const handleSelectAccount = (account) => {
    if (account.accountType === "کالا") {
      if (!account.productId?.stock && isAllowedInvoiceType) {
        toast.error("کالا با موجودی ۰ را نمی توان به فاکتور فروش ، برگشت از خرید و ضایعات اضافه کرد.");
      } else {
        const invoiceItemData = {
          _id: account.productId._id,
          productId: account.productId._id,
          title: account.productId.title,
          quantity: 1,
          image: account.productId.images?.[0] || "https://via.placeholder.com/150",
        };
        onAddNewInvoiceItem(invoiceItemData);
        onClose();
      }
    } else if (account.accountType === "دسته بندی کالا") {
      handleOpenAccount(account);
    }
  };
  

  return (
    <div >
      <div className="flex justify-between p-2 md:p-5 mt-2 md:mt-4">
        <h1 className="text-3xl font-MorabbaBold">انتخاب اقلام فاکتور</h1>
      </div>
      <div>
        <div className="account-categories container mx-auto p-4">
          {/* نوار Breadcrumb */}
          <Breadcrumb
            path={path}
            onBreadcrumbClick={handleBreadcrumbClick}
          />

          {/* نوار جستجو و دکمه افزودن حساب */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center w-1/2">
              <FaSearch className="mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="جستجو حساب‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            
          </div>

          {/* لیست محصولات */}
          {loading ? (
            <p>در حال بارگذاری...</p>
          ) : (
            <>
              <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {accounts.map(account => (
                  <div
                    key={account._id}
                    onClick={() => handleSelectAccount(account)}
                    className={`flex items-center gap-2 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-2 transition-transform transform hover:scale-105 cursor-pointer ${
                      account.accountType === "کالا" ? "border-2 border-teal-500" : ""
                    }`}
                  >
                    {/* بخش تصاویر یا آیکون دسته‌بندی */}
                    <div className="relative items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0">
                      {account.accountType === "کالا" ? (
                        <>
                          <img
                            src={account?.productId?.images?.[0] || "https://via.placeholder.com/150"}
                            alt={account?.productId?.title}
                            className="w-full h-full object-cover rounded-md mt-1"
                            loading="lazy"
                          />
                          {account.productId?.images?.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text:xs sm:text-sm px-2 py-1 rounded">
                              +{account.productId.images.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <FaFolder className="text-yellow-500 text-4xl mx-auto mt-4" />
                      )}
                    </div>

                    {/* بخش اطلاعات محصول یا دسته‌بندی */}
                    <div className="flex flex-col flex-1 m-2 h-15">
                      {/* عنوان محصول یا دسته‌بندی */}
                      <h2 className="flex text-center text-md text-gray-800 dark:text-gray-200 line-clamp-3 items-center">
                        {account?.accountType === "کالا" ? account?.productId?.title : account.title}
                      </h2> 
                       <h2 className="flex text-center text-md text-gray-800 dark:text-gray-200 line-clamp-3 items-center">
                        {account?.accountType === "کالا" ? <>
    {account.productId?.stock} {account.productId?.unit}
  </> : ""}
                      </h2>
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && <p>محصولی یافت نشد.</p>}
              </div>

              {/* کامپوننت Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}

        </div>
      </div>

      {/* مودال ایجاد حساب جدید (در صورت نیاز) */}
      {showCreateAccountModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowCreateAccountModal(false)}
        >
          <div
            className="relative bg-white dark:bg-zinc-700 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl mb-4">ایجاد حساب جدید</h2>
            <form >
              <div className="mb-4">
                <label htmlFor="title" className="block mb-2">عنوان حساب</label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: "عنوان حساب الزامی است" })}
                  className="w-full border rounded px-3 py-2"
                />
                {errors.title && <span className="text-red-500">{errors.title.message}</span>}
              </div>
              {/* افزودن فیلدهای دیگر در صورت نیاز */}
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowCreateAccountModal(false)} className="mr-2 px-4 py-2 bg-gray-300 rounded">
                  انصراف
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded">
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
            <Toaster />

    </div>
  );
}

export default AddInvoiceItem;
