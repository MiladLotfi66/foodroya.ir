// src/components/accounts/AccountCategories.js

import React, { useState, useEffect, useCallback } from 'react';
import { FaFolder, FaSearch, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import Breadcrumb from '@/utils/Breadcrumb';
import { createAccount, GetAllAccounts, GetAccountIdBystoreIdAndAccountCode } from '../Account/accountActions';

function AccountCategories({ onSelect, ShopId }) {
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([]); // مسیر برای Breadcrumb
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [anbarAccountId, setAnbarAccountId] = useState(null); // شناسه حساب انبار
  const [parentAccountId, setParentAccountId] = useState(null); // شناسه حساب والد

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // تابع برای دریافت شناسه حساب انبار
  const fetchAnbarAccountId = async () => {
    try {
      const response = await GetAccountIdBystoreIdAndAccountCode(ShopId, "1000-1");
      if (response.success && response.accountId) { // فرض بر این است که پاسخ شامل شناسه حساب است
        setAnbarAccountId(response.accountId);
        setParentAccountId(response.accountId);
        setPath([{ id: response.accountId, title: "انبار" }]); // تنظیم مسیر اولیه
      } else {
        throw new Error("حساب انبار یافت نشد.");
      }
    } catch (error) {
      console.error('خطا در دریافت حساب انبار:', error);
      toast.error("خطا در دریافت حساب انبار.");
    }
  };

  // تابع برای بارگذاری حساب‌ها بر اساس شناسه والد
  const refreshAccounts = useCallback(async (parentId) => {
    if (!parentId) {
      console.error("شناسه والد موجود نیست.");
      return;
    }

    try {
      setLoading(true);
      const response = await GetAllAccounts(ShopId, parentId);
      if (response.status === 200) {
        setAccounts(response.Accounts);
      } else {
        throw new Error(response.message || "خطا در دریافت حساب‌ها.");
      }
    } catch (error) {
      console.error("خطا در دریافت حساب‌ها:", error);
      toast.error("خطا در دریافت حساب‌ها.");
    } finally {
      setLoading(false);
    }
  }, [ShopId]);

  // بارگذاری اولیه: دریافت حساب انبار و سپس دریافت زیرحساب‌ها
  useEffect(() => {
    if (ShopId) {
      fetchAnbarAccountId();
    }
  }, [ShopId]);

  useEffect(() => {
    if (parentAccountId) {
      refreshAccounts(parentAccountId);
    }
  }, [parentAccountId, refreshAccounts]);

  // تابع برای باز کردن حساب و نمایش زیرحساب‌ها
  const handleOpenAccount = useCallback(async (account) => {
    setPath(prevPath => [...prevPath, { id: account._id, title: account.title }]);
    setParentAccountId(account._id);
  }, []);

  // تابع برای انتخاب حساب
  const handleSelectAccount = useCallback((account) => {
    onSelect(account);
  }, [onSelect]);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback(async (index) => {
    const selectedCrumb = path[index];
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setParentAccountId(selectedCrumb.id);
  }, [path]);

  // مدیریت ایجاد حساب جدید
  const onSubmitCreateAccount = async (data) => {
    const { name } = data;
    const parentId = parentAccountId;

    try {
      const payload = {
        title: name,
        accountType: "دسته بندی کالا",
        parentAccount: parentId,
        store: ShopId,
      };

      const response = await createAccount(payload);
      if (response.success) {
        toast.success('حساب جدید ایجاد شد');
        await refreshAccounts(parentId);
        reset();
        setShowCreateAccountModal(false);
      } else {
        throw new Error(response.message || "خطا در ایجاد حساب جدید.");
      }
    } catch (err) {
      console.error(err);
      toast.error('خطا در ایجاد حساب جدید');
    }
  };

  // مدیریت تغییر در جستجو
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // فیلتر کردن حساب‌ها بر اساس جستجو
  const filteredAccounts = accounts.filter(account =>
    account?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
              onChange={handleSearchChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button
            onClick={() => setShowCreateAccountModal(true)}
            className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            <FaPlus className="mr-1" /> ایجاد حساب
          </button>
        </div>

        {/* لیست حساب‌ها */}
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : (
          <div className="accounts-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredAccounts.map(account => (
              <div key={account._id}>
                <div
                  className="account-item border p-4 rounded hover:bg-gray-100 cursor-pointer flex flex-col items-center"
                  onClick={() => handleOpenAccount(account)} // استفاده از handleOpenAccount برای باز کردن حساب
                >
                  <FaFolder className="text-yellow-500 text-3xl mb-2" />
                  <p className="text-center">{account.title}</p>
                </div>
              </div>
            ))}
            {filteredAccounts.length === 0 && <p>حسابی یافت نشد.</p>}
          </div>
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

        <Toaster />
      </div>
    </div>
  );
}

export default AccountCategories;
