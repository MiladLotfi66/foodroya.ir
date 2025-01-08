import React, { useMemo } from 'react';
import moment from "moment-jalaali";

const TransactionTable = ({ transactions }) => {
  
  // محاسبه مانده حساب
  const displayTransactions = useMemo(() => {
    // ترتیب‌بندی تراکنش‌ها از قدیمی به جدید
    const ordered = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // محاسبه مانده حساب
    let balance = 0;
    const withBalance = ordered.map(txn => {
      balance += txn.credit - txn.debit;
      return { ...txn, balance };
    });
    
    // معکوس کردن برای نمایش از جدید به قدیم
    return withBalance.slice().reverse();
  }, [transactions]);

  // تابع کمکی برای فرمت کردن مانده حساب
  const formatBalance = (balance) => {
    if (balance >= 0) {
      return (
        <span className="text-green-600">
          بس {balance.toLocaleString()}
        </span>
      );
    } else {
      return (
        <span className="text-red-600 dark:text-red-400">
          بد {Math.abs(balance).toLocaleString()}
        </span>
      );
    }
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full  border bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl">
        <thead>
          <tr>
            <th className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-1/5">تاریخ</th>
            <th className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-2/5">توضیحات</th>
            <th className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">بد</th>
            <th className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">بس</th>
            <th className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">مانده حساب</th>
          </tr>
        </thead>
        <tbody>
          {displayTransactions.map((txn) => (
            <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-gray-500">
              <td className="px-1 md:px-2 py-1 border-b text-center text-xs md:text-lg sm:px-4 sm:py-2 w-1/5">
                {moment(txn.createdAt).format("jYYYY/jMM/jDD HH:mm")}
              </td>
              <td className="px-1 md:px-2 py-1 border-b text-xs md:text-lg sm:px-4 sm:py-2 w-2/5">{txn.description}</td>
              <td className="px-1 md:px-2 py-1 border-b text-right text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">
                {txn.debit.toLocaleString()}
              </td>
              <td className="px-1 md:px-2 py-1 border-b text-right text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">
                {txn.credit.toLocaleString()}
              </td>
              <td className="px-1 md:px-2 py-1 border-b text-right text-xs md:text-lg sm:px-4 sm:py-2 w-1/10">
                {formatBalance(txn.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
