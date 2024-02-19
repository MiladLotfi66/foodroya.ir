"use client";
import { reversemobileMenu } from "../../Redux/features/mobileMenu/mobileMenuSlice";
import { useDispatch } from "react-redux";
import Bars3 from "@/module/svgs/Bars3";
import me from "@/public/Images/PNG/FoodRoyaLogo.png";
import me2 from "@/public/Images/PNG/FoodRoyaLogoDark.png";
import Basketsvg from "@/module/svgs/Basketsvg";
import BasketShop from "@/layout/BasketShop";
import Image from "next/image";


function MobileHeader() {


  const dispatch = useDispatch();

  return (

    <header className="flex md:hidden items-center justify-between bg-white dark:bg-zinc-700 px-4 h-16 w[90%]">
      <div className="hidden">
        <Bars3 />
        <Basketsvg />
      </div>

      <svg
        onClick={() => dispatch(reversemobileMenu())}
        className="shrink-0 w-6 h-6 "
      >
        <use className="text-zinc-700 dark:text-white" href="#Bars3"></use>
      </svg>

      <Image
        className="w-auto h-auto"
        src={me2}
        width={59}
        height={59}
        alt="FoodRoya logo"
      />
<div className="relative group">

      <svg className="shrink-0 w-6 h-6">
        <use className="text-zinc-700 dark:text-white" href="#Basketsvg"></use>
      </svg>
      <div className="absolute  w-[400px] left-0 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible top-full    bg-white dark:bg-zinc-700/90   border-t-[3px] border-t-orange-300 rounded-2xl  shadow-normal transition-all dark:text-white  ">
        {/* سبد خرید */}

        <BasketShop />
      </div>
</div>
    </header>
  );
}

export default MobileHeader;
