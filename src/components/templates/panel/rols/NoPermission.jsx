// components/AccessControl/NoPermission.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const NoPermission = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
        <FaExclamationTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">دسترسی غیرمجاز</h2>
        <p className="text-gray-600 mb-6">شما اجازه مشاهده این بخش را ندارید. در صورت نیاز به دسترسی، با مدیر سیستم تماس بگیرید.</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
        >
          بازگشت
        </button>
      </div>
    </div>
  );
};

export default NoPermission;
