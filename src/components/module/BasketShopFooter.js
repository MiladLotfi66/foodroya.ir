
function BasketShopFooter() {
  return (
    <div className="flex  justify-between items-center pt-6">
        <div>
          <h4 className="text-gray-300 text-xs ">مبلغ قابل پرداخت</h4>
          <div>
            <span className="text-zinc-700 dark:text-white font-DanaDemiBold ">
              175,000
              <span className="text-xs font-Dana">تومان</span>
            </span>
          </div>
        </div>
        <button className="w-28 h-11 md:w-36 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700  text-white">ثبت سفارش</button>
      </div>
  )
}

export default BasketShopFooter
