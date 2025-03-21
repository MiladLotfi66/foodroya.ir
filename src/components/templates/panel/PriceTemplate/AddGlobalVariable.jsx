// app/AddGlobalVariable.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { BsX } from 'react-icons/bs';
import { Toaster, toast } from 'react-hot-toast';
import { AddGlobalVariableAction, EditGlobalVariableAction } from './GlobalVariableServerAction';

function AddGlobalVariable({ globalVariable, onClose, refreshGlobalVariables, ShopId }) {
  const isEditing = !!globalVariable;
  
  // تنظیم مقادیر اولیه فرم
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    value: '',
    description: '',
    shopId: ShopId
  });

  // بروزرسانی فرم در حالت ویرایش
  useEffect(() => {
    if (isEditing && globalVariable) {
      setFormData({
        name: globalVariable.name || '',
        alias: globalVariable.alias || '',
        value: globalVariable.value || 0,
        description: globalVariable.description || '',
        shopId: ShopId
      });
    }
  }, [globalVariable, isEditing, ShopId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // اعتبارسنجی فرم
      if (!formData.name.trim()) {
        toast.error('نام متغیر نمی‌تواند خالی باشد.');
        return;
      }
      
      if (!formData.alias.trim()) {
        toast.error('نماد اختصاری نمی‌تواند خالی باشد.');
        return;
      }
      
      // بررسی معتبر بودن نماد اختصاری
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.alias)) {
        toast.error('نماد اختصاری باید با حرف انگلیسی شروع شود و فقط شامل حروف انگلیسی، اعداد و _ باشد.');
        return;
      }
      
      if (formData.value === '' || isNaN(parseFloat(formData.value))) {
        toast.error('مقدار باید یک عدد معتبر باشد.');
        return;
      }

      let response;
      if (isEditing) {
        response = await EditGlobalVariableAction(formData, globalVariable._id);
      } else {
        response = await AddGlobalVariableAction(formData);
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(response.message || (isEditing ? 'متغیر عمومی با موفقیت ویرایش شد.' : 'متغیر عمومی با موفقیت ایجاد شد.'));
        refreshGlobalVariables();
        onClose();
      } else {
        toast.error(response.message || 'خطایی رخ داد.');
      }
    } catch (error) {
      console.error("Error submitting global variable:", error);
      toast.error('خطایی در پردازش درخواست رخ داد.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-0 left-0 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        aria-label="بستن"
      >
        <BsX size={24} />
      </button>
      
      <h2 className="text-2xl font-MorabbaBold text-center mb-6">
        {isEditing ? 'ویرایش متغیر عمومی' : 'افزودن متغیر عمومی جدید'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 dark:text-gray-300">نام متغیر:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-zinc-800 dark:text-white"
            placeholder="نام متغیر را وارد کنید"
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 dark:text-gray-300">نماد اختصاری (Alias):</label>
          <input
            type="text"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-zinc-800 dark:text-white font-mono"
            placeholder="مثال: dollar_rate"
            disabled={isEditing} // در حالت ویرایش، نماد اختصاری قابل تغییر نباشد
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            نماد اختصاری باید با حرف انگلیسی شروع شود و فقط شامل حروف انگلیسی، اعداد و _ باشد.
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 dark:text-gray-300">مقدار:</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-zinc-800 dark:text-white"
            placeholder="مقدار عددی متغیر"
            step="any"
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 dark:text-gray-300">توضیحات (اختیاری):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-zinc-800 dark:text-white h-24"
            placeholder="توضیحات مربوط به این متغیر را وارد کنید"
          />
        </div>
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            {isEditing ? 'بروزرسانی' : 'افزودن'}
          </button>
        </div>
      </form>
      <Toaster />
    </div>
  );
}

export default AddGlobalVariable;
