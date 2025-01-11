"use client";

import { useParams } from 'next/navigation';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import Breadcrumb from '@/utils/Breadcrumb';
import { GetAllAccounts } from '../Account/accountActions';
import Pagination from "../Product/Pagination";
import { Toaster, toast } from "react-hot-toast";
import { accountIcons, DefaultIcon } from '../Account/accountIcons';

function SelectAccountModal({ onSelect, onCancel, onError, selectionMode }) {
  const params = useParams();
  const { ShopId } = params;
  const [selectedParentAccount, setSelectedParentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [path, setPath] = useState([{ id: null, title: "همه حساب‌ها", accountCode: "" }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentAccountId, setParentAccountId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const limit = 12;

  const allowedAccountTypes = [
    "صندوق",
    "حساب عادی",
    "حساب بانکی",
    "کالا",
    "اشخاص حقیقی",
    "اشخاص حقوقی",
    "حساب انتظامی"
  ];

  const refreshAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedParentAccount(parentAccountId);
      const response = await GetAllAccounts(ShopId, parentAccountId, currentPage, limit, searchQuery);
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
  }, [ShopId, parentAccountId, currentPage, limit, searchQuery]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const handleBreadcrumbClick = useCallback(
    (index) => {
      const newPath = path.slice(0, index + 1);
      setPath(newPath);
      const selectedCrumb = newPath[newPath.length - 1];
      setParentAccountId(selectedCrumb.id);
    },
    [path]
  );

  const handleSelectAccount = (account) => {
    if (allowedAccountTypes.includes(account.accountType)) {
      setSelectedAccount(account);
      onSelect(account);
      const newPath = [...path, { id: account._id, title: account.title, accountCode: account.accountCode }];
      setPath(newPath);
      setParentAccountId(account._id);
    } else {
        setSelectedAccount(account);
        const newPath = [...path, { id: account._id, title: account.title, accountCode: account.accountCode }];
        setPath(newPath);
        setParentAccountId(account._id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts;
    return accounts.filter(account => 
      account?.title.toLowerCase().includes(searchQuery.toLowerCase()) 
      ||
      account.accountCode.toLowerCase().includes(searchQuery.toLowerCase()
    )
    );
  }, [accounts, searchQuery]);

  return (
    <div>
      <div className="flex justify-between p-2 md:p-5 mt-2 md:mt-4">
        <h1 className="text-3xl font-MorabbaBold">انتخاب حساب معین</h1>
        <button
          className="h-8 bg-red-600 rounded-xl hover:bg-red-700 text-white px-4"
          onClick={onCancel}
        >
          بستن
        </button>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          {/* می‌توانید دکمه افزودن حساب را اینجا اضافه کنید */}
        </div>

        {/* لیست حساب‌ها یا اقلام */}
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : (
          <>
            <ul className="accounts-list grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map(account => {
                  const IconComponent = accountIcons[account?.accountType] || DefaultIcon;
                  return (
                    <li
                      key={account._id}
                      onClick={() => handleSelectAccount(account)}
                      className={`flex items-center p-4 border rounded cursor-pointer hover:bg-gray-100 ${
                        selectedAccount?.id === account._id ? 'bg-blue-100 border-blue-400' : ''
                      }`}
                    >
                      <IconComponent className="text-2xl text-blue-500 mr-3" />
                      <div>
                        <h2 className="text-lg font-semibold">{account.title}</h2>
                        <p className="text-sm text-gray-500">{account.accountCode}</p>
                      </div>
                    </li>
                  );
                })
              ) : (
                <p>حسابی یافت نشد.</p>
              )}
            </ul>

            {/* کامپوننت Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <Toaster />
    </div>
  );
}

export default SelectAccountModal;
