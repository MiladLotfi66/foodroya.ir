// app/products/ProductManage.jsx
"use client";
import { useSession } from "next-auth/react";
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
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";

function ProductManage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [hasViewPermission, setHasViewPermission] = useState(null);
  const [hasAddPermission, setHasAddPermission] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(null);
  const [hasDeletePermission, setHasDeletePermission] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

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

  const checkViewPermission = useCallback(async () => {
    if (!ShopId || !isAuthenticated) {
      setPermissionLoading(false);
      return;
    }

    try {
      const response = await getUserPermissionInShopAccessList(
        ShopId,
        "productsPermissions"
      );

      if (response.status === 200) {
        // بررسی اینکه آیا دسترسی view در آرایه hasPermission وجود دارد
        setHasViewPermission(response.hasPermission.includes("view"));

        setHasAddPermission(response.hasPermission.includes("add"));
        setHasEditPermission(response.hasPermission.includes("edit"));
        setHasDeletePermission(response.hasPermission.includes("delete"));
      } else {
        console.error("خطا در بررسی دسترسی:", response.message);
        setHasViewPermission(false);
        setHasAddPermission(false);
        setHasEditPermission(false);
        setHasDeletePermission(false);
      }
    } catch (error) {
      console.error("Error checking view permission:", error);
      setHasViewPermission(false);
      setHasAddPermission(false);
      setHasEditPermission(false);
      setHasDeletePermission(false);
      toast.error("خطا در بررسی دسترسی.");
    } finally {
      setPermissionLoading(false);
    }
  }, [ShopId, isAuthenticated]);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnbarAccountId();
      checkViewPermission(); // اضافه کردن این خط
    }
  }, [isAuthenticated, fetchAnbarAccountId, checkViewPermission]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission && parentAccountId) {
      refreshAccounts();
    }
  }, [isAuthenticated, hasViewPermission, parentAccountId, refreshAccounts]);

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

  if (status === "loading") {
    return <PermissionLoading BGImage={BGImage} />;
  }

  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  if (permissionLoading) {
    return <PermissionLoading BGImage={BGImage} />;
  }

  if (!hasViewPermission) {
    return <NoPermission />;
  }

  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 "
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%]  p-2"
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
        <div className="flex items-center justify-between  ">
          <h1 className="text-xl  md:text-3xl font-MorabbaBold p-1">مدیریت محصول</h1>
        <div className="flex items-center gap-1  p-1 md:p-2">
          {hasAddPermission && (
            <>
              <button
                className="h-8 md:h-10 text-xs text-center md:text-base bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-2 md:mt-4 p-2 "
                aria-label="add product"
                onClick={handleAddProductClick}
              >
                افزودن
              </button>
              <button
                onClick={() => setShowCreateAccountModal(true)}
                className="h-8 md:h-10 text-xs items-center md:text-base bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-2 md:mt-4 p-2 "
              >
                ایجاد دسته بندی
              </button>
            </>
          )}

          {clipboard.accounts.length > 0 && (
            <button
              className="h-8 md:h-10 text-xs items-center md:text-base bg-blue-600 rounded-xl hover:bg-blue-700 text-white mt-2 md:mt-4 p-2 "
              onClick={handlePasteAccounts}
            >
              چسباندن{" "}
            </button>
          )}
          {/* دکمه کپی */}

          {selectedAccounts.length > 0 && hasAddPermission && (
            <button
              className="h-8 md:h-10 text-xs items-center md:text-base bg-green-600 rounded-xl hover:bg-green-700 text-white mt-2 md:mt-4 p-2 "
              onClick={() => handleCopySelectedAccounts()}
            >
              کپی
            </button>
          )}

          {/* دکمه برش */}
          {selectedAccounts.length > 0 && hasEditPermission && (
            <button
              className="h-8 md:h-10 text-xs items-center md:text-base bg-red-600 rounded-xl hover:bg-red-700 text-white mt-2 md:mt-4 p-2 "
              onClick={() => handleCutSelectedAccounts()}
            >
              برش{" "}
            </button>
          )}
        </div>
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
                <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[52vh] md:max-h-[38vh] overflow-y-auto p-2 ">
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

                          {/* دکمه‌های عملیات در یک ردیف */}
                          <div className="flex  justify-around  w-full gap-1 md:gap-2 mt-2 md:mt-4 ">
                            {/* بخش چک‌باکس */}
                            <input
                              type="checkbox"
                              className="h-6 w-6"
                              checked={selectedAccounts.includes(account._id)}
                              onChange={() =>
                                handleToggleSelectAccount(account._id)
                              }
                            />

                            {/* دکمه ویرایش */}
                            {hasEditPermission && (
                              <button
                                aria-label="ویرایش"
                                className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={() =>
                                  handleEditClick(account?.productId)
                                }
                              >
                                <EditSvg />
                              </button>
                            )}
                            {/* دکمه حذف */}
                            {hasDeletePermission && (
                              <button
                                aria-label="حذف"
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                onClick={() =>
                                  deleteFunc(account.productId._id, account._id)
                                }
                              >
                                <DeleteSvg />
                              </button>
                            )}
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

                          {/* دکمه‌های عملیات در یک ردیف */}
                          <div className="flex gap-1 justify-around  w-full md:gap-2 mt-2 md:mt-4 ">
                            {/* بخش چک‌باکس */}
                            <input
                              type="checkbox"
                              className="h-6 w-6"
                              checked={selectedAccounts.includes(account._id)}
                              onClick={(e) => e.stopPropagation()} // اضافه کردن این خط
                              onChange={() =>
                                handleToggleSelectAccount(account._id)
                              }
                            />

                            {/* دکمه ویرایش */}
                            {hasEditPermission && (
                              <button
                                aria-label="ویرایش"
                                className="bg-blue-500 text-white p-1  rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation(); // جلوگیری از انتشار رویداد
                                  handleEditCategoryClick(account._id);
                                }}
                              >
                                <EditSvg />
                              </button>
                            )}
                            {/* دکمه حذف */}
                            {hasDeletePermission && (
                              <button
                                aria-label="حذف"
                                className="bg-red-500 text-white p-1  rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                onClick={(e) => {
                                  e.stopPropagation(); // جلوگیری از انتشار رویداد
                                  deleteCategoryFunc(account._id);
                                }}
                              >
                                <DeleteSvg />
                              </button>
                            )}
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
                      {hasAddPermission && (
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          ایجاد
                        </button>
                      )}
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
                      {hasEditPermission && (
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          ویرایش{" "}
                        </button>
                      )}
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
