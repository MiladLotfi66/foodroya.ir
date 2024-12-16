// app/components/templates/panel/factors/AddInvoiceItem.js

"use client";
import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { FaFolder, FaSearch } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import Breadcrumb from '@/utils/Breadcrumb';
import { createAccount, GetAllAccountsByOptions, GetAccountIdBystoreIdAndAccountCode } from '../Account/accountActions';
import Pagination from "../Product/Pagination";

function AddInvoiceItem({ invoiceItem, invoiceItemFile, onClose, refreshInvoiceItems, onAddNewInvoiceItem }) { // باقی‌مانده پراپ‌ها تغییر نکرده‌اند
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductFile, setSelectedProductFile] = useState(null);
  const params = useParams();
  const { ShopId } = params;
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState(['خانه']); // مقدار اولیه مسیر
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [anbarAccountId, setAnbarAccountId] = useState(null);
  const [parentAccountId, setParentAccountId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 12;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAnbarAccountId = async () => {
    try {
      const response = await GetAccountIdBystoreIdAndAccountCode(ShopId, "1000-1");
      if (response.success && response.accountId) {
        setAnbarAccountId(response.accountId);
        setParentAccountId(response.accountId);
        setPath([{ id: response.accountId, title: "انبار" }]);
      } else {
        throw new Error("حساب انبار یافت نشد.");
      }
    } catch (error) {
      console.error('خطا در دریافت حساب انبار:', error);
    }
  };

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
        fields: ['_id', 'title', 'accountType', 'accountStatus', 'productId','Features'],
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
    setPath(prevPath => [...prevPath, { id: account._id, title: account.title }]);
    setParentAccountId(account._id);
    setCurrentPage(1);
  }, []);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback((index) => {
    const selectedCrumb = path[index];
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setParentAccountId(selectedCrumb.id);
    setCurrentPage(1);
  }, [path]);

  // مدیریت تغییر در جستجو
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const onSubmitCreateAccount = async (data) => {
    try {
      const response = await createAccount(ShopId, data);
      if (response.success) {
        refreshAccounts();
        setShowCreateAccountModal(false);
        reset();
      } else {
        throw new Error(response.message || "خطا در ایجاد حساب.");
      }
    } catch (error) {
      console.error("خطا در ایجاد حساب:", error);
    }
  }
  const handleSelectProduct = (product) => {
    const invoiceItemData = {
      _id: product._id, // فرض بر این است که محصول دارای یک شناسه منحصر به فرد است
      productId: product._id,
      title: product.title,
      quantity: 1, // مقدار پیش‌فرض، می‌توانید این را به کاربر بدهید
      unitPrice: product.price, // فرض بر این است که محصول دارای قیمت است
      totalPrice: product.price, // برای مقدار اولیه
      // سایر فیلدهای مورد نیاز
      image: product.images?.[0] || "https://via.placeholder.com/150", // مثال
    };
    onAddNewInvoiceItem(invoiceItemData); // انتقال داده به والد
    onClose(); // بستن مدال
  };


  return (
    <div>
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
              <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(account => (
                  <div key={account._id}>
                    {account.accountType === "کالا" && (
                      <div 
                        className="flex items-center gap-2 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-2 transition-transform transform hover:scale-105"
                      >
                        {/* بخش تصاویر */}
                        <div className="relative items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0">
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
                        </div>

                        {/* بخش اطلاعات محصول */}
                        <div className="flex flex-col flex-1 m-2 h-15">
                          {/* عنوان محصول */}
                          <h2 className="flex text-center text-md text-gray-800 dark:text-gray-200 line-clamp-3 items-center">
                            {account?.productId?.title}
                          </h2>
                          {/* دکمه انتخاب محصول */}
                          <button
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            onClick={() => handleSelectProduct(account.productId)}
                          >
                            انتخاب
                          </button>
                        </div>
                      </div>
                    )}
                    {account.accountType === "دسته بندی کالا" && (
                      <div
                        className="flex items-center gap-2 sm:flex-col relative bg-white dark:bg-zinc-700 shadow-md rounded-2xl p-2 transition-transform transform hover:scale-105 m-2"
                        onClick={() => handleBreadcrumbClick(path.length)} // قابلیت تغییر مسیر
                      >
                        <FaFolder className="text-yellow-500 text-md mb-2 items-center w-24 h-24 sm:w-32 sm:h-32 lg:h-40 lg:w-40 flex-shrink-0" />
                        <p className="flex text-center h-15 line-clamp-3 items-center">{account.title}</p>
                      </div>
                    )}
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

          {/* مدال ایجاد محصول جدید */}
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
                <form onSubmit={handleSubmit(onSubmitCreateAccount)} className="flex flex-col space-y-4">
                  <div>
                    <label className="block mb-1">نام دسته بندی</label>
                    <input
                      type="text"
                      {...register('name', { required: true })}
                      className="w-full border rounded px-3 py-2"
                    />
                    {errors.name && <p className="text-red-500">نام دسته بندی الزامی است.</p>}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => { setShowCreateAccountModal(false); reset(); }}
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

          {/* <Toaster /> */}
        </div>
      </div>
      
      {/* <Toaster /> */}
    </div>
  );
}

export default AddInvoiceItem;
