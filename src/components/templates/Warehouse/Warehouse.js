// app/products/ProductManage.jsx
"use client";
import { useSession } from "next-auth/react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import React, { useState, useEffect, useCallback } from "react";
import ShareSvg from "@/module/svgs/ShareSvg";
import { FaFolder, FaSearch } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import product_placeholder from "@/public/Images/PNG/product-placeholder.png";
import Breadcrumb from "@/utils/Breadcrumb";
import { GetAllAccountsByOptions } from "../panel/Account/accountActions";
import Pagination from "../panel/Product/Pagination";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import FallbackImage from "@/utils/fallbackImage";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function ProductManage() {
  const params = useParams();
  const router = useRouter();
  const { AccountId } = params;

  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([]); // مسیر برای Breadcrumb
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12; // تعداد آیتم‌ها در هر صفحه

  const { currentShopId, shopPanelImage } = useShopInfoFromRedux();
  const ShopId = currentShopId;
  const BGImage = shopPanelImage;

  // از useCallback برای بهینه‌سازی عملکرد استفاده می‌کنیم
  const refreshAccounts = useCallback(async () => {
    if (!AccountId) {
      console.error("شناسه حساب موجود نیست.");
      return;
    }

    try {
      setLoading(true);
      const options = {
        fields: [
          "_id",
          "title",
          "accountType",
          "accountStatus",
          "productId",
          "Features",
        ],
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
        page: currentPage,
        sort: { accountType: 1 },
        additionalFilters: searchQuery
          ? { title: { $regex: searchQuery, $options: "i" } }
          : {},
      };
      
      const response = await GetAllAccountsByOptions(
        ShopId,
        AccountId,
        options
      );
      
      if (response.status === 200) {
        setAccounts(response.Accounts);
        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        
        // اگر اطلاعات path خالی است و عنوان حساب از پاسخ قابل استخراج است
        if (path.length === 0 && response.accountTitle) {
          setPath([{ id: AccountId, title: response.accountTitle }]);
        }
      } else {
        throw new Error(response.message || "خطا در دریافت حساب‌ها.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب‌ها:", error);
      toast.error("خطا در دریافت حساب‌ها.");
    } finally {
      setLoading(false);
    }
  }, [ShopId, AccountId, currentPage, searchQuery, limit, path.length]);

  useEffect(() => {
    if (AccountId) {
      refreshAccounts();
    }
  }, [AccountId, refreshAccounts]);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback(
    (index) => {
      const selectedCrumb = path[index];
      // به جای استفاده از router.push، از مسیر مطلق استفاده می‌کنیم
      router.push(`/${ShopId}/Warehouse/${selectedCrumb.id}`);
    },
    [path, router]
  );

  // مدیریت تغییر در جستجو
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // بازنشانی به صفحه اول هنگام جستجو
  };

  // رندر آیتم محصول
  const renderProductItem = (account) => (
    <div className="flex-col items-center justify-between gap-2 max-w-full sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl transition-transform transform hover:scale-105 p-1">
      <div className="flex justify-center items-center gap-1 mt-2">
        {/* بخش تصاویر */}
        <div className="relative items-center w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
          <FallbackImage
            className="w-full h-full object-cover rounded-md"
            src={account?.productId?.images?.[0] || product_placeholder}
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
        <div className="flex flex-col flex-1 m-1 md:m-2 h-15 text-xs sm:text-sm md:text-base p-1 max-w-[60%]">
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
        
        {/* دکمه اشتراک‌گذاری */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // جلوگیری از انتشار رویداد کلیک به والد
          }}
          className="flex items-center rounded-md transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900"
        >
          <ShareSvg width={18} height={18} />
        </button>
      </div>
    </div>
  );

  // رندر آیتم دسته بندی
  const renderCategoryItem = (account) => (
    <Link href={`/${ShopId}/Warehouse/${account._id}`}>
      <div className="flex-col items-center justify-between gap-2 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl transition-transform transform hover:scale-105 p-2 cursor-pointer">
        <div className="flex justify-center items-center gap-1 mt-2">
          {/* بخش آیکون دسته‌بندی */}
          <FaFolder className="text-yellow-500 text-xl md:text-2xl items-center w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0" />

          {/* بخش اطلاعات دسته‌بندی و دکمه‌ها */}
          <div className="flex flex-col text-center flex-1 m-1 md:m-2 h-15 text-xs sm:text-sm md:text-base mb-2">
            {/* عنوان دسته بندی */}
            <p className="text-start text-gray-800 dark:text-gray-200 line-clamp-2">
              {account.title}
            </p>
          </div>
          
          {/* دکمه اشتراک‌گذاری */}
          <button 
            onClick={(e) => {
              e.preventDefault(); // جلوگیری از انتقال به صفحه جدید
              e.stopPropagation(); // جلوگیری از انتشار رویداد کلیک به والد
              // اینجا می‌توانید عملکرد اشتراک‌گذاری را اضافه کنید
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900"
          >
            <ShareSvg width={18} height={18} />
          </button>
        </div>
      </div>
    </Link>
  );

  return (
    <FormTemplate BGImage={BGImage}>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-MorabbaBold p-1">مدیریت محصول</h1>
        </div>

        <div>
          <div className="account-categories container mx-auto p-1 md:p-2">
            {/* نوار Breadcrumb */}
            <Breadcrumb path={path} onBreadcrumbClick={handleBreadcrumbClick} />

            {/* نوار جستجو */}
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
                <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[60vh] overflow-x-hidden overflow-y-auto p-2">
                  {accounts.map((account) => (
                    <div key={account._id}>
                      {account.accountType === "کالا" && renderProductItem(account)}
                      {account.accountType === "دسته بندی کالا" && renderCategoryItem(account)}
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

export default ProductManage;

