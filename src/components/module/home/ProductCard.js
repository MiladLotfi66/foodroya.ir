
"use client";
import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import { useEffect, useRef, useState } from "react";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import AddToCartButton from "@/templates/shoppingCart/addtoCardButton";
import Link from "next/link";
import { usePriceCalculator } from "@/templates/ProductPage/usePriceCalculator";

function ProductCard({ product, userRoles }) {
  const [error, setError] = useState('');
  const { baseCurrency, currentShopId, shopName, shopLogo, shopUniqName } = useShopInfoFromRedux();
  

  const { defaultPrice, userPrice, error: priceError, formatPrice } = usePriceCalculator(
    product,
    userRoles, 
    baseCurrency
  );
  
  // فرمت‌کننده قیمت
 

  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const [quantity, setQuantity] = useState(1);




  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  if (!product || !product.title) {
    return <div>محصول نامعتبر</div>;
  }



  // محاسبه قیمت پیش‌فرض (برای نمایش قیمت خط خورده)

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
      <Link href={`/product/${product._id}`}>
        <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
          {product?.title}{" "}
        </h4>
      </Link>

      <div className="flex flex-col mt-2 md:mt-3 gap-3 font-Dana text-xs">
       
        { priceError ? (
          <div className="text-red-600 font-DanaDemiBold text-sm">
            {priceError}
          </div>
        ) : Number(product.stock) > 0 ? (
          <>
            {defaultPrice !== userPrice && defaultPrice > 0 && (
              <div>
                <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice ">
                  {formatPrice(defaultPrice)}{" "}
                </span>
                <span className="text-xs md:text-sm text-gray-400">{baseCurrency?.title}</span>
              </div>
            )}
            <div className="text-teal-600 dark:text-emerald-500 ">
              <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl ">
                {formatPrice(userPrice)}{" "}
              </span>
              <span className="text-xs md:text-sm tracking-tighter">{baseCurrency?.title}</span>
            </div>
          </>
        ) : (
          <div className="text-red-600 font-DanaDemiBold text-sm md:text-base lg:text-xl">
            ناموجود
          </div>
        )}
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
        shop={currentShopId}
        quantity={quantity}
        disabled={Number(product.stock) === 0 || !!priceError}
      />
    </div>
  );
}

export default ProductCard;
