"use client";
import Image from "next/image";
import me from "@/public/Images/PNG/FoodRoyaLogo.png";
import textlogo from "@/public/Images/PNG/foodroyaTextlogo.png";
import Xmark from "@/module/svgs/X-mark";
import { useTheme } from "next-themes";

function MobileMenu() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div
        className={
           "fixed left-0 top-0 right-0 min-h-screen w-64  bg-white dark:bg-zinc-700 z-20"
        }
      >
        <div className="hidden">
          <Xmark />
        </div>
        <div className="flex justify-between  items-center mx-4 mt-3  border-b border-b-gray-300 dark:border-b-white/10 pb-5">
          <div className="flex justify-between items-center gap gap-x-5">
            <Image
              src={me}
              width={40}
              height={40}
              quality={10}
              priority={false}
              loading="lazy"
              alt="FoodRoya logo"
            />
            <Image
              src={textlogo}
              width={100}
              height={40}
              quality={10}
              priority={false}
              loading="lazy"
              alt="FoodRoyatextlogo"
            />
          </div>

          <svg className=" w-5 h-5  text-zinc-600 dark:text-white">
            <use  href="#Xmark"></use>
          </svg>
        </div>
        MobileMenu
      </div>
      <div className="overlay md:hidden fixed inset-0 w-full h-full bg-black/40 z-10"></div>
    </>
  );
}

export default MobileMenu;
