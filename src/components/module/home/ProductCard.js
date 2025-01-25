"use client";

import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import { useEffect, useRef, useState } from "react";
import { evaluate } from 'mathjs';
function ProductCard({ product ,userRoles}) {
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const [error, setError] = useState('');


  //////////////////////// محاسبه قیمت //////////////////////////////

  useEffect(() => {
    if (!product || !userRoles) {
      return;
    }

    try {
      // محاسبه میانگین قیمت (a)
      const a =
        Number(product.accountId.balance) /
        (Number(product.stock) > 0 ? Number(product.stock) : 1);

      // آخرین قیمت خرید (b)
      const b = Number(product.lastPurchasePrice);

      // قیمت فروش فعلی (c)
      const c = Number(product.price);

      // تابع کمکی برای ارزیابی فرمول با استفاده از mathjs
      const evaluateFormula = (formula) => {
        // ایمن‌سازی ورودی‌ها با محدود کردن به کاراکترهای مجاز
        const allowedCharacters = /^[a-zA-Z0-9+\-*/().\s]+$/;
        if (!allowedCharacters.test(formula)) {
          throw new Error("حروف غیرمجاز در فرمول موجود است");
        }

        // تعریف متغیرها برای محاسبه
        const scope = { a, b, c };

        // ارزیابی فرمول با mathjs
        return evaluate(formula, scope);
      };

      // محاسبه قیمت‌های بر اساس نقش‌ها
      let rolePrices = [];

      product.pricingTemplate.pricingFormulas.forEach((pricingFormula) => {
        const formulaRoles = pricingFormula.roles.map((role) => role.id);

        // بررسی اگر کاربر دارای نقش‌های این فرمول باشد
        const userHasRole = userRoles.roles.some((userRole) =>
          formulaRoles.includes(userRole.id)
        );

        if (userHasRole) {
          // ارزیابی فرمول
          const calculatedPrice = evaluateFormula(pricingFormula.formula);

          // اضافه کردن قیمت محاسبه شده به لیست
          rolePrices.push(calculatedPrice);
        }
      });

      // انتخاب ارزان‌ترین قیمت از قیمت‌های نقش‌ها
      const minRolePrice = rolePrices.length > 0 ? Math.min(...rolePrices) : null;

      // محاسبه قیمت فروش عمومی با استفاده از defaultFormula
      let defaultSalePrice = null;
      if (product.pricingTemplate.defaultFormula) {
        defaultSalePrice = evaluateFormula(product.pricingTemplate.defaultFormula);
      }

      // به‌روزرسانی حالت
      setDefaultPrice(defaultSalePrice !== null ? defaultSalePrice : c);
      setUserPrice(minRolePrice !== null ? minRolePrice : c);
      setError("");
    } catch (err) {
      console.error("خطا در محاسبه قیمت‌ها:", err);
      setError("خطا در محاسبه قیمت‌ها");
    }
  }, [product, userRoles]);

  //////////////////////// پایان محاسبه قیمت ////////////////////////  
  // دریافت prop product
  if (!product || !product.title) { // بررسی وجود پراپ و حداقل یک فیلد ضروری
    return <div>محصول نامعتبر</div>;
  }


  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // مرجع برای منو
  const position = { top: 0, left: 0 };
  const [quantity, setQuantity] = useState(1);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product?.id, quantity);
  };

  //////////////////////// actions //////////////////////////////
    // محدود کردن تعداد تگ‌ها
    const maxTagsToShow = 5;
    const displayedTags = product?.tags?.slice(0, maxTagsToShow);
    const extraTags = product?.tags?.length - maxTagsToShow;
    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };
  return (
    <div 
      ref={containerRef}
      className="relative bg-white p-2 md:p-5 mt-10 md:mt-12 dark:bg-zinc-700 shadow-normal rounded-2xl"
    >
      <div className="hidden">
        <Basketsvg />
        <Chatsvg />
        <Star />
      </div>
      <div className="relative z-0 mb-2 md:mb-5">
        <Image
          className=" w-36 h-32 mx-auto md:w-48 md:h-48 rounded-md"
          src={product?.images[0]}
          alt="signalmobile procuct"
          width={100}
          height={100}
          quality={50}
          // priority={true}
        />
      </div>
      <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        {product?.title}{" "}
      </h4>

      {/* <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        {product?.description}{" "}
      </h4> */}

      <div className="flex flex-col mt-2 md:mt-3 gap-3 font-Dana text-xs">
        <div >
          <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice ">
            {defaultPrice}{" "}
          </span>
          <span className=" text-xs md:text-sm text-gray-400">تومان</span>
        </div>
        <div className="text-teal-600 dark:text-emerald-500 ">
          <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl ">
            {userPrice}{" "}
          </span>
          <span className="text-xs md:text-sm tracking-tighter">تومان</span>
        </div>
      </div>
           {/* بخش انتخاب تعداد و افزودن به سبد خرید */}
           <div className="flex flex-col gap-2 p-2 md:p-6">
        {/* انتخاب تعداد */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleDecrease}
            className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
          >
            -
          </button>
          <span className="text-gray-700 dark:text-white">{quantity}{" "}{product?.unit}</span>
          <button
            onClick={handleIncrease}
            className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
          >
            +
          </button>
        </div>


      </div>
        {/* دکمه افزودن به سبد خرید */}
        <button
          onClick={handleAddToCart}
          className="flexCenter w-full bg-blue-500 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          افزودن به سبد خرید
          <svg className="h-4 w-4 md:h-[22px] md:w-[22px] m-2">
            <use href="#Basketsvg"></use>
          </svg>
        </button>
        <h4 className="text-right text-zinc-700 dark:text-white font-DanaMedium text-xs md:text-sm lg:text-base mt-2">
       موجودی:  {product?.stock}{" "}{product?.unit}
      </h4> 
                         {/* تگ‌ها */}
                         <div className="mt-2 flex flex-wrap  content-center line-clamp-2 text-wrap max-h-18">
          {displayedTags?.map((tag, index) => (
          <span
          key={index}
          className="text-center inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2"
        >
          {truncateText(tag.name, 10)}
        </span>          ))}
          {extraTags > 0 && (
            <span className="text-center bg-gray-200 text-gray-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded">
              +{extraTags} بیشتر
            </span>
          )}
        </div>

    </div>
  );
}

export default ProductCard;
