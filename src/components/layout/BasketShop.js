import BasketShopFooter from "@/module/home/BasketShopFooter";
import BasketShopProductCard from "@/module/home/BasketShopProductCard";

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
      <BasketShopProductCard/>
      <BasketShopProductCard/>

      {/* shopping box footer فوتر سبد خرید */}
      {/* <div className="flex justify-between items-center pt-6">
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
      </div> */}
      <BasketShopFooter/>
    </div>
  );
}

export default BasketShop;

