'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import FormTemplate from '@/templates/generalcomponnents/formTemplate';
import TextPage from '@/module/svgs/TextPageSvg';
import { getUserAccountsAndDocuments } from '@/templates/panel/FinancialDocument/FinancialDocumentsServerActions';

const UserFinancialDocumentsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // فیلترها
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [documentType, setDocumentType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // فرمت‌کننده اعداد
  const formatter = new Intl.NumberFormat('fa-IR');

  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading') return;
      if (!session) {
        router.push('/signin');
        return;
      }

      setIsLoading(true);
      try {
        const result = await getUserAccountsAndDocuments();
        console.log("result",result);
        
        if (result.status === 200) {
          setDocuments(result.documents);
          setAccounts(result.accounts);
          setError(null);
        } else {
          setError(result.message || 'خطا در دریافت اطلاعات');
          toast.error(result.message || 'خطا در دریافت اطلاعات');
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات: ' + err.message);
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  // تنظیمات استایل برای React-Select
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#e2e8f0',
      borderRadius: '0.375rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e1'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      padding: '8px 12px',
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#e5e7eb' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:active': {
        backgroundColor: '#2563eb',
        color: 'white'
      },
      cursor: 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 12px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#374151'
    })
  };

  // گزینه‌های حساب برای React-Select
  const accountOptions = [
    {
      value: 'all',
      label: (
        <div className="text-sm">همه حساب‌ها</div>
      )
    },
    ...accounts.map(account => ({
      value: account.id,
      label: (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {account.storeLogo && (
              <img
                src={account.storeLogo}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium">{account.title}</span>
          </div>
          <div className="text-xs text-gray-500 pr-7">
            {account.storeName}
          </div>
          <div className="text-xs text-gray-600 pr-7">
            مانده: {formatter.format(account.balance)} ریال
          </div>
        </div>
      )
    }))
  ];

  const getDocumentTypeDisplay = (type) => {
    switch(type) {
      case 'سند مالی':
        return 'سند مالی';
      case 'invoice':
        return 'فاکتور';
      case 'Sale':
        return 'فاکتور فروش';
      case 'PurchaseReturn':
        return 'فاکتور برگشت از خرید';
      case 'Purchase':
        return 'فاکتور خرید';
         case 'SaleReturn':
        return 'فاکتور برگشت از فروش';
        case 'Waste':
        return 'فاکتور ضایعات';
      default:
        return 'سایر';
    }
  };
  
  // فیلتر کردن اسناد
  const getFilteredDocuments = () => {
    let filtered = documents;

    // فیلتر بر اساس حساب
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(doc => 
        doc.relatedAccounts && doc.relatedAccounts.some(acc => acc.accountId === selectedAccount)
      );
    }

    // فیلتر بر اساس نوع سند
    if (documentType !== 'all') {
      filtered = filtered.filter(doc => doc.type === documentType);
    }

    // فیلتر بر اساس تاریخ
    if (dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.lastUpdated);
        switch (dateRange) {
          case 'today':
            return docDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            return docDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return docDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // مرتب‌سازی
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'desc' 
            ? new Date(b.lastUpdated) - new Date(a.lastUpdated)
            : new Date(a.lastUpdated) - new Date(b.lastUpdated);
        case 'amount':
          const aAmount = getDocumentAmount(a);
          const bAmount = getDocumentAmount(b);
          return sortOrder === 'desc' 
            ? bAmount - aAmount
            : aAmount - bAmount;
        default:
          return 0;
      }
    });
  };

  // تابع کمکی برای محاسبه مبلغ سند
  const getDocumentAmount = (doc) => {
    if (doc.amount) return doc.amount;
    
    // اگر مبلغ مستقیماً موجود نبود، از تراکنش‌های مرتبط محاسبه می‌کنیم
    if (doc.relatedAccounts && doc.relatedAccounts.length > 0) {
      // جمع مبالغ بدهکار
      return doc.relatedAccounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
    }
    
    return 0;
  };

  const filteredDocuments = getFilteredDocuments();
  
  // تعیین وضعیت سند (به عنوان مثال، همه تکمیل شده هستند)
  const getDocumentStatus = (doc) => {
    return doc.status || 'completed';
  };

  return (
    <FormTemplate>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            اسناد مالی
          </h1>
          {/* فیلترها */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                انتخاب حساب
              </label>
              <Select
                value={accountOptions.find(option => option.value === selectedAccount)}
                onChange={(option) => setSelectedAccount(option.value)}
                options={accountOptions}
                styles={customStyles}
                isRTL={true}
                placeholder="انتخاب حساب"
                className="text-sm"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                نوع سند
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">همه انواع سند</option>
                <option value="سند مالی">سند مالی</option>
                <option value="Purchase">فاکتور خرید</option>
                <option value="Sale">فاکتور فروش</option>
                <option value="PurchaseReturn">فاکتور برگشت از خرید</option>
                <option value="SaleReturn">فاکتور برگشت از فروش</option>
                <option value="Waste">ضایعات</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                بازه زمانی
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="all">همه زمان‌ها</option>
                <option value="today">امروز</option>
                <option value="week">هفته اخیر</option>
                <option value="month">ماه اخیر</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                مرتب‌سازی
              </label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="date-desc">جدیدترین</option>
                <option value="date-asc">قدیمی‌ترین</option>
                <option value="amount-desc">بیشترین مبلغ</option>
                <option value="amount-asc">کمترین مبلغ</option>
              </select>
            </div>
          </div>

          {/* نمایش اسناد */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <TextPage className="w-24 h-24 mx-auto mb-4" />
              <p className="text-gray-500">هیچ سند مالی یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => {
                const amount = getDocumentAmount(doc);
                const status = getDocumentStatus(doc);
                
                return (
                  <Link
                    key={doc.id}
                    href={`/panel/financial-documents/${doc.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        {doc.shopLogo ? (
                          <Image
                            src={doc.shopLogo}
                            alt={doc.shopName || 'فروشگاه'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">{doc.shopName?.charAt(0) || 'ف'}</span>
                          </div>
                        )}
                        <div className="mr-3">
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {doc.shopName || 'فروشگاه'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doc.date}
                          </p>
                        </div>
                      </div>
                      <div className="mb-4">
                       
                        <div className="mt-1">
                          <span className="text-xs inline-block px-2 py-1 rounded bg-gray-100 text-gray-600">
                          {getDocumentTypeDisplay(doc.type)}

                          </span>
                        </div>
                      </div>
                      {/* نمایش مبلغ بدهکار و بستانکار */}
<div className="flex flex-col gap-1">
  {doc.relatedAccounts?.map((account) => (
    <div key={account.accountId} className="flex justify-between items-center text-sm">
      <span className="text-gray-600">{account.accountTitle}:</span>
      <div className="flex gap-4">
        {account.debit > 0 && (
          <span className="text-green-600">
            {formatter.format(account.debit)} بدهکار
          </span>
        )}
        {account.credit > 0 && (
          <span className="text-red-600">
            {formatter.format(account.credit)} بستانکار
          </span>
        )}
      </div>
    </div>
  ))}
</div>
<p className=" mt-2 text-xs text-gray-600 dark:text-gray-300">
                          {doc.title || 'سند مالی'}
                        </p>

                   
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FormTemplate>
  );
};

export default UserFinancialDocumentsPage;

