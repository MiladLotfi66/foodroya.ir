// components/AccessControl/NotAuthenticated.jsx
import React from 'react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import { FiLogIn } from 'react-icons/fi';

const NotAuthenticated = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  p-4">
      <Toaster />
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
        <FiLogIn className="text-blue-500 w-16 h-16 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">وارد حساب کاربری شوید</h2>
        <p className="text-gray-600 mb-6">برای دسترسی به این بخش، باید ابتدا وارد سیستم شوید.</p>
          <Link href="/signin" className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
            
            <FiLogIn className="mr-2" />
            ورود به سیستم
          </Link>
      </div>
    </div>
  );
};

export default NotAuthenticated;
