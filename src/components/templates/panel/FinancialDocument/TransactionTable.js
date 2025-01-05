import React, { useMemo } from 'react';
import moment from "moment-jalaali";

const TransactionTable = ({ transactions }) => {
  // محاسبه مانده حساب
  const displayTransactions = useMemo(() => {
    // ترتیب‌بندی تراکنش‌ها از قدیمی به جدید
    const ordered = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
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
          بستانکار {balance.toLocaleString()} تومان
        </span>
      );
    } else {
      return (
        <span className="text-red-600">
          بدهکار {Math.abs(balance).toLocaleString()} تومان
        </span>
      );
    }
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">تاریخ</th>
            <th className="px-4 py-2 border-b">توضیحات</th>
            <th className="px-4 py-2 border-b">مبلغ بدهکار</th>
            <th className="px-4 py-2 border-b">مبلغ بستانکار</th>
            <th className="px-4 py-2 border-b">مانده حساب</th>
          </tr>
        </thead>
        <tbody>
          {displayTransactions.map((txn) => (
            <tr key={txn._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-center">
                {moment(txn.date).format("jYYYY/jMM/jDD HH:mm")}
              </td>
              <td className="px-4 py-2 border-b">{txn.description}</td>
              <td className="px-4 py-2 border-b text-right">
                {txn.debit.toLocaleString()} تومان
              </td>
              <td className="px-4 py-2 border-b text-right">
                {txn.credit.toLocaleString()} تومان
              </td>
              <td className="px-4 py-2 border-b text-right">
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
