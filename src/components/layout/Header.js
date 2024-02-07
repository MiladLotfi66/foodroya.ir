"use client";
import React, { useState, useEffect } from "react";

import Moonsvg from "@/module/Moonsvg";
import SignallogoSvg from "@/module/SignallogoSvg";
import Basketsvg from "@/module/Basketsvg";
import Leftarrow from "@/module/Leftarrow";
import Loginlogosvg from "@/module/Loginlogosvg";
import Sunsvg from "@/module/Sunsvg";
import BasketShop from "@/layout/BasketShop";

function Header() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    console.log(darkMode);
  };

  return (
    <header
      className={
        darkMode
          ? "dark flex right-0 left-0 top-9 fixed  items-center bg-black/50  w-[98%] lg:w-[90%] h-24 rounded-3xl px-5 lg:px-10 mx-auto backdrop-blur-[6px]"
          : "flex  right-0 left-0 top-9 fixed  items-center bg-black/50 w-[98%] lg:w-[90%] h-24 rounded-3xl px-5 lg:px-10 mx-auto backdrop-blur-[6px]"
      }
    >
      <div className="flex justify-between w-full">
        <div className="hidden">
          {/*  آیکون جهت چپ */}
          <Leftarrow />
          {/* آیکون سیگنال موبایل */}
          <SignallogoSvg />
          {/* آیکون سبد خرید */}
          <Basketsvg />
          {/* آیکون ماه */}
          <Moonsvg />
          {/* آیکون ورود و ثبت نام */}
          <Loginlogosvg />
          {/* آیکون خورشید */}
          <Sunsvg />
        </div>
        {/* logo & menu */}
        <nav className="flex items-center gap-x-4 xl:gap-x-9 h-14">
          <svg className="shrink-0 w-[59px] h-[59px]">
            <use className="flex items-center " href="#signallogo"></use>
          </svg>
          <ul className="flex h-full text-xl text-gray-300 gap-x-4 md:gap-x-7 xl:gap-x-9 tracking-tightest child:text-xs sm:child:text-xl child:leading-[56px] child-hover:text-orange-300 ">
            <li className="flex items-center">
              <a className="font-DanaMedium text-orange-200 my-auto" href="#">
                صفحه اصلی
              </a>
            </li>
            <li className="relative group flex items-center">
              <a href="#">فروشگاه</a>
              {/* sub menu ساب منو فروشگاه */}
              <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full w-52 h-24 space-y-4 text-zinc-700    bg-white  text-base  border-t-[3px] border-t-orange-300 rounded-2xl  tracking-normal  shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 child:inline-block p-6 pt-[21px] child:transition-colors child-hover:text-orange-300 ">
                <a href="#">دسته بندی کالا</a>
                <a href="#">بررسی اصالت کالا</a>
              </div>
            </li>
            <li className="flex items-center">
              <a href="#">بلاگ</a>
            </li>
            <li className="flex items-center">
              <a href="#">درباره ما</a>
            </li>
            <li className="flex items-center">
              <a href="#">ارتباط با ما</a>
            </li>
          </ul>
        </nav>

        {/* shopping basket and lodin moon */}
        <div className="flex gap-x-3 xl:gap-x-10 text-orange-200 items-center ">
          {/* shopping and moon */}
          <div className="flex gap-x-4">
            {/* shopping icone hover */}
            <div className="relative group">
              <div className="py-3  ">
                <svg width="34" height="34" className=" cursor-pointer">
                  <use href="#shapping_basket"></use>
                </svg>
                {/* shopping box باکس سبد خرید */}

                <div className="absolute  w-[400px] left-0 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full    bg-white dark:bg-zinc-700/90   border-t-[3px] border-t-orange-300 rounded-2xl  shadow-normal transition-all dark:text-white  ">
{/* سبد خرید */}

                <BasketShop/>
                </div>
              </div>
            </div>

            <div className="py-3 cursor-pointer">
              {/*  dark if شرط دارک مود*/}

              {darkMode ? (
                <svg width="34" height="34" onClick={toggleDarkMode}>
                  <use href="#moon"></use>
                </svg>
              ) : (
                <svg width="34" height="34" onClick={toggleDarkMode}>
                  <use href="#sun"></use>
                </svg>
              )}
            </div>
          </div>
          {/* devide line */}
          <span className=" block w-px h-14 bg-white/20 "></span>
          {/* login icone */}
          <a className="flex items-center gap-x-2.5 text-xl tracking-tightest">
            <svg width="34" height="34" className="rotate-180">
              <use href="#login"></use>
            </svg>
            <span className="hidden xl:inline-block">
            ورود | ثبت‌نام
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
