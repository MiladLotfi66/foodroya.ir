import product_shopingbox from "@/public/Images/jpg/iphone14.jpg";
import Image from "next/image";
function BasketShopProductCard() {
  return (
    <div className="flex gap-1 md:gap[10px]  mt-5 border-b border-b-gray-300 dark:border-b-white/10 pb-2 md:pb-6">
   <div className="w-[90] h-[90] md:w-auto md:h-auto">
   <Image 
      src={product_shopingbox}
      alt="signalmobile procuct"
      width={120}
      height={120}
      quality={10}
    />
   </div>
   
    
    <div className="flex flex-col justify-between gap-[6] md:gap-6 px-1 md:px-2">
      <h4 className="text-zinc-700 dark:text-white font-DanaMedium text-sm md:text-base">
        قهوه اسپرسو بن مانو مدل پریسکا 250 گرمی
      </h4>
      <div className="flex flex-col">
        <h4 className="dark:text-emerald-500 text-teal-600 text-xs tracking-tighter">
          14.500 تخفیف
        </h4>
        <h4 className="text-zinc-700 dark:text-white font-DanaDemiBold text-xs md:text-base">
          175,000
          <span className="text-xs font-Dana">تومان</span>
        </h4>
      </div>
    </div>
    </div>
  )
}

export default BasketShopProductCard
