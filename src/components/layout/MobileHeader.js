import Bars3 from "@/module/svgs/Bars3";
import me from "@/public/Images/PNG/FoodRoyaLogo.png"
import me2 from "@/public/Images/PNG/FoodRoyaLogoDark.png"
import Basketsvg from "@/module/svgs/Basketsvg";
import Image from "next/image";
function MobileHeader() {
  return (
    <header className="flex md:hidden items-center justify-between bg-white dark:bg-zinc-700 px-4 h-16 w[90%]">
      <div className="hidden">
        <Bars3 />
        <Basketsvg />
      </div>
      <svg className="shrink-0 w-6 h-6 ">
        <use className="text-zink-700 dark:text-white" href="#Bars3"></use>
      </svg>
    
      <Image
        src={me2}
        width={59}
        height={59}
        quality={10}
        priority={false}
        loading = 'lazy'
        alt="FoodRoya logo"
      />
          
      <svg className="shrink-0 w-6 h-6">
        <use className="text-zink-700 dark:text-white" href="#Basketsvg"></use>
      </svg>
    </header>
  );
}

export default MobileHeader;
