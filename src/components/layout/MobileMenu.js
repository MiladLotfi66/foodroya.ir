"use client";
import {
  selectmobileMenu,
  reversemobileMenu,
} from "../../Redux/features/mobileMenu/mobileMenuSlice";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import me from "@/public/Images/PNG/FoodRoyaLogo.png";
import textlogo from "@/public/Images/PNG/foodroyaTextlogo.png";
import Xmark from "@/module/svgs/X-mark";
import { useTheme } from "next-themes";
import Loginlogosvg from "@/module/svgs/Loginlogosvg";
import Basketsvg from "@/module/svgs/Basketsvg";
import Moonsvg from "@/module/svgs/Moonsvg.js";
import Sunsvg from "@/module/svgs/Sunsvg";
import HomeSvg from "@/module/svgs/HomeSvg";
import ShoppingBag from "@/module/svgs/ShoppingBag";
import Breifcase from "@/module/svgs/Breifcase";
import PhoneArrow from "@/module/svgs/PhoneArrow";
import ChevronDown from "@/module/svgs/ChevronDown";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Exitsvg from "@/module/svgs/Exitsvg";

function MobileMenu() {
  const { theme, setTheme } = useTheme();
  const isOpenMobileMenu = useSelector(selectmobileMenu);
  const dispatch = useDispatch();
  const [shopSubMenu, setShopSubmenu] = useState(false);
  // const sessionData = useSession();
  const { data: session } = useSession()


  return (
    <>
      {isOpenMobileMenu ? (
        <div>
          <div
            className={
              theme === "dark"
                ? "fixed left-0 top-0 right-0 min-h-screen w-64 md:hidden bg-white dark:bg-zinc-700 z-20"
                : "fixed left-0 top-0 right-0 min-h-screen w-64 md:hidden bg-white dark:bg-zinc-700 z-20"
            }
          >
            <div className="hidden">
              <Xmark />
              <Loginlogosvg />
              <Basketsvg />
              {/* <Moonsvg /> */}
              <Sunsvg />
              <HomeSvg />
              <ShoppingBag />
              <Breifcase />
              <PhoneArrow />
              <ChevronDown />
              <Exitsvg/>
            </div>
            {/* ************************ header ************************ */}
            <div className="flex justify-between  items-center mx-4 mt-3 mb-6 border-b border-b-gray-300 dark:border-b-white/10 pb-5">
              <div className="flex justify-between items-center gap gap-x-5">
                <Image
                  className="w-auto h-auto"
                  src={me}
                  width={40}
                  height={40}
                  alt="FoodRoya logo"
                />
                <Image
                  className="w-auto h-auto"
                  src={textlogo}
                  width={100}
                  height={40}
                  alt="FoodRoyatextlogo"
                />
              </div>

              <svg
                onClick={() => dispatch(reversemobileMenu())}
                className=" w-5 h-5  text-zinc-600 dark:text-white"
              >
                <use href="#Xmark"></use>
              </svg>
            </div>
            {/* ************************ nav menu ************************ */}
            <ul className="text-orange-300 mr-2.5 px-4 flex flex-col gap-y-4 child:child:flex child:child:gap-x-2 ">
              <li>
                <a>
                  <svg className="w-5 h-5">
                    <use href="#HomeSvg"></use>
                  </svg>
                  <span>صفحه اصلی</span>
                </a>
              </li>

              <li onClick={() => setShopSubmenu(!shopSubMenu)}>
                <a className="justify-between">
                  <div className="flex gap-x-2">
                    <svg className="w-5 h-5">
                      <use href="#ShoppingBag"></use>
                    </svg>
                    <span>فروشگاه</span>
                  </div>
                  <span>
                    <svg
                      className={shopSubMenu ? "w-5 h-5 rotate-180" : "w-5 h-5"}
                    >
                      <use href="#ChevronDown"></use>
                    </svg>
                  </span>
                </a>
                {shopSubMenu ? (
                  <ul className="mt-3">
                    <li className="submenu flex flex-col gap-y-3 pr-7  text-zinc-600 dark:text-white ">
                      <a className="inline" href="#">
                        انواع سوسیس و کالباس
                      </a>
                      <a className="inline" href="#">
                        غذاهای نیمه آماده
                      </a>
                      <a className="inline" href="#">
                        انواع سبزیجات فریزری
                      </a>
                      <a className="inline" href="#">
                        فست فود ها
                      </a>
                    </li>
                  </ul>
                ) : (
                  ""
                )}
              </li>
              <li>
                <a>
                  <svg className="w-5 h-5">
                    <use href="#Breifcase"></use>
                  </svg>
                  <span>درباره ما</span>
                </a>
              </li>
              <li>
                <a>
                  <svg className="w-5 h-5">
                    <use href="#PhoneArrow"></use>
                  </svg>
                  <span>تماس باما</span>
                </a>
              </li>
              
            </ul>

            {/* ************************ footer ************************ */}

            <div className="flex flex-col gap-6 pt-8 px-2.5 mx-4 mt-8  text-orange-300 border-t border-t-gray-300 dark:border-t-white/10 ">
             
            {session ? (
              <Link href="#" className=" inline-flex items-center gap-x-2" onClick={() => signOut()}>
                <svg className="w-5 h-5">
                  <use href="#Exitsvg"></use>
                </svg>
                خروج
              </Link>)
              :(
                <Link href="/signin" className=" inline-flex items-center gap-x-2    ">
                  <svg className="w-5 h-5 rotate-180">
                    <use href="#login"></use>
                  </svg>
                  ورود | ثبت نام
                </Link>)}

              <div className="flex gap-x-2">
                {theme === "dark" ? (
                  <span
                    className="flex items-center gap-x-2 "
                    onClick={() => setTheme("light")}
                  >
                    <svg className="  w-5 h-5">
                      <use href="#Sunsvg"></use>
                    </svg>
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-x-2  "
                    onClick={() => setTheme("dark")}
                  >
                    <svg className="  w-5 h-5">
                      <use href="#Moonsvg"></use>
                    </svg>
                  </span>
                )}
                {theme === "dark" ? (
                  <span onClick={() => setTheme("light")}>تم روشن</span>
                ) : (
                  <span onClick={() => setTheme("dark")}>تم تیره</span>
                )}
              </div>
              <a href="#" className="inline-flex items-center gap-x-2   ">
                <svg className="  w-5 h-5">
                  <use href="#Basketsvg"></use>
                </svg>
                سبد خرید
              </a>
            </div>
          </div>
          <div onClick={() => dispatch(reversemobileMenu())} className="overlay md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"></div>
        </div>
      ) : (
        ""
      )}
      {/* ************************ overlay ************************ */}
    </>
  );
}

export default MobileMenu;
