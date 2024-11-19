// src/components/accounts/AccountCategories.js

import React, { useState, useEffect, useCallback } from 'react';
import { FaFolder, FaSearch, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'react-hot-toast';
import Breadcrumb from '@/utils/Breadcrumb';
import { createAccount, GetAllAccounts } from '../Account/accountActions'; // مسیر صحیح به accountActions.js
import CloseSvg from "@/module/svgs/CloseSvg";

function AccountCategories({ parentAccountNumber, onSelect, ParrentId, ShopId, onClose }) {
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([{ id: ParrentId, title: "انبار" }]); // مسیر اولیه
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // تابع برای بارگذاری حساب‌ها
  const refreshAccounts = useCallback(async (ParrentId) => {
    try {
      if (!ShopId) {
        console.error("فروشگاه ID موجود نیست.");
        return;
      }
      
      const response = await GetAllAccounts(ShopId, ParrentId);

      if (response.status === 200) {
        setAccounts(response.Accounts);
      } else {
        throw new Error(response.message || "خطا در دریافت حساب‌ها.");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("خطا در دریافت حساب‌ها.");
    }
  }, [ShopId]);

  // بارگذاری اولیه حساب‌ها و مسیر
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await refreshAccounts(ParrentId);

      if (parentAccountNumber) {
        try {
          const parentAccountResponse = await GetAllAccounts(ShopId, ParrentId);
          if (parentAccountResponse.status === 200 && parentAccountResponse.Accounts.length > 0) {
            const parentAccount = parentAccountResponse.Accounts[0];
            const newPath = [{ id: ParrentId, title: "انبار" }, { id: parentAccount._id, title: parentAccount.title }];
            setPath(newPath);
          }
        } catch (error) {
          console.error("Error fetching parent account:", error);
          toast.error("خطا در دریافت حساب والد.");
        }
      }
      setLoading(false);
    };
    initialLoad();
  }, [refreshAccounts, ShopId, ParrentId, parentAccountNumber]);

  // تابع برای باز کردن حساب و نمایش زیرحساب‌ها
  const handleOpenAccount = useCallback(async (account) => {
    const newPath = [...path, { id: account._id, title: account.title }];
    setPath(newPath);
    await refreshAccounts(account._id);
  }, [path, refreshAccounts]);

  // تابع برای انتخاب حساب
  const handleSelectAccount = useCallback((account) => {
    onSelect(account);
  }, [onSelect]);

  // مدیریت کلیک روی بخش‌های Breadcrumb
  const handleBreadcrumbClick = useCallback(async (index) => {
    const selectedCrumb = path[index];
    setPath(path.slice(0, index + 1));
    if (selectedCrumb.id) {
      await refreshAccounts(selectedCrumb.id);
    } else {
      await refreshAccounts(null);
    }
  }, [path, refreshAccounts]);

  // مدیریت ایجاد حساب جدید
  const onSubmitCreateAccount = async (data) => {
    const { name, type } = data;
    const parentNumber = path[path.length - 1].id;

    try {
      const payload = {
        title: name,
        accountType:"دسته بندی کالا",
        parentAccount: parentNumber,
        store:ShopId,
      };
      console.log("payload",payload);
      
      const response = await createAccount(payload);
      if (response.success) {
        toast.success('حساب جدید ایجاد شد');
        await refreshAccounts(parentNumber);
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

  // تعیین امکان افزودن حساب
  const canAddAccount = true; // می‌توانید شرایط خود را اضافه کنید

  return (

    <div >
      <div className="hidden">
        <CloseSvg />
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button
          aria-label="close"
          className="hover:text-orange-300"
          onClick={onClose}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          "انتخاب حساب والد"
        </h1>
      </div>

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
          {canAddAccount && (
            <button 
              onClick={() => setShowCreateAccountModal(true)} 
              className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              <FaPlus className="mr-1" /> ایجاد حساب
            </button>
          )}
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
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); // جلوگیری از فعال شدن onClick والد
                      handleSelectAccount(account); // استفاده از handleSelectAccount برای انتخاب حساب
                    }} 
                    className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    انتخاب
                  </button>
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
