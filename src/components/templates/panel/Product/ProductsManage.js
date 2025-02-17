// app/products/ProductManage.jsx
"use client";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import AddProduct from "./AddProduct";
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
  createAccount,
  GetAllAccountsByOptions,
  GetAccountIdBystoreIdAndAccountCode,
  pasteAccounts,
  deleteAccount,
  updateAccount,
} from "../Account/accountActions";
import { DeleteProducts } from "./ProductActions";
import Pagination from "./Pagination";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import FallbackImage from "@/utils/fallbackImage";

function ProductManage() {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [clipboard, setClipboard] = useState({
    accounts: [],
    action: null, // "copy" یا "cut"
  });
  const [isOpenAddProduct, setIsOpenAddProduct] = useState(false);
  const [isOpenEditCategory, setIsOpenEditCategory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentEditingAccount, setCurrentEditingAccount] = useState(null);
  const [selectedProductFile, setSelectedProductFile] = useState(null); // افزودن استیت جدید
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([]); // مسیر برای Breadcrumb
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
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
  const fetchAnbarAccountId = async () => {
    try {
      const response = await GetAccountIdBystoreIdAndAccountCode(
        ShopId,
        "1000-1-2"
      );
      if (response.success && response.accountId) {
        // فرض بر این است که پاسخ شامل شناسه حساب است
        setAnbarAccountId(response.accountId);
        setParentAccountId(response.accountId);
        setPath([{ id: response.accountId, title: "انبار" }]); // تنظیم مسیر اولیه
      } else {
        throw new Error("حساب انبار یافت نشد.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب انبار:", error);
      toast.error("خطا در دریافت حساب انبار.");
    }
  };

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

  // بارگذاری اولیه: دریافت حساب انبار
  useEffect(() => {
    if (ShopId) {
      fetchAnbarAccountId();
    }
  }, [ShopId]);

  // واکنش به تغییرات parentAccountId, currentPage, یا searchQuery
  useEffect(() => {
    if (parentAccountId) {
      refreshAccounts();
    }
  }, [parentAccountId, currentPage, searchQuery, refreshAccounts]);

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

  // مدیریت ایجاد حساب جدید
  const onSubmitCreateAccount = async (data) => {
    const { accountName } = data;
    const parentId = parentAccountId;
    try {
      const payload = {
        title: accountName,
        accountType: "دسته بندی کالا",
        parentAccount: parentId,
        store: ShopId,
      };

      const response = await createAccount(payload);
      if (response.success) {
        toast.success("حساب جدید ایجاد شد");
        await refreshAccounts();
        reset();
        setShowCreateAccountModal(false);
      } else {
        throw new Error(response.message || "خطا در ایجاد حساب جدید.");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در ایجاد حساب جدید");
    }
  };
  const onSubmitEditAccount = async (data) => {
    const { accountName } = data;
    const parentId = parentAccountId;
    try {
      const payload = {
        title: accountName,
        accountType: "دسته بندی کالا",
        parentAccount: parentId,
        store: ShopId,
      };

      const response = await updateAccount(currentEditingAccount, payload);
      if (response.success) {
        toast.success("حساب  ویرایش شد");
        await refreshAccounts();
        reset();
        setIsOpenEditCategory(false);
      } else {
        throw new Error(response.message || "خطا در  ویرایش حساب .");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطا در ویرایش حساب ");
    }
  };

  // مدیریت تغییر در جستجو
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // بازنشانی به صفحه اول هنگام جستجو
  };

  // تابع حذف حساب (به‌روزرسانی شده برای هماهنگی با صفحه‌بندی)
  const deleteFunc = async (productId, accountId) => {
    try {
      const response = await DeleteProducts(productId, accountId);

      if (response.status === 200) {
        setAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account._id !== accountId)
        );
      } else {
        handleError(response.message || "خطا در حذف حساب.");
      }
    } catch (error) {
      console.error("خطا در حذف حساب:", error);
      handleError(error.message || "خطای غیرمنتظره در حذف حساب.");
    }
  };

  const handleError = useCallback((errorMessage) => {
    // افزودن تابع handleError
    toast.error(errorMessage);
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
      const result = await pasteAccounts(
        clipboard.accounts,
        parentAccountId,
        ShopId,
        clipboard.action
      );
      console.log("result", result);

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
      setIsOpenAddProduct(false);
      setSelectedProduct(null);
      setSelectedProductFile(null); // ریست کردن فایل محصول
    }
  }, []);

  const handleEditCategoryClick = useCallback((accountId) => {
    setIsOpenEditCategory(true);
    setCurrentEditingAccount(accountId);
  }, []);
  const deleteCategoryFunc = async (accountId) => {
    const res = await deleteAccount(accountId);
    console.log("res", res);
    if (!res.success) {
      toast.error(res.message);
    } else {
      refreshAccounts();
    }
  };

  const handleEditClick = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedProductFile(null); // ریست کردن فایل محصول در حالت ویرایش
    setIsOpenAddProduct(true);
  }, []);

  const handleAddProductClick = useCallback(() => {
    setIsOpenAddProduct(true);
    setSelectedProduct(null);
    setSelectedProductFile(null); // ریست کردن فایل محصول در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddProduct(false);
    setSelectedProduct(null);
    setSelectedProductFile(null);
  }, []);

  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddProduct
              product={selectedProduct}
              productFile={selectedProductFile}
              onClose={handleCloseModal}
              refreshProducts={refreshAccounts}
              parentAccount={selectedParentAccount} // ارسال حساب والد
            />
          </div>
        </div>
      )}
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">
            مدیریت محصول
          </h1>
        </div>
        <div className="flex items-center gap-2 p-2">
          <button
            className="h-8 md:h-14 text-xs md:text-base bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-2 md:mt-4 p-2 md:p-4"
            aria-label="add product"
            onClick={handleAddProductClick}
          >
            افزودن
          </button>
          <button
            onClick={() => setShowCreateAccountModal(true)}
            className="h-8 md:h-14 text-xs md:text-base bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-2 md:mt-4 p-2 md:p-4"
          >
            ایجاد دسته بندی
          </button>

          {clipboard.accounts.length > 0 && (
            <button
              className="h-8 md:h-14 text-xs md:text-base bg-blue-600 rounded-xl hover:bg-blue-700 text-white mt-2 md:mt-4 p-2 md:p-4"
              onClick={handlePasteAccounts}
            >
              چسباندن{" "}
            </button>
          )}
          {/* دکمه کپی */}
          {selectedAccounts.length > 0 && (
            <button
              className="h-8 md:h-14 text-xs md:text-base bg-green-600 rounded-xl hover:bg-green-700 text-white mt-2 md:mt-4 p-2 md:p-4"
              onClick={() => handleCopySelectedAccounts()}
            >
              کپی
            </button>
          )}
          {/* دکمه برش */}
          {selectedAccounts.length > 0 && (
            <button
              className="h-8 md:h-14 text-xs md:text-base bg-red-600 rounded-xl hover:bg-red-700 text-white mt-2 md:mt-4 p-2 md:p-4"
              onClick={() => handleCutSelectedAccounts()}
            >
              برش{" "}
            </button>
          )}
        </div>

        <div>
          <div className="account-categories container mx-auto p-1 md:p-4">

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
                <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
                {accounts.map((account) => (
  <div key={account._id}>
    {account.accountType === "کالا" && (
      <div className="flex items-center gap-2 md:gap-4 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-1 md:p-4 transition-transform transform hover:scale-105">
        
        {/* بخش چک‌باکس */}
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={selectedAccounts.includes(account._id)}
          onChange={() => handleToggleSelectAccount(account._id)}
        />

        {/* بخش تصاویر */}
        <div className="relative items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0">
          <FallbackImage
            className="w-full h-full object-cover rounded-md"
            src={account?.productId?.images?.[0] || product_placeholder}
            alt={account?.productId?.title}
            width={150}
            height={150}
            quality={60}
            placeholder={product_placeholder}
          />
          {account.productId?.images?.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs sm:text-sm px-2 py-1 rounded">
              +{account.productId.images.length - 1}
            </div>
          )}
        </div>

        {/* بخش اطلاعات محصول و دکمه‌ها */}
        <div className="flex flex-col flex-1 m-2 h-15 text-base">
          {/* عنوان محصول */}
          <h2 className="text-start text-gray-800 dark:text-gray-200 line-clamp-3">
            {account?.productId?.title}
          </h2>
          {/* موجودی محصول */}
          <h2 className="text-start text-gray-800 dark:text-gray-200 line-clamp-3">
            {account?.productId?.stock} {account?.product?.unit}
          </h2>

          {/* دکمه‌های عملیات در یک ردیف */}
          <div className="flex gap-2 mt-4 justify-start">
            {/* دکمه ویرایش */}
            <button
              aria-label="ویرایش"
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => handleEditClick(account?.productId)}
            >
              <EditSvg />
            </button>
            {/* دکمه حذف */}
            <button
              aria-label="حذف"
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => deleteFunc(account.productId._id, account._id)}
            >
              <DeleteSvg />
            </button>
          </div>
        </div>
      </div>
    )}

    {account.accountType === "دسته بندی کالا" && (
      <div className="flex items-center gap-2 md:gap-4 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-2 md:p-4 transition-transform transform hover:scale-105">
        
        {/* بخش چک‌باکس */}
        <input
          type="checkbox"
          className="h-6 w-6"
          checked={selectedAccounts.includes(account._id)}
          onChange={() => handleToggleSelectAccount(account._id)}
        />

        {/* بخش آیکون دسته‌بندی */}
        <FaFolder className="text-yellow-500 text-xl md:text-2xl mb-2 items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0" />

        {/* بخش اطلاعات دسته‌بندی و دکمه‌ها */}
        <div className="flex flex-col flex-1 m-2 h-15 text-base">
          {/* عنوان دسته بندی */}
          <p className="text-start text-gray-800 dark:text-gray-200 line-clamp-3">
            {account.title}
          </p>

          {/* دکمه‌های عملیات در یک ردیف */}
          <div className="flex gap-2 mt-4 justify-start">
            {/* دکمه ویرایش */}
            <button
              aria-label="ویرایش"
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={(e) => {
                e.stopPropagation(); // جلوگیری از انتشار رویداد
                handleEditCategoryClick(account._id);
              }}
            >
              <EditSvg />
            </button>
            {/* دکمه حذف */}
            <button
              aria-label="حذف"
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={(e) => {
                e.stopPropagation(); // جلوگیری از انتشار رویداد
                deleteCategoryFunc(account._id);
              }}
            >
              <DeleteSvg />
            </button>
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

            {/* مدال ایجاد حساب جدید */}
            {showCreateAccountModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setShowCreateAccountModal(false)}
              >
                <div
                  className="relative bg-white rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl mb-4">ایجاد دسته بندی کالا</h2>
                  <form
                    onSubmit={handleSubmit(onSubmitCreateAccount)}
                    className="flex flex-col space-y-4"
                  >
                    <div>
                      <label className="block mb-1">نام دسته بندی</label>
                      <input
                        type="text"
                        {...register("accountName", { required: true })}
                        className="w-full border rounded px-3 py-2"
                      />
                      {errors.accountName && (
                        <p className="text-red-500">
                          نام دسته بندی الزامی است.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateAccountModal(false);
                          reset();
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        ایجاد
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* مدال ویرایش حساب  */}

            {isOpenEditCategory && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setIsOpenEditCategory(false)}
              >
                <div
                  className="relative bg-white rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl mb-4">ویرایش دسته بندی کالا</h2>
                  <form
                    onSubmit={handleSubmit(onSubmitEditAccount)}
                    className="flex flex-col space-y-4"
                  >
                    <div>
                      <label className="block mb-1">نام دسته بندی</label>
                      <input
                        type="text"
                        {...register("accountName", { required: true })}
                        className="w-full border rounded px-3 py-2"
                      />
                      {errors.accountName && (
                        <p className="text-red-500">
                          نام دسته بندی الزامی است.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenEditCategory(false);
                          reset();
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        ویرایش{" "}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default ProductManage;
