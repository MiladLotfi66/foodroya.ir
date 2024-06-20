"use client";

import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import calbas from "@/public/Images/jpg/Sausage.jpg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import ThreeDotsMenu from "../minicomponents/ThreeDotsMenu";
import { useEffect, useState, useRef } from "react";

function ProductCard() {

  const [openMenuId, setOpenMenuId] = useState(null);
  const containerRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const EditHandler = (productId) => {
    console.log(`Editing productId with id: ${productId}`);
  };

  const DeleteHandler = (productId) => {
    console.log(`Deleting productId with id: ${productId}`);
  };

  const SendHandler = (productId) => {
    console.log(`Sending productId with id: ${productId}`);
  };

  const menuItems = [
    { label: 'ویرایش', action: 'edit' },
    { label: 'حذف', action: 'delete' },
    { label: 'ارسال', action: 'send' }
  ];

  const menuActions = {
    edit: (id) => EditHandler(id),
    delete: (id) => DeleteHandler(id),
    send: (id) => SendHandler(id),
  };

  const handleMenuToggle = (productId) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

//////////////////////////////////////

  return (

    <div className="relative bg-white p-2 md:p-5 mt-10 md:mt-12 dark:bg-zinc-700 shadow-normal  rounded-2xl ">
              <ThreeDotsMenu
                bannerId={1}
                menuItems={menuItems}
                menuActions={menuActions}
                isOpen={openMenuId === 1}
                onClose={handleMenuClose}
                onToggle={handleMenuToggle}
              />
      <div className="hidden">
        <Basketsvg />
        <Chatsvg />
        <Star />
      </div>
      {/* //////////////////تصویر و درصد تخفیف //////////////////// */}

      <div className="relative z-0 mb-2 md:mb-5">
        <Image
          className=" w-32 mx-auto md:w-auto h-auto rounded-md"
          src={calbas}
          alt="signalmobile procuct"
          width={260}
          height={260}
          quality={50}
          priority={true}
        />
        <span className="absolute shadow-normal top-1.5 left-1.5 block h-[30px]  bg-orange-300 text-white dark:text-zinc-700 px-2.5 md:px-3.5  py-[2px] rounded-full text-xs[24px] md:text-base/[32px] font-DanaDemiBold ">
          12 %
        </span>
      </div>

      {/* //////////////////عنوان محصول //////////////////// */}

      <h4 className="text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap  h-10 md:h-[51px]">
        کالباس فیله ی بوقلمون 500 گرمی با بهترین مواد و بهترین کیفیت
      </h4>

      {/* //////////////////قیمت و تخفیف //////////////////// */}
      <div className="flex flex-col mt-1.5 md:mt-2.5 gap-2.5 font-Dana text-xs">
        <div className="">
          <span className="font-DanaDemiBold text-xs md:text-sm lg:text-xl offerPrice ">
            175000000000000
          </span>
          <span className=" text-xs md:text-sm   text-gray-400">تومان</span>
        </div>
        <div className="text-teal-600 dark:text-emerald-500 ">
          <span className="font-DanaDemiBold text-sm md:text-base lg:text-xl">
            14500000000000
          </span>
          <span className="text-xs md:text-sm tracking-tighter">تومان</span>
        </div>
      </div>
      {/* //////////////////footer //////////////////// */}
      <div className="flex justify-between items-center gap-1.5">
        <div className="flexCenter ">
          <div className="flexCenter ">
            <span className=" flexCenter block h-[26px] w-[26px] md:h-9 md:w-9 text-gray-400  bg-gray-100 dark:bg-zinc-800 rounded-full hover:text-white dark:hover:bg-emerald-600 hover:bg-teal-600 cursor-pointer transition-all">
              <svg className="h-4 w-4 md:h-[22px] md:w-[22px]  ">
                <use href="#Basketsvg"></use>
              </svg>
            </span>
          </div>
          <div className="flexCenter ">
            <span className=" flexCenter block h-[26px] w-[26px] md:h-9 md:w-9 text-gray-400  bg-gray-100 dark:bg-zinc-800 rounded-full hover:text-white dark:hover:bg-emerald-600 hover:bg-teal-600 cursor-pointer transition-all">
              <svg className="h-4 w-4 md:h-[22px] md:w-[22px]  ">
                <use href="#chatsvg"></use>
              </svg>
            </span>
          </div>
        </div>
        <div className="flex justify-end items-End ">
          <svg className="h-4 w-4 md:h-6 md:w-6  text-gray-300 dark:text-gray-400">
            <use href="#Star"></use>
          </svg>
          <svg className="h-4 w-4 md:h-6 md:w-6  text-yellow-400">
            <use href="#Star"></use>
          </svg>
          <svg className="h-4 w-4 md:h-6 md:w-6  text-yellow-400">
            <use href="#Star"></use>
          </svg>
          <svg className="h-4 w-4 md:h-6 md:w-6  text-yellow-400">
            <use href="#Star"></use>
          </svg>
          <svg className="h-4 w-4 md:h-6 md:w-6  text-yellow-400">
            <use href="#Star"></use>
          </svg>
        </div>
      </div>
    </div>
    
   
  );
}

export default ProductCard;
