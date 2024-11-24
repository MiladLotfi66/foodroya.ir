import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// تابع کمکی برای تعیین کلاس‌های دکمه‌ها بر اساس وضعیت
const getButtonClasses = (isActive, activeColor, inactiveColor) => {
  return classNames(
    'flex-1 px-4 py-2 rounded-md text-white transition-colors focus:outline-none',
    {
      [`${activeColor}`]: isActive,
      [`${inactiveColor}`]: !isActive,
    }
  );
};

function ProductCard({ product }) {
  console.log(product);
  
  // وضعیت‌های دکمه‌ها
  const [status, setStatus] = useState(product.status || false);
  const [isForSale, setIsForSale] = useState(product.isForSale || false);
  const [isMergeable, setIsMergeable] = useState(product.isMergeable || false);

  // هندلرهای دکمه‌ها
  const handleStatusToggle = () => setStatus((prevStatus) => !prevStatus);
  const handleSaleToggle = () => setIsForSale((prevStatus) => !prevStatus);
  const handleMergeToggle = () => setIsMergeable((prevStatus) => !prevStatus);

  // محدود کردن نمایش تصاویر به یک تصویر اصلی
  const mainImage = product?.images?.[0] || 'https://via.placeholder.com/150';

  // تعریف کلاس‌های مشترک برای بخش‌های مختلف
  const containerClasses = "flex flex-row border border-gray-300 rounded-lg shadow-md p-4 max-w-4xl mx-auto my-5 bg-white";
  const imageContainerClasses = "relative w-48 h-48 flex-shrink-0";
  const imageClasses = "w-full h-full object-cover rounded-md";
  const overlayClasses = "absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded";
  const infoContainerClasses = "flex flex-col flex-1 ml-6";
  const titleClasses = "text-2xl font-semibold text-gray-800";
  const descriptionClasses = "text-gray-600 mt-2 flex-1";
  const locationClasses = "text-gray-500 mt-2";
  const locationLabelClasses = "font-medium";
  const priceOriginalClasses = "text-lg text-gray-500 line-through mr-2";
  const priceDiscountClasses = "text-xl text-red-600 font-bold";
  const tagsContainerClasses = "mt-3 flex flex-wrap";
  const tagClasses = "bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded mr-2 mb-2";
  const buttonsContainerClasses = "mt-4 flex space-x-3";

  return (
    <div className={containerClasses}>
      
      {/* بخش تصاویر */}
      <div className={imageContainerClasses}>
        <img
          src={mainImage}
          alt={product.title}
          className={imageClasses}
          loading="lazy"
        />
        {product?.images?.length > 1 && (
          <div className={overlayClasses}>
            +{product.images.length - 1}
          </div>
        )}
      </div>

      {/* بخش اطلاعات محصول */}
      <div className={infoContainerClasses}>
        {/* عنوان محصول */}
        <h2 className={titleClasses}>{product.title}</h2>

        {/* توضیحات */}
        <p className={descriptionClasses}>{product.description}</p>

        {/* محل قرارگیری */}
        <p className={locationClasses}>
          <span className={locationLabelClasses}>محل قرارگیری:</span> {product.storageLocation}
        </p>

        {/* قالب قیمتی */}
        {/* <div className="mt-3">
          <span className={priceOriginalClasses}>{product.priceOriginal}</span>
          {product.priceDiscount && (
            <span className={priceDiscountClasses}>{product.priceDiscount}</span>
          )}
        </div> */}

        {/* تگ‌ها */}
        <div className={tagsContainerClasses}>
          {product?.tags?.map((tag, index) => (
            <span key={index} className={tagClasses}>
              {tag.name}
            </span>
          ))}
        </div>

        {/* دکمه‌ها */}
        <div className={buttonsContainerClasses}>
          <button
            onClick={handleStatusToggle}
            className={getButtonClasses(
              status,
              'bg-green-500 hover:bg-green-600',
              'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {status ? 'فعال' : 'غیرفعال'}
          </button>
          <button
            onClick={handleSaleToggle}
            className={getButtonClasses(
              isForSale,
              'bg-blue-500 hover:bg-blue-600',
              'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {isForSale ? 'قابل فروش' : 'غیر قابل فروش'}
          </button>
          <button
            onClick={handleMergeToggle}
            className={getButtonClasses(
              isMergeable,
              'bg-purple-500 hover:bg-purple-600',
              'bg-gray-500 hover:bg-gray-600'
            )}
          >
            {isMergeable ? 'قابل ادغام' : 'غیر قابل ادغام'}
          </button>
        </div>
      </div>
    </div>
  );
}

// تعریف PropTypes برای اعتبارسنجی پروپ‌ها
ProductCard.propTypes = {
  product: PropTypes.shape({
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    storageLocation: PropTypes.string.isRequired,
    priceOriginal: PropTypes.string.isRequired,
    priceDiscount: PropTypes.string, // اختیاری
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.bool,
    isForSale: PropTypes.bool,
    isMergeable: PropTypes.bool,
  }).isRequired,
};

export default ProductCard;
