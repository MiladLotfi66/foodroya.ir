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
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import ShopingCartPage from "@/templates/shoppingCart/shopingCartPage";

function MobileHeader({isLogin}) {
  // const { data: session } = useSession();
  const isBasketCartOpen = useSelector(selectIsBasketCartOpen);

  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);


  const dispatch = useDispatch();

  const {
    currentShopId,
    shopLogo,
    shopTextLogo,
  
  } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
  const ShopLogo = shopLogo;
  const ShopTextLogo=shopTextLogo;




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

{/* ///////////////////// */}
<div className="relative group">
    <div className="py-3">
    <svg onClick={handleToggleBasketMenu} className="shrink-0 w-6 h-6">
    <use href="#Basketsvg"></use>
      </svg>
      
      {/* بدج سبد خرید */}
      {cartItems.length > 0 && (
        <span className="absolute -top-0 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
      
      {/* shopping box باکس سبد خرید */}
      <div className={isBasketCartOpen?"absolute w-[400px] left-0 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full bg-white dark:bg-zinc-700/90 border-t-[3px] border-t-orange-300 rounded-2xl shadow-normal transition-all dark:text-white":"hidden"}>
        <ShopingCartPage />
        {/* <BasketShop /> */}
      </div>
    </div>
  </div>
{/* //////////////////// */}


     
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
