// app/GlobalVariableCard.jsx
"use client";
import React from 'react';
import { BsTrash, BsPencil } from 'react-icons/bs';

function GlobalVariableCard({ 
  globalVariable, 
  hasViewPermission, 
  hasEditPermission, 
  hasDeletePermission,
  onEdit,
  onDelete
}) {
  // برای نمایش تاریخ آخرین بروزرسانی
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-4 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-MorabbaBold">{globalVariable.name}</h3>
        <div className="flex space-x-2 space-x-reverse">
          {hasEditPermission && (
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="ویرایش متغیر"
            >
              <BsPencil size={18} />
            </button>
          )}
          {hasDeletePermission && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              aria-label="حذف متغیر"
            >
              <BsTrash size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="text-gray-700 dark:text-gray-300 font-medium">نماد اختصاری:</div>
        <div className="text-gray-900 dark:text-gray-100 font-bold font-mono">{globalVariable.alias}</div>
        
        <div className="text-gray-700 dark:text-gray-300 font-medium">مقدار:</div>
        <div className="text-gray-900 dark:text-gray-100">{globalVariable.value.toLocaleString('fa-IR')}</div>
        
        {globalVariable.description && (
          <>
            <div className="text-gray-700 dark:text-gray-300 font-medium">توضیحات:</div>
            <div className="text-gray-900 dark:text-gray-100 col-span-1">{globalVariable.description}</div>
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        آخرین بروزرسانی: {formatDate(globalVariable.updatedAt)}
      </div>
    </div>
  );
}

export default GlobalVariableCard;
