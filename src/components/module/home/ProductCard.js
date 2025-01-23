"use client";

import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import { useEffect, useRef, useState } from "react";
function ProductCard({ product }) {
  console.log("product",product);
  
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
          className=" w-32 h-32 mx-auto md:w-44 md:h-44 rounded-md"
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
       <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        {product?.stock}{" "}{product?.unit}
      </h4> 
             {/* نمایش تگ‌ها */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {product.tags.map((tag) => (
            <span
              key={tag._id}
              className="bg-teal-100 dark:bg-teal-700 text-teal-800 dark:text-teal-200 text-xs md:text-sm px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        {product?.description}{" "}
      </h4> */}

      <div className="flex flex-col mt-1.5 md:mt-2.5 gap-2.5 font-Dana text-xs">
        <div className="">
          <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice ">
            175000000000000
          </span>
          <span className=" text-xs md:text-sm text-gray-400">تومان</span>
        </div>
        <div className="text-teal-600 dark:text-emerald-500 ">
          <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl">
            14500000000000
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
      </div>
    </div>
  );
}

export default ProductCard;
