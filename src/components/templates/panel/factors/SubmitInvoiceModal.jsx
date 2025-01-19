import React, { useState, useEffect } from 'react';
import { GetAllAccountsByOptions } from '../Account/accountActions';
import { AddPurchaseInvoiceAction, AddSalesInvoiceAction, AddPurchaseReturnAction } from './invoiceItemsServerActions';
import { AddWasteAction ,AddSalesReturnAction} from './invoiceItemsServerActions';
const SubmitInvoiceModal = ({ isOpen, onClose, invoiceData, invoiceItems, invoiceType }) => {
  const [accounts, setAccounts] = useState([]);
  const [allocatedAccounts, setAllocatedAccounts] = useState([
    { accountId: '', amount: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const ShopId = invoiceData.ShopId;
  const currentInvoiceCustomerId = invoiceData.contact?._id || '';

  useEffect(() => {
    if (isOpen && ShopId && currentInvoiceCustomerId && invoiceType !== 'Waste') {
      fetchAccounts();
    }
  }, [isOpen, ShopId, currentInvoiceCustomerId, invoiceType]);

  // بازنشانی تخصیص حساب‌ها و حساب‌ها هنگام بستن مودال
  useEffect(() => {
    if (!isOpen) {
      setAllocatedAccounts([{ accountId: '', amount: 0 }]);
      setAccounts([]);
    }
  }, [isOpen]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const filterOptions = {
        $or: [
          { accountType: { $in: ["صندوق", "حساب بانکی"] } },
          { 
            accountType: { $in: ["اشخاص حقیقی", "اشخاص حقوقی"] },
            contact: currentInvoiceCustomerId
          }
        ],
      };

      const options = {
        fields: ['_id', 'title', 'accountType', 'accountStatus'],
        populateFields: [],
        sort: { accountType: -1 },
        additionalFilters: filterOptions
      };

      const response = await GetAllAccountsByOptions(ShopId, null, options);
      if (response.status === 200) {
        setAccounts(response.Accounts);
      } else {
        console.error('خطا در واکشی حساب‌ها:', response.message);
        alert('بازیابی حساب‌ها با مشکل مواجه شد.');
      }
    } catch (error) {
      console.error('خطای غیرمنتظره:', error);
      alert('یک خطای غیرمنتظره رخ داد.');
    } finally {
      setIsLoading(false);
    }
  };

  // توابع مدیریت تخصیص حساب‌ها
  const handleAccountChange = (index, field, value) => {
    const updatedAllocatedAccounts = [...allocatedAccounts];
    updatedAllocatedAccounts[index][field] = value;
    setAllocatedAccounts(updatedAllocatedAccounts);
  };

  const handleAddAccount = () => {
    setAllocatedAccounts([...allocatedAccounts, { accountId: '', amount: 0 }]);
  };

  const handleRemoveAccount = (index) => {
    const updatedAllocatedAccounts = [...allocatedAccounts];
    updatedAllocatedAccounts.splice(index, 1);
    setAllocatedAccounts(updatedAllocatedAccounts);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // اگر نوع فاکتور Waste نیست، اعتبارسنجی تخصیص حساب‌ها را انجام دهید
    if (invoiceType !== 'Waste') {
      // اعتبارسنجی چند حساب انتخاب شده
      if (allocatedAccounts.length === 0) {
        alert('لطفاً حداقل یک حساب را انتخاب کنید.');
        return;
      }
  
      // بررسی اینکه همه حساب‌ها انتخاب شده و مبالغ معتبر هستند
      for (let i = 0; i < allocatedAccounts.length; i++) {
        if (!allocatedAccounts[i].accountId) {
          alert(`لطفاً حساب در ردیف ${i + 1} را انتخاب کنید.`);
          return;
        }
        if (allocatedAccounts[i].amount <= 0) {
          alert(`مبلغ در ردیف ${i + 1} باید بزرگتر از صفر باشد.`);
          return;
        }
      }
  
      // محاسبه مجموع مبالغ تخصیص‌یافته و مقایسه با مبلغ کل فاکتور
      const totalAllocated = allocatedAccounts.reduce((sum, acc) => sum + Number(acc.amount), 0);
      const invoiceTotal = invoiceData.totalPrice || 0;
  
      if (totalAllocated !== invoiceTotal) {
        alert(`مجموع مبلغ تخصیص‌یافته (${totalAllocated}) با مبلغ کل فاکتور (${invoiceTotal}) مطابقت ندارد.`);
        return;
      }
    }
  
    // ایجاد داده‌های ارسال شده بر اساس نوع فاکتور
    const invoiceDataToSubmit = {
      storeId: ShopId,
      customerId: currentInvoiceCustomerId,
      type: invoiceType,
      totalAmount: invoiceData.totalPrice,
      invoiceItems, // شامل آیتم‌های فاکتور
      // سایر اطلاعات مورد نیاز
    };
  
    // اگر نوع فاکتور غیر از Waste بود، حساب‌ها را اضافه کنید
    if (invoiceType !== 'Waste') {
      invoiceDataToSubmit.accountAllocations = allocatedAccounts;
    }
  
    try {
      let response;
      switch(invoiceType) {
        case 'Purchase':
          response = await AddPurchaseInvoiceAction(invoiceDataToSubmit);
          break;
        case 'Sale':
          response = await AddSalesInvoiceAction(invoiceDataToSubmit);
          break;
        case 'PurchaseReturn':
          response = await AddPurchaseReturnAction(invoiceDataToSubmit);
          break;
        case 'SaleReturn':
          response = await AddSalesReturnAction(invoiceDataToSubmit);
          break;
        case 'Waste':
          response = await AddWasteAction(invoiceDataToSubmit);
          break;
        default:
          throw new Error('نوع فاکتور نامعتبر');
      }
      
      if (response.success) {
        alert('فاکتور با موفقیت ثبت شد.');
        onClose();
      } else {
        console.error('خطا در ثبت فاکتور:', response.message);
        // نمایش پیام خطای دقیق به کاربر
        alert(`ثبت فاکتور با خطا مواجه شد: ${response.message}`);
      }
    } catch (error) {
      console.error('خطای غیرمنتظره:', error);
      // بررسی اینکه آیا خطا دارای پیام است
      const errorMessage = error.message || 'یک خطای غیرمنتظره رخ داد.';
      alert(`یک خطای غیرمنتظره رخ داد: ${errorMessage}`);
    }
  };
  
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl mb-4">ثبت فاکتور</h2>
          
          {/* رندر کردن بخش تخصیص حساب‌ها مگر در حالت Waste */}
          {invoiceType !== 'Waste' && (
            <>
              {allocatedAccounts.map((allocation, index) => (
                <div key={index} className="mb-4 border-b pb-4">
                  <label htmlFor={`account-${index}`} className="block mb-2">حساب {index + 1}:</label>
                  <select
                    id={`account-${index}`}
                    value={allocation.accountId}
                    onChange={(e) => handleAccountChange(index, 'accountId', e.target.value)}
                    disabled={isLoading}
                    className="w-full mb-2 border rounded px-4 py-2"
                  >
                    <option value="" disabled>
                      {isLoading ? 'در حال بارگذاری...' : 'حساب را انتخاب کنید'}
                    </option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.title} ({account.accountType})
                      </option>
                    ))}
                  </select>

                  <label htmlFor={`amount-${index}`} className="block mb-2">مبلغ {index + 1}:</label>
                  <input
                    type="number"
                    id={`amount-${index}`}
                    min="0"
                    value={allocation.amount}
                    onChange={(e) => handleAccountChange(index, 'amount', e.target.value)}
                    className="w-full mb-2 border rounded px-4 py-2"
                    placeholder="مبلغ"
                  />

                  {/* دکمه حذف حساب، فقط اگر بیش از یک حساب وجود داشته باشد */}
                  {allocatedAccounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}

              {/* دکمه افزودن حساب */}
              <button
                type="button"
                onClick={handleAddAccount}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              >
                افزودن حساب
              </button>

              {/* نمایش مجموع مبالغ تخصیص‌یافته */}
              <div className="mb-4">
                <strong>مجموع تخصیص‌یافته:</strong> {allocatedAccounts.reduce((sum, acc) => sum + Number(acc.amount || 0), 0)}
              </div>
              <div className="mb-4">
                <strong>جمع کل فاکتور:</strong> {invoiceData.totalPrice}
              </div>
            </>
          )}

          {/* سایر فیلدهای مورد نیاز */}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              disabled={isLoading}
            >
              ثبت فاکتور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitInvoiceModal;
