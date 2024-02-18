"use client"
import {reversemobileMenu} from "../../Redux/features/mobileMenu/mobileMenuSlice";
import { useDispatch } from "react-redux";
import Bars3 from "@/module/svgs/Bars3";
import me from "@/public/Images/PNG/FoodRoyaLogo.png"
import me2 from "@/public/Images/PNG/FoodRoyaLogoDark.png"
import Basketsvg from "@/module/svgs/Basketsvg";
import Image from "next/image";
function MobileHeader() {
  const dispatch = useDispatch();

  return (
    <header className="flex md:hidden items-center justify-between bg-white dark:bg-zinc-700 px-4 h-16 w[90%]">
      <div className="hidden">
        <Bars3 />
        <Basketsvg />
      </div>
      <button onClick={() => console.log("tsts")}>jsj</button>
      <svg  className="shrink-0 w-6 h-6 ">
        <use  className="text-zink-700 dark:text-white" href="#Bars3"></use>
      </svg>
      
      {/* <Image className="w-auto h-auto"
        src={me2}
        width={59}
        height={59}
    
     
       
        alt="FoodRoya logo"
      /> */}
          
      <svg className="shrink-0 w-6 h-6">
        <use className="text-zink-700 dark:text-white" href="#Basketsvg"></use>
      </svg>
    </header>
  );
}

export default MobileHeader;
