import product_shopingbox from "@/public/Images/jpg/iphone14.jpg";
import Image from "next/image";
function BasketShop() {
  return (
    <div>
      {/* shopping box title نوار عنوان سبد خرید */}

      <div className="flex justify-between items-center font-DanaMedium text-xs tracking-tighter">
        <span className="text-gray-300 ">1 مورد</span>
        <a className="flex items-center text-orange-300">
          مشاهده سبد خرید
          <svg width="20" height="20">
            <use href="#left_arrow"></use>
          </svg>
        </a>
      </div>
      {/* shopping box  list محصولات  سبد خرید */}
      <div className="flex gap[10px] mt-5 border-b border-b-gray-300 dark:border-b-white/10 pb-6">
        <Image className="w-auto h-auto"
          src={product_shopingbox}
          alt="signalmobile logo"
          width={120}
          height={120}
        />

        <div className="flex flex-col justify-between gap-6 px-2">
          <h4 className="text-zinc-700 dark:text-white font-DanaMedium text-base">
            قهوه اسپرسو بن مانو مدل پریسکا 250 گرمی
          </h4>
          <div className="flex flex-col">
            <h4 className="dark:text-emerald-500 text-teal-600 text-xs tracking-tighter">
              14.500 تخفیف
            </h4>
            <h4 className="text-zinc-700 dark:text-white font-DanaDemiBold">
              175,000
              <span className="text-xs font-Dana">تومان</span>
            </h4>
          </div>
        </div>
      </div>

      {/* shopping box footer فوتر سبد خرید */}
      <div className="flex justify-between items-center pt-6">
        <div>
          <h4 className="text-gray-300 text-xs ">مبلغ قابل پرداخت</h4>
          <div>
            <span className="text-zinc-700 dark:text-white font-DanaDemiBold ">
              175,000
              <span className="text-xs font-Dana">تومان</span>
            </span>
          </div>
        </div>
        <button className="w-36 h-14  bg-teal-600 rounded-xl hover:bg-teal-700  text-white">ثبت سفارش</button>
      </div>
    </div>
  );
}

export default BasketShop;

