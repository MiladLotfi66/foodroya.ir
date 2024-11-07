"use client";

import React, { useState, useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import CloseSvg from "@/module/svgs/CloseSvg";
import PropTypes from "prop-types";

const ImageUpload = ({ control, name, existingImages = [] }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // رفرنس به ورودی فایل برای تحریک کلیک برنامه‌نویسی
  const fileInputRef = useRef(null);

  // مدیریت انتخاب تصاویر
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages =
      selectedImages.length + files.length + existingImages.length;
    if (totalImages > 10) {
      alert("شما تنها می‌توانید حداکثر ۱۰ تصویر آپلود کنید.");
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...previews]);
  };

  // مدیریت حذف تصویر
  const handleDelete = (index) => {
    if (index < existingImages.length) {
      // منطق حذف برای existingImages باید اضافه شود
      return;
    }
    const selectedIndex = index - existingImages.length;
    setSelectedImages((prev) => prev.filter((_, i) => i !== selectedIndex));
    setPreviewImages((prev) => prev.filter((_, i) => i !== selectedIndex));
  };

  // پاکسازی URLهای شیء برای جلوگیری از نشت حافظه
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={existingImages}
      render={({ field: { onChange, value } }) => {
        return (
          <div className="w-full">
            <label className="block mb-2 font-semibold">تصاویر محصول</label>

            {/* دکمه شخصی‌سازی شده انتخاب فایل */}
            <div className="mb-4">
              <div className="hidden">
                <CloseSvg />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none transition"
              >
                انتخاب تصویر
              </button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {/* نمایش تصاویر */}
            {(existingImages.length > 0 || previewImages.length > 0) && (
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((src, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img
                      src={src}
                      alt={`Existing Preview ${index}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    {/* دکمه حذف برای تصاویر موجود */}
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      aria-label="حذف تصویر"
                    >
                      <svg width="16" height="16">
                        <use href="#CloseSvg"></use>
                      </svg>{" "}
                    </button>
                  </div>
                ))}

                {previewImages.map((src, index) => (
                  <div key={`preview-${index}`} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(existingImages.length + index)
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      aria-label="حذف تصویر"
                    >
                      <svg width="16" height="16">
                        <use href="#CloseSvg"></use>
                      </svg>{" "}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

ImageUpload.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  existingImages: PropTypes.array,
};

export default ImageUpload;
