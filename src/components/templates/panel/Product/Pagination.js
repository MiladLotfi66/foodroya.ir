// src/components/Pagination.js

import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) return null;

  const pages = [];

  // تعیین صفحات قابل نمایش (می‌توانید منطق نمایش صفحات را پیچیده‌تر کنید)
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center my-4">
      <nav className="inline-flex -space-x-px">

      <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          قبلی
        </button>



     
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 leading-tight border border-gray-300 ${
              page === currentPage
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
   <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          بعدی
        </button>
    
    
      </nav>
    </div>
  );
};

export default Pagination;
