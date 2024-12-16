import React, { useState, useEffect } from 'react';
import { GetAllAccountsByOptions } from '../Account/accountActions';// مسیر اکشن را جایگزین کنید
// import submitInvoice from 'path-to-submit-invoice-action'; // مسیر اکشن ثبت فاکتور را جایگزین کنید

const SubmitInvoiceModal = ({ isOpen, onClose, invoiceData, invoiceItems }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ShopId = invoiceData.ShopId;
  const currentInvoiceCustomerId = invoiceData.customer?._id || '';

  useEffect(() => {
    if (isOpen && ShopId && currentInvoiceCustomerId) {
      fetchAccounts();
    }
  }, [isOpen, ShopId, currentInvoiceCustomerId]);

  const fetchAccounts = async () => {
    
    setIsLoading(true);
    try {
      const filterOptions = {
        accountTypes: ["صندوق", "حساب بانکی", "اشخاص حقیقی", "اشخاص حقوقی"],
        customerId: currentInvoiceCustomerId
      };

      const response = await GetAllAccountsByOptions(ShopId,null,filterOptions);
      console.log("response",response);
      if (response.status===200) {
        const filteredAccounts = response.Accounts.filter(account => {
          // دسته اول: "صندوق" یا "حساب بانکی"
          if (["صندوق", "حساب بانکی"].includes(account.type)) {
            return true;
          }
          // دسته دوم: "اشخاص حقیقی" یا "اشخاص حقوقی" و مشتری همسان
          if (
            ["اشخاص حقیقی", "اشخاص حقوقی"].includes(account.type) &&
            account.customerId === currentInvoiceCustomerId
          ) {
            return true;
          }
          return false;
        });

        setAccounts(filteredAccounts);
      } else {
        // مدیریت خطا
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

  const handleAccountChange = (event) => {
    setSelectedAccountId(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAccountId) {
      alert('لطفاً یک حساب را انتخاب کنید.');
      return;
    }

    const invoiceDataToSubmit = {
      accountId: selectedAccountId,
      storeId: ShopId,
      customerId: currentInvoiceCustomerId,
      invoiceItems, // شامل آیتم‌های فاکتور
      // می‌توانید سایر اطلاعات مورد نیاز را اضافه کنید
    };

    try {
    //   const response = await submitInvoice(invoiceDataToSubmit);
      
    //   if (response.success) {
    //     // مدیریت موفقیت (مثلاً نمایش پیام موفقیت، بستن مودال، به‌روزرسانی وضعیت‌ها)
    //     alert('فاکتور با موفقیت ثبت شد.');
    //     onClose(); // بستن مودال
    //     // می‌توانید وضعیت‌های مرتبط را بازنشانی کنید
    //   } else {
    //     // مدیریت خطا
    //     console.error('خطا در ثبت فاکتور:', response.message);
    //     alert('ثبت فاکتور با خطا مواجه شد.');
    //   }
    } catch (error) {
      console.error('خطای غیرمنتظره:', error);
      alert('یک خطای غیرمنتظره رخ داد.');
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
          
          <label htmlFor="account" className="block mb-2">حساب:</label>
          <select
            id="account"
            value={selectedAccountId}
            onChange={handleAccountChange}
            disabled={isLoading}
            className="w-full mb-4 border rounded px-4 py-2"
          >
            <option value="" disabled>
              {isLoading ? 'در حال بارگذاری...' : 'حساب را انتخاب کنید'}
            </option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>

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
              disabled={isLoading || !selectedAccountId}
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
