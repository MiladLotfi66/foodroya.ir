"use client";

import {
  toggleBasketCart,
  selectIsBasketCartOpen,
  reversemobileMenu,
} from "../../Redux/features/mobileMenu/mobileMenuSlice";
import { useDispatch } from "react-redux";
import Bars3 from "@/module/svgs/Bars3";
import Basketsvg from "@/module/svgs/Basketsvg";
import Image from "next/image";
import ShopingBoxMobile from "@/layout/ShopingBoxMobile";
import { useSelector } from "react-redux";
import UserMicroCard from "@/module/home/UserMicroCard";
// import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GetShopLogos } from "../signinAndLogin/Actions/ShopServerActions";
import { useParams } from "next/navigation";

function MobileHeader({isLogin}) {
  // const { data: session } = useSession();
  const isBasketCartOpen = useSelector(selectIsBasketCartOpen);
  const dispatch = useDispatch();
  const { ShopId } = useParams();
  const [ShopLogo, setShopLogo] = useState("");
  const [ShopTextLogo, setShopTextLogo] = useState("");

  const GetLoGoAndTextLogo = useCallback(async () => {
    try {
      if (!ShopId) {
        return;
      }
      
      const response = await GetShopLogos(ShopId);

      console.log("Logo URL:", response); // اضافه کردن این خط
      console.log("Logo URL:", response.logoUrl); // اضافه کردن این خط
      setShopLogo(response.logos.logoUrl);
      setShopTextLogo(response.logos.TextLogoUrl);
    } catch (error) {
      console.error("Error fetching logos:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    GetLoGoAndTextLogo();
  }, [GetLoGoAndTextLogo]);




  const handleToggleBasketMenu = () => {
    dispatch(toggleBasketCart());
  };
  const handleToggleMobileMenu = () => {
    dispatch(reversemobileMenu());
  };

   return (

    <header className= "flex md:hidden items-center justify-between bg-white dark:bg-zinc-700 px-4 h-16 w[90%] sticky top-0 left-0 right-0 animate-fadeInDownBig duration-400 ease-linear z-50">
      <div className="hidden">
        <Bars3 />
        <Basketsvg />
      </div>

      <svg onClick={handleToggleMobileMenu} className="shrink-0 w-6 h-6 ">
        <use className="text-zinc-700 dark:text-white" href="#Bars3"></use>
      </svg>
      {ShopId && ShopLogo && (
      <Image
        className="w-auto h-auto rounded-full"
        src={ShopLogo}
        width={59}
        height={59}
        quality={60}
        priority={true}

        alt="FoodRoya logo"
      />)}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <svg onClick={handleToggleBasketMenu} className="shrink-0 w-6 h-6">
            <use
              className="text-zinc-700 dark:text-white"
              href="#Basketsvg"
            ></use>
          </svg>

          {/* سبد خرید */}
          <div>
            {/* <div className="overlay md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"></div> */}
            {isBasketCartOpen ? <ShopingBoxMobile /> : ""}
          </div>
        </div>
        {isLogin ? (
          <Link href="/profile">
            <UserMicroCard data={isLogin} />
          </Link>
        ) : (
          ""
        )}
      </div>
    </header>
    

  );
}

export default MobileHeader;
