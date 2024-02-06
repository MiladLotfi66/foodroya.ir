import product_shopingbox from "@/public/Images/jpg/iphone14.jpg";
import Image from "next/image";
function BasketShop() {
  return (
    <div>
        <div className="flex gap[10px]">
                    <Image
                      src={product_shopingbox}
                      alt="signalmobile logo"
                      width={120}
                      height={120}
                    />

                    <div className="flex-col justify-center gap-6">
                      <h4 className="text-zinc-700 dark:text-white">
                        قهوه اسپرسو بن مانو مدل پریسکا 250 گرمی
                      </h4>
                      <div className="flex-col">
                        <h4 className="text-emerald-500">14.500 تومان تخفیف</h4>
                        <h4 className="text-zinc-700 dark:text-white">
                          175,000 تومان
                        </h4>
                      </div>
                    </div>
                  </div>
    </div>
  )
}

export default BasketShop
