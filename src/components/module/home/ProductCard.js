"use client";

import Image from "next/image";
import Basketsvg from "@/module/svgs/Basketsvg";
import calbas from "@/public/Images/jpg/Sausage.webp";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";
import { useEffect, useRef, useState } from "react";
import ShareSvg from "../svgs/ShareSvg";
import EditSvg from "../svgs/EditSvg";
import DeleteSvg from "../svgs/DeleteSvg";
import Threedot from "../svgs/threedot";

function ProductCard() {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // مرجع برای منو
  const position = { top: 0, left: 0 };

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

//////////////////////// actions //////////////////////////////





  return (
    <div ref={containerRef} className="relative bg-white p-2 md:p-5 mt-10 md:mt-12 dark:bg-zinc-700 shadow-normal rounded-2xl">
              <div className="absolute w-4 h-4 md:w-8 md:h-8 z-[46] p-2">
              <button  
              aria-label="product card Menu Button"
              onClick={handleMenuToggle}>
              <Threedot/>

        </button>
        {isOpen && (
          <div
            className="absolute w-[20%] h-[10%] z-[46]"
            style={{ top: position.top +30, left: position.left +20}}
            ref={menuRef} // اضافه کردن مرجع به منو
          >
            <div className="relative group flex items-center">
            <ul className="relative top-full w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 space-y-4 text-zinc-700 bg-white text-sm md:text-base border-t-[3px] border-t-orange-300 rounded-xl tracking-normal shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 p-6 pt-[21px] child:transition-colors child-hover:text-orange-300">
            <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("ویرایش")}
              >
                <EditSvg />
                <p>ویرایش</p>
              </div>
              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("حذف")}
              >
                <DeleteSvg />
                <p>حذف</p>
              </div>

              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("ارسال")}
              >
                <ShareSvg />
                <p>ارسال</p>
              </div>
            </ul>
            </div>
          </div>
        )}
      </div>
      <div className="hidden">
        <Basketsvg />
        <Chatsvg />
        <Star />
      </div>
      <div className="relative z-0 mb-2 md:mb-5">
        <Image
          className=" w-32 mx-auto md:w-auto h-auto rounded-md"
          src={calbas}
          alt="signalmobile procuct"
          width={100}
          height={100}
          quality={50}
          // priority={true}
        />
        <span className="absolute shadow-normal top-1.5 left-1.5 block h-[30px] bg-orange-400 text-white dark:text-zinc-700 px-2.5 md:px-3.5 py-[2px] rounded-full text-xs[24px] md:text-base/[32px] font-DanaDemiBold ">
          12 %
        </span>
      </div>
      <h4 className="text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base lg:text-xl line-clamp-2 text-wrap h-10 md:h-[51px]">
        کالباس فیله ی بوقلمون 500 گرمی با بهترین مواد و بهترین کیفیت
      </h4>
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
      <div className="flex justify-between items-center gap-1.5">
        <div className="flexCenter">
          <div className="flexCenter">
            <span className="flexCenter block h-[26px] w-[26px] md:h-9 md:w-9 text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-full hover:text-white dark:hover:bg-emerald-600 hover:bg-teal-600 cursor-pointer transition-all">
              <svg className="h-4 w-4 md:h-[22px] md:w-[22px]">
                <use href="#Basketsvg"></use>
              </svg>
            </span>
          </div>
          <div className="flexCenter">
            <span className="flexCenter block h-[26px] w-[26px] md:h-9 md:w-9 text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-full hover:text-white dark:hover:bg-emerald-600 hover:bg-teal-600 cursor-pointer transition-all">
              <svg className="h-4 w-4 md:h-[22px] md:w-[22px]">
                <use href="#Chatsvg"></use>
              </svg>
            </span>
          </div>
        </div>
        <div className="text-orange-300 md:text-[22px] leading-[0px]">
          <svg className="h-8 md:h-10 md:w-10 w-8 ">
            <use href="#Star"></use>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
