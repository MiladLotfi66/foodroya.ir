// src/components/FeatureSelect.js
"use client"; // ذخیره این فایل به عنوان یک کامپوننت کلاینت

import React, { useState, useEffect, useCallback } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import debounce from "lodash.debounce";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { GetAllFeatureKeys, AddFeatureKeyAction } from "./FeatureActions"; // اطمینان حاصل کنید که این توابع درست کار می‌کنند
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { customSelectStyles } from "./selectStyles";


const FeatureSelect = () => {
  const { control, register, formState: { errors } } = useFormContext();
  const { theme } = useTheme();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  // افزودن یک ویژگی خالی در بارگذاری اولیه
  useEffect(() => {
    if (fields.length === 0) {
      append({ featureKey: null, value: "" });
    }
  }, [append, fields.length]);

  const handleAddFeature = () => {
    append({ featureKey: null, value: "" });
  };

  const handleRemoveFeature = (index) => {
    remove(index);
  };

  // تابع بارگذاری گزینه‌ها از API با debounce
  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      GetAllFeatureKeys(inputValue)
        .then((data) => {
          if (data.status === 200) {
            const options = data.featureKeys.map((feature) => ({
              label: feature.name,
              value: feature._id,
            }));
            callback(options);
          } else {
            toast.error(data.message || "خطا در دریافت کلیدهای ویژگی");
            callback([]);
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error("خطا در ارتباط با سرور");
          callback([]);
        });
    }, 300),
    []
  );

  // تابع افزودن ویژگی جدید از طریق API
  const handleCreate = async (inputValue, onChange) => {
    try {
      const response = await AddFeatureKeyAction(inputValue);
      if (response.status === 201) {
        const newOption = { label: response.featureKey.name, value: response.featureKey._id };
        onChange(newOption);
        toast.success("کلید ویژگی جدید اضافه شد");
      } else {
        toast.error(response.message || "خطا در ایجاد کلید ویژگی جدید");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="w-full ">
      <label className="block text-sm font-medium  mb-2 ">ویژگی‌ها</label>
      {fields.map((field, index) => (
        <div 
          key={field.id} 
          className="flex gap-2 flex-col xl:flex-row items-start xl:items-center space-y-2 xl:space-y-0 xl:space-x-4 mb-4 border border-gray-300 p-2"
        >
          <div className="flex-1 w-full">
            <Controller
              control={control}
              name={`features[${index}].featureKey`}
              render={({ field: { onChange, value, ref } }) => (
                <AsyncCreatableSelect
                  inputRef={ref}
              
                  styles={
                    theme === "dark"
                      ? customSelectStyles
                      : ""
                  }
                //   classNamePrefix="select"
                  isClearable
                  loadOptions={loadOptions}
                  onCreateOption={(inputValue) => handleCreate(inputValue, onChange)}
                  onChange={(selectedOption) => onChange(selectedOption)}
                  value={value}
                  isLoading={false}
                  placeholder="انتخاب یا ایجاد کلید ویژگی..."
                />
              )}
            />
            {errors.features && errors.features[index]?.featureKey && (
              <p className="text-red-500 text-sm mt-1">
                {errors.features[index].featureKey.message}
              </p>
            )}
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="مقدار ویژگی"
              {...register(`features[${index}].value`, { required: "مقدار ویژگی الزامی است" })}
              className={`mt-1 p-2 block w-full h-full rounded-md bg-white dark:bg-zinc-600 dark:text-gray-300  border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                errors.features && errors.features[index]?.value ? "border-red-500" : ""
              }`}
            />
            {errors.features && errors.features[index]?.value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.features[index].value.message}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => handleRemoveFeature(index)}
              className="mt-1 md:mt-0 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      {errors.features && typeof errors.features.message === "string" && (
        <p className="text-red-500 text-sm mb-2">{errors.features.message}</p>
      )}
      <button
        type="button"
        onClick={handleAddFeature}
        className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        افزودن ویژگی جدید
      </button>
    </div>
  );
};

export default FeatureSelect;
