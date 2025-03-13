// app/products/ProductManage.jsx
"use client";
import { useSession } from "next-auth/react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import React, { useState, useEffect, useCallback } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import { FaFolder, FaSearch, FaPlus } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import product_placeholder from "@/public/Images/PNG/product-placeholder.png";
import Breadcrumb from "@/utils/Breadcrumb";
import {
  GetAllAccountsByOptions,
  GetAccountIdBystoreIdAndAccountCode,
} from  "../panel/Account/accountActions";
import Pagination from "../panel/Product/Pagination";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import FallbackImage from "@/utils/fallbackImage";


function Warehouse() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductFile, setSelectedProductFile] = useState(null); // افزودن استیت جدید
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([]); // مسیر برای Breadcrumb
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [anbarAccountId, setAnbarAccountId] = useState(null); // شناسه حساب انبار
  const [parentAccountId, setParentAccountId] = useState(null); // شناسه حساب والد
  const [currentPage, setCurrentPage] = useState(1); // وضعیت صفحه فعلی
  const [totalPages, setTotalPages] = useState(0); // وضعیت کل صفحات
  const limit = 12; // تعداد آیتم‌ها در هر صفحه
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { currentShopId, shopPanelImage } = useShopInfoFromRedux();
  const ShopId = currentShopId;
  const BGImage = shopPanelImage;
  const fetchAnbarAccountId = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await GetAccountIdBystoreIdAndAccountCode(
        ShopId,
        "1000-1-2"
      );
      if (response.success && response.accountId) {
        setAnbarAccountId(response.accountId);
        setParentAccountId(response.accountId);
        setPath([{ id: response.accountId, title: "انبار" }]);
      } else {
        throw new Error("حساب انبار یافت نشد.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب انبار:", error);
      toast.error("خطا در دریافت حساب انبار.");
    }
  }, [isAuthenticated, ShopId]);

  // از useCallback برای بهینه‌سازی عملکرد استفاده می‌کنیم
  const refreshAccounts = useCallback(async () => {
    if (!parentAccountId) {
      console.error("شناسه والد موجود نیست.");
      return;
    }

    try {
      setLoading(true);
      setSelectedParentAccount(parentAccountId);
      const options = {
        fields: [
          "_id",
          "title",
          "accountType",
          "accountStatus",
          "productId",
          "Features",
        ], // انتخاب فیلدهای مورد نیاز
        populateFields: [
          {
            path: "productId",
            populate: [
              { path: "pricingTemplate" },
              { path: "tags" },
              { path: "Features", populate: [{ path: "featureKey" }] },
            ],
          },
        ],
        limit,
        page: currentPage, // شماره صفحه فعلی
        sort: { accountType: 1 }, // ترتیب‌بندی بر اساس نوع حساب
        additionalFilters: searchQuery
          ? { title: { $regex: searchQuery, $options: "i" } } // فیلتر جستجو
          : {},
      };
      const response = await GetAllAccountsByOptions(
        ShopId,
        parentAccountId,
        options
      );
      if (response.status === 200) {
        console.log("response",response);
        
        setAccounts(response.Accounts);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
      } else {
        throw new Error(response.message || "خطا در دریافت حساب‌ها.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب‌ها:", error);
      toast.error("خطا در دریافت حساب‌ها.");
    } finally {
      setLoading(false);
    }
  }, [
    ShopId,
    parentAccountId,
    currentPage,
    searchQuery,
    limit,
    setSelectedParentAccount,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnbarAccountId();
    }
  }, [isAuthenticated, fetchAnbarAccountId]);

  useEffect(() => {
    if (isAuthenticated  && parentAccountId) {
      refreshAccounts();
    }
  }, [isAuthenticated, parentAccountId, refreshAccounts]);

  // تابع برای باز کردن حساب و نمایش زیرحساب‌ها
  const handleOpenAccount = useCallback((account) => {
    setPath((prevPath) => [
      ...prevPath,
      { id: account._id, title: account.title },
    ]);
    setParentAccountId(account._id);
    setCurrentPage(1); // بازنشانی به صفحه اول هنگام باز کردن حساب جدید
  }, []);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback(
    (index) => {
      const selectedCrumb = path[index];
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      setParentAccountId(selectedCrumb.id);
      setCurrentPage(1); // بازنشانی به صفحه اول هنگام کلیک روی Breadcrumb
    },
    [path]
  );



  // مدیریت تغییر در جستجو
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // بازنشانی به صفحه اول هنگام جستجو
  };

  // تابع حذف حساب (به‌روزرسانی شده برای هماهنگی با صفحه‌بندی)



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


  return (
    <FormTemplate BGImage={BGImage}>
     
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="flex items-center justify-between  ">
          <h1 className="text-xl  md:text-3xl font-MorabbaBold p-1">مدیریت محصول</h1>
       
        </div>

        <div>
          <div className="account-categories container mx-auto p-1 md:p-2">
            {/* نوار Breadcrumb */}

            <Breadcrumb path={path} onBreadcrumbClick={handleBreadcrumbClick} />

            {/* نوار جستجو و دکمه افزودن حساب */}
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <div className="flex gap-2 items-center w-1/2">
                <FaSearch className="mr-2 text-gray-500" />
                <input
                  type="text"
                  placeholder="جستجو حساب‌ها..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
            {/* لیست حساب‌ها */}
            {loading ? (
              <p>در حال بارگذاری...</p>
            ) : (
              <>
                <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[65vh]  overflow-y-auto p-2 ">
                  {accounts.map((account) => (
                    <div key={account._id}>
                      {account.accountType === "کالا" && (
                        <div className="flex-col items-center justify-between gap-2  max-w-full   sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl  transition-transform transform hover:scale-105 p-1">
                          <div className="flex  justify-center items-center gap-1 mt-2">
                            {/* بخش تصاویر */}
                            <div className="relative items-center w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
                              <FallbackImage
                                className="w-full h-full object-cover rounded-md"
                                src={
                                  account?.productId?.images?.[0] ||
                                  product_placeholder
                                }
                                alt={account?.productId?.title}
                                width={100}
                                height={100}
                                quality={40}
                                placeholder={product_placeholder}
                              />

                              {account.productId?.images?.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs sm:text-sm px-2 py-1 rounded">
                                  +{account.productId.images.length - 1}
                                </div>
                              )}
                            </div>

                            {/* بخش اطلاعات محصول و دکمه‌ها */}
                            <div className="flex flex-col flex-1 m-1 md:m-2 h-15 text-xs sm:text-sm md:text-base p-1">
                              {/* عنوان محصول */}
                              <h2
                                className="text-start text-gray-800 dark:text-gray-200 max-w-full truncate"
                                title={account?.productId?.title}
                              >
                                {account?.productId?.title}
                              </h2>
                              {/* موجودی محصول */}
                              <h2 className="text-start text-gray-800 dark:text-gray-200 line-clamp-2">
                                {account?.productId?.stock}{" "}
                                {account?.product?.unit}
                              </h2>
                            </div>
                          </div>

                        
                        </div>
                      )}

                      {account.accountType === "دسته بندی کالا" && (
                        <div
                          onClick={() => handleOpenAccount(account)} // استفاده از handleOpenAccount برای باز کردن حساب
                          className="flex-col items-center justify-between gap-2  sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl  transition-transform transform hover:scale-105 p-2 "
                        >
                          <div className="flex justify-center items-center gap-1 mt-2">
                            {/* بخش آیکون دسته‌بندی */}
                            <FaFolder className="text-yellow-500 text-xl md:text-2xl  items-center w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0" />

                            {/* بخش اطلاعات دسته‌بندی و دکمه‌ها */}
                            <div className="flex flex-col  text-center flex-1 m-1 md:m-2 h-15 text-xs sm:text-sm md:text-base mb-2">
                              {/* عنوان دسته بندی */}
                              <p className="text-start text-gray-800 dark:text-gray-200 line-clamp-2">
                                {account.title}
                              </p>
                            </div>
                          </div>

                       
                        </div>
                      )}
                    </div>
                  ))}
                  {accounts.length === 0 && <p>حسابی یافت نشد.</p>}
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
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default Warehouse;
