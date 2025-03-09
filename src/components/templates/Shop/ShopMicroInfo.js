// components/ShopMicroInfo.js یا components/common/ShopMicroInfo.js
"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const ShopMicroInfo = memo(({ shop, size = "small", className = "" }) => {
  if (!shop) return null;
  
  // اندازه‌های مختلف برای استفاده در شرایط مختلف
  const sizes = {
    small: {
      container: "flex items-center gap-2 text-xs",
      logo: "w-6 h-6",
      nameClass: "max-w-[100px]",
      usernameClass: "max-w-full" // برطرف کردن مشکل محدودیت یونیک‌نیم
    },
    medium: {
      container: "flex items-center gap-3 text-sm",
      logo: "w-8 h-8",
      nameClass: "max-w-[150px]",
      usernameClass: "max-w-full"
    },
    large: {
      container: "flex items-center gap-4 text-base",
      logo: "w-10 h-10",
      nameClass: "max-w-[200px]",
      usernameClass: "max-w-full"
    }
  };
  
  const currentSize = sizes[size] || sizes.small;
  const shopPageUrl = `/${shop._id}`;

  return (
    <Link  href={shopPageUrl} 
    className={`${currentSize.container} text-gray-600 dark:text-gray-300 ${className}`}>
      <div className={`relative ${currentSize.logo} rounded-full overflow-hidden flex-shrink-0`}>
      <Image
  src={shop.LogoUrl || "/placeholder.png"}
  alt={shop.ShopName}
  fill
  sizes="(max-width: 768px) 24px, 24px" // برای اندازه کوچک
  className="object-cover"
  quality={70}
/>

      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 overflow-hidden">
        <span 
          className={`font-DanaMedium truncate ${currentSize.nameClass}`} 
          title={shop.ShopName}
        >
          {shop.ShopName}
        </span>
        <span 
          className={`text-gray-500 dark:text-gray-400 truncate ${currentSize.usernameClass}`} 
          title={`@${shop.ShopUniqueName}`}
        >
          @{shop.ShopUniqueName}
        </span>
      </div>
    </Link>
  );
});

// نام‌گذاری برای DevTools
ShopMicroInfo.displayName = 'ShopMicroInfo';

export default ShopMicroInfo;
