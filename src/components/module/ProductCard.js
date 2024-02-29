import Image from "next/image";
import Basketsvg from "./svgs/Basketsvg";
import calbas from "../../../public/Images/jpg/Salami.jpg";
import ChatSVG from "./svgs/ChatSVG";
import Star from "./svgs/Star";
function ProductCard() {
  return (
    <div className=" bg-white p-5 mt-10 md:mt-12 dark:bg-zinc-700 shadow-normal  rounded-2xl ">
      {/* //////////////////تصویر و درصد تخفیف //////////////////// */}

      <div className="relative z-0">
        <Image
          className=" w-auto h-auto rounded-md"
          src={calbas}
          alt="signalmobile procuct"
          width={260}
          height={260}
          quality={50}
          priority={true}
        />
        <span className="absolute shadow-normal top-1.5 right-1.5 block h-[30px] leading-[32px] bg-orange-300 text-white dark:text-zinc-700 px-3.5  py-[2px] rounded-full text-sm font-DanaDemiBold ">
          12 %
        </span>
      </div>

      {/* //////////////////عنوان محصول //////////////////// */}

      <h4 className="text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base line-clamp-2 text-wrap">
        کالباس فیله ی بوقلمون 500 گرمی
      </h4>

      {/* //////////////////قیمت و تخفیف //////////////////// */}
      <div className="flex  items-center justify-between gap-3 font-Dana text-xs">
        <div className="text-teal-600 dark:text-emerald-500 text-wrap line-clamp-2 w-[165px] max-w-[165px]">
          <span className="font-DanaDemiBold text-xl ">
            145000000000
          </span>
          <span className="text-sm tracking-tighter">تومان</span>
        </div>
        <div className="offerPrice ">
          <span
            className="font-DanaDemiBold text-xl offerPrice::before">
            175000000000
          </span>
          <span className="text-sm hidden md:inline-block">تومان</span>
        </div>
      </div>
      {/* //////////////////footer //////////////////// */}
      <div className="flex justify-between items-center">
        <div className="flex justify-start items-center ">
          <Basketsvg />
          <ChatSVG />
        </div>
        <div className="flex justify-start items-End">
          <Star />
          <Star />
          <Star />
          <Star />
          <Star />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
