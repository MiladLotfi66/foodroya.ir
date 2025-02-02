"use client";

import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import { useEffect, useRef, useState } from "react";
import { evaluate } from 'mathjs';
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import AddToCartButton from "@/templates/shoppingCart/addtoCardButton";

function ProductCard({ product, userRoles }) {
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [userPrice, setUserPrice] = useState(0);
  const [error, setError] = useState('');
  const { baseCurrency,currentShopId,shopName,shopLogo,shopUniqName} = useShopInfoFromRedux();
  const decimalPlaces = baseCurrency.decimalPlaces;

  // محاسبه قیمت‌ها
  useEffect(() => {
    if (!product || !userRoles) {
      return;
    }

    try {
      const a = Number(product.accountId.balance) / (Number(product.stock) > 0 ? Number(product.stock) : 1);
      const b = Number(product.lastPurchasePrice);
      const c = Number(product.price);

      const evaluateFormula = (formula) => {
        const allowedCharacters = /^[a-zA-Z0-9+\-*/().\s]+$/;
        if (!allowedCharacters.test(formula)) {
          throw new Error("حروف غیرمجاز در فرمول موجود است");
        }
        const scope = { a, b, c };
        return evaluate(formula, scope);
      };

      let rolePrices = [];
      product.pricingTemplate.pricingFormulas.forEach((pricingFormula) => {
        const formulaRoles = pricingFormula.roles;
        const userHasRole = userRoles.roles.some((userRole) =>
          formulaRoles.includes(userRole.id)
        );

        if (userHasRole) {
          const calculatedPrice = evaluateFormula(pricingFormula.formula);
          rolePrices.push(calculatedPrice);
        }
      });

      const minRolePrice = rolePrices.length > 0 ? Math.min(...rolePrices) : null;
      let defaultSalePrice = null;
      if (product.pricingTemplate.defaultFormula) {
        defaultSalePrice = evaluateFormula(product.pricingTemplate.defaultFormula);
      }

      const formatPrice = (price) => {
        return Number(price.toFixed(decimalPlaces));
      };

      setDefaultPrice(defaultSalePrice !== null ? formatPrice(defaultSalePrice) : formatPrice(c));
      setUserPrice(minRolePrice !== null ? formatPrice(minRolePrice) : formatPrice(defaultSalePrice));
      setError("");
    } catch (err) {
      console.error("خطا در محاسبه قیمت‌ها:", err);
      setError("خطا در محاسبه قیمت‌ها");
    }
  }, [product, userRoles, decimalPlaces]);

  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
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

  if (!product || !product.title) {
    return <div>محصول نامعتبر</div>;
  }

  const maxTagsToShow = 5;
  const displayedTags = product?.tags?.slice(0, maxTagsToShow);
  const extraTags = product?.tags?.length - maxTagsToShow;
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatter = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

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
          className="w-36 h-32 mx-auto md:w-48 md:h-48 rounded-md"
          src={product?.images[0]}
          alt="signalmobile procuct"
          width={100}
          height={100}
          quality={50}
        />
      </div>
      <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        {product?.title}{" "}
      </h4>

      <div className="flex flex-col mt-2 md:mt-3 gap-3 font-Dana text-xs">
        {defaultPrice !== userPrice && (
          <div>
            <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice ">
              {formatter.format(defaultPrice)}{" "}
            </span>
            <span className="text-xs md:text-sm text-gray-400">{baseCurrency.title}</span>
          </div>
        )}
        <div className="text-teal-600 dark:text-emerald-500 ">
          <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl ">
            {formatter.format(userPrice)}{" "}
          </span>
          <span className="text-xs md:text-sm tracking-tighter">{baseCurrency.title}</span>
        </div>
      </div>

      {/* بخش انتخاب تعداد و افزودن به سبد خرید */}
      <div className="flex flex-col gap-2 p-2 md:p-6">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleDecrease}
            className="text-xs md:text-sm lg:text-base px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
          >
            -
          </button>
          <span className="text-xs md:text-sm lg:text-base text-gray-700 dark:text-white">{quantity}{" "}{product?.unit}</span>
          <button
            onClick={handleIncrease}
            className="text-xs md:text-sm lg:text-base px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* استفاده از کامپوننت AddToCartButton */}
      <AddToCartButton
        product={product}
        price={userPrice}
        shop={currentShopId} // اگر فروشگاه هم نیاز است
        quantity={quantity}
      />

      <h4 className="text-right text-zinc-700 dark:text-white font-DanaMedium text-xs md:text-sm lg:text-base mt-2">
        موجودی: {product?.stock}{" "}{product?.unit}
      </h4>

      {/* تگ‌ها */}
      <div className="mt-2 flex flex-wrap content-center line-clamp-2 text-wrap max-h-18">
        {displayedTags?.map((tag, index) => (
          <span
            key={index}
            className="text-center inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2"
          >
            {truncateText(tag.name, 10)}
          </span>
        ))}
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