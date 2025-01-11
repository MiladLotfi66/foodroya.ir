"use client";
import {
  toggleBasketCart,
  selectMobileMenu,
  reversemobileMenu,
} from "../../Redux/features/mobileMenu/mobileMenuSlice";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import me from "@/public/Images/PNG/FoodRoyaLogo.webp";
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
import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

// import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Exitsvg from "@/module/svgs/Exitsvg";
import { GetShopLogos } from "../templates/Shop/ShopServerActions";
import UserMicroCard from "@/module/home/UserMicroCard";

function MobileMenu({ isLogin }) {
  const { theme, setTheme } = useTheme();
  const isOpenMobileMenu = useSelector(selectMobileMenu);
  const dispatch = useDispatch();
  const [shopSubMenu, setShopSubmenu] = useState(false);

  const { data: session, status } = useSession();
  const { ShopId } = useParams();
  const [ShopLogo, setShopLogo] = useState("");
  const [ShopTextLogo, setShopTextLogo] = useState("");

  const GetLoGoAndTextLogo = useCallback(async () => {
    try {
      if (!ShopId) {
        return;
      }
      
      const response = await GetShopLogos(ShopId);

      setShopLogo(response.logos.logoUrl);
      setShopTextLogo(response.logos.textLogoUrl);
    } catch (error) {
      console.error("Error fetching logos:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    GetLoGoAndTextLogo();
  }, [GetLoGoAndTextLogo]);


  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {isOpenMobileMenu ? (
        <div>
          <div
            className={
              theme === "dark"
                ? "fixed left-0 top-0 right-0 min-h-screen w-64 md:hidden bg-white dark:bg-zinc-700 z-50"
                : "fixed left-0 top-0 right-0 min-h-screen w-64 md:hidden bg-white dark:bg-zinc-700 z-50"
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
              <Exitsvg />
            </div>
            {/* ************************ header ************************ */}
            <div className="flex justify-between  items-center mx-4 mt-3 mb-6 border-b border-b-gray-300 dark:border-b-white/10 pb-5">
              <div className="flex justify-between items-center gap gap-x-5">
              {session ? (
            <Link href="/profile">
              <UserMicroCard user={session.user} />
            </Link>
          ) : ""}
                {/* <Image
                  className="w-auto h-auto"
                  src={me}
                  width={40}
                  height={40}
                  priority={true}
                  alt="logo"
                /> */}
                 {ShopId && ShopLogo && (
               <div className="w-25 h-10 overflow-hidden">
               <Image
                 className="object-contain"
                 src={ShopTextLogo}
                 width={100}
                 height={40}
                 priority={true}
                 alt="textlogo"
               />
             </div>
             
                 )}
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
                <Link href="/" onClick={() => dispatch(reversemobileMenu())}>
                  <svg className="w-5 h-5">
                    <use href="#HomeSvg"></use>
                  </svg>
                  <span>صفحه اصلی</span>
                </Link>
              </li>

              <li onClick={() => setShopSubmenu(!shopSubMenu)}>
                <div className="justify-between">
                  <div className="flex gap-x-2">
                    <svg className="w-5 h-5">
                      <use href="#ShoppingBag"></use>
                    </svg>
                    <span>فروشگاه ها</span>
                  </div>
                  <span>
                    <svg
                      className={shopSubMenu ? "w-5 h-5 rotate-180" : "w-5 h-5"}
                    >
                      <use href="#ChevronDown"></use>
                    </svg>
                  </span>
                </div>
                {shopSubMenu ? (
                  <ul className="mt-3">
                    <li className="submenu flex flex-col gap-y-3 pr-7  text-zinc-600 dark:text-white ">
                      <Link
                        href="/Shop/userShop"
                        className="inline"
                        onClick={() => dispatch(reversemobileMenu())}
                      >
                        فروشگاههای من
                      </Link>
                      <Link
                        href="/Shop/allShop"
                        className="inline"
                        onClick={() => dispatch(reversemobileMenu())}
                      >
                        همه فروشگاه ها
                      </Link>
                      <Link
                        href="/Shop/allShop"
                        className="inline"
                        onClick={() => dispatch(reversemobileMenu())}
                      >
                        فروشگاه های دنبال شده
                      </Link>
                    </li>
                  </ul>
                ) : (
                  ""
                )}
              </li>
              <li>
                <Link
                  href="/abute"
                  onClick={() => dispatch(reversemobileMenu())}
                >
                  <svg className="w-5 h-5">
                    <use href="#Breifcase"></use>
                  </svg>
                  <span>درباره ما</span>
                </Link>
              </li>
              <li></li>
            </ul>

            {/* ************************ footer ************************ */}

            <div className="flex flex-col gap-6 pt-8 px-2.5 mx-4 mt-8  text-orange-300 border-t border-t-gray-300 dark:border-t-white/10 ">
              {session ? (
                <>
                  <li className="flex items-center">
                    <Link
                      href="/profile"
                      onClick={() => dispatch(reversemobileMenu())}
                    >
                      پروفایل
                    </Link>
                  </li>

                  {ShopId && (
                    <li className="flex items-center"
                                        onClick={() => dispatch(reversemobileMenu())}
                    >

                          <Link href={`/${ShopId}/panel`}>پنل مدیریتی</Link>

                    </li>
                  )}

                  <Link
                    href="/"
                    className=" inline-flex items-center gap-x-2"
                    onClick={handleSignOut}
                  >
                    <svg className="w-5 h-5">
                      <use href="#Exitsvg"></use>
                    </svg>
                    خروج
                  </Link>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => dispatch(reversemobileMenu())}
                  className=" inline-flex items-center gap-x-2    "
                >
                  <svg className="w-5 h-5 rotate-180">
                    <use href="#login"></use>
                  </svg>
                  ورود | ثبت نام
                </Link>
              )}

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
              <Link
                href="#"
                onClick={() => {
                  dispatch(reversemobileMenu());
                  dispatch(toggleBasketCart());
                }}
                className="inline-flex items-center gap-x-2   "
              >
                <svg className="  w-5 h-5">
                  <use href="#Basketsvg"></use>
                </svg>
                سبد خرید
              </Link>
            </div>
          </div>
          <div
            onClick={() => dispatch(reversemobileMenu())}
            className="overlay md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"
          ></div>
        </div>
      ) : (
        ""
      )}
      {/* ************************ overlay ************************ */}
    </>
  );
}

export default MobileMenu;
