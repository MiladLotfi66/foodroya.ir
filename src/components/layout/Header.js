"use client";
import { useState } from "react";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import Image from "next/image";
import Moonsvg from "@/module/svgs/Moonsvg.js";
import Basketsvg from "@/module/svgs/Basketsvg";
import Leftarrow from "@/module/svgs/Leftarrow";
import Loginlogosvg from "@/module/svgs/Loginlogosvg";
import Sunsvg from "@/module/svgs/Sunsvg";
import ShopingCartPage from "@/templates/shoppingCart/shopingCartPage";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import Link from "next/link";
import UserMicroCard from "@/module/home/UserMicroCard";
import { signOut, useSession } from "next-auth/react";
import { useSelector } from "react-redux";

function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const {
    currentShopId,
    shopLogo,
    shopTextLogo,
  
  } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
  const ShopLogo = shopLogo;
  const ShopTextLogo=shopTextLogo;
 
 
  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className={
        theme === "dark"
          ? "dark hidden md:flex right-0 left-0 top-9 fixed  items-center bg-black/50  w-[98%] lg:w-[90%] h-24 rounded-3xl px-5 lg:px-10 mx-auto backdrop-blur-[6px] z-50"
          : "hidden md:flex  right-0 left-0 top-9 fixed  items-center bg-black/50 w-[98%] lg:w-[90%] h-24 rounded-3xl px-5 lg:px-10 mx-auto backdrop-blur-[6px] z-50"
      }
    >
      <div className="flex justify-between w-full">
        <div className="hidden">
          {/*  آیکون جهت چپ */}
          <Leftarrow />
          {/* آیکون سیگنال موبایل */}

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
          {ShopId && ShopLogo && (
            <Image
              className="flex items-center shrink-0 w-auto h-auto rounded-full"
              src={ShopLogo}
              width={59}
              height={59}
              quality={20}
              alt="FoodRoya logo"
              priority={true}
            />
          )}
          <ul className="flex h-full text-xl text-gray-300 gap-x-4 md:gap-x-7 xl:gap-x-9 tracking-tightest child:text-xs sm:child:text-xl child:leading-[56px] child-hover:text-orange-300 ">
            <li className="flex items-center">
              <a className="font-DanaMedium text-orange-200 my-auto" href="/">
                صفحه اصلی
              </a>
            </li>
            <li className="relative group flex items-center">
              <a>فروشگاه ها</a>
              <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full w-52  space-y-4 text-zinc-700    bg-white  text-base  border-t-[3px] border-t-orange-300 rounded-2xl  tracking-normal  shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 child:inline-block p-6 pt-[21px] child:transition-colors child-hover:text-orange-300 ">
              {session ? (<a href={"/Shop/userShop"}>فروشگاههای من</a>):""}
                <a href={"/Shop/allShop"}>فروشگاههای دنبال شده</a>
              </div>
            </li>
            <li className="flex items-center">
              <a href="#">بلاگ</a>
            </li>

            {session ? (
              <>
                <li className="flex items-center">
                  <Link href="/profile">پروفایل</Link>
                </li>
                {ShopId && (
                  <li className="flex items-center">
  <Link href={`/${ShopId}/panel`}>پنل مدیریتی</Link>
  </li>
                )}
                <li className="flex items-center">
                  <button
                    onClick={handleSignOut}
                   
                  >
                    خروج
                  </button>
                </li>
              </>
            ) : (
              ""
            )}
          </ul>
        </nav>

        {/* shopping basket and lodin moon */}
        <div className="flex gap-x-3 xl:gap-x-10 text-orange-200 items-center ">
          {/* shopping and moon */}
          <div className="flex gap-x-4">
            {/* shopping icone hover */}
           <div className="relative group">
    <div className="py-3">
      <svg width="34" height="34" className="cursor-pointer">
        <use href="#Basketsvg"></use>
      </svg>
      
      {/* بدج سبد خرید */}
      {cartItems.length > 0 && (
        <span className="absolute -top-0 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
      
      {/* shopping box باکس سبد خرید */}
      <div className="absolute w-[400px] left-0 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full bg-white dark:bg-zinc-700/90 border-t-[3px] border-t-orange-300 rounded-2xl shadow-normal transition-all dark:text-white">
        <ShopingCartPage />
        {/* <BasketShop /> */}
      </div>
    </div>
  </div>


            <div className="py-3 cursor-pointer ">
              {/*  dark if شرط دارک مود*/}
              {theme === "dark" ? (
                <svg
                  className=" text-orange-200"
                  width="34"
                  height="34"
                  onClick={() => setTheme("light")}
                >
                  <use href="#Sunsvg"></use>
                </svg>
              ) : (
                <svg
                  className=" text-orange-200"
                  width="34"
                  height="34"
                  onClick={() => setTheme("dark")}
                >
                  <use href="#Moonsvg"></use>
                </svg>
              )}
            </div>
          </div>
          {/* devide line */}
          <span className=" block w-px h-14 bg-white/20 "></span>
          {/* login icone */}

          {session ? (
            <Link href="/profile">
              <UserMicroCard user={session.user} />
            </Link>
          ) : (
            <Link
              href="/signin"
              className="flex items-center gap-x-2.5 text-xl tracking-tightest"
            >
              <svg width="34" height="34" className="rotate-180">
                <use href="#login"></use>
              </svg>
              <span className="hidden xl:inline-block">ورود</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
