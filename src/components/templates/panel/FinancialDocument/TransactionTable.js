import React from 'react';
import moment from "moment-jalaali";

const TransactionTable = ({ transactions }) => {
      
    
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">تاریخ</th>
            <th className="px-4 py-2 border-b">توضیحات</th>
            <th className="px-4 py-2 border-b">مبلغ بدهکار</th>
            <th className="px-4 py-2 border-b">مبلغ بستانکار</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-b text-center"> {moment(txn.date).format("jYYYY/jMM/jDD HH:mm") }  </td>
              <td className="px-4 py-2 border-b">{txn.description}</td>
              <td className="px-4 py-2 border-b text-right">{txn.debit.toLocaleString()} تومان</td>
              <td className="px-4 py-2 border-b text-right">{txn.credit.toLocaleString()} تومان</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
