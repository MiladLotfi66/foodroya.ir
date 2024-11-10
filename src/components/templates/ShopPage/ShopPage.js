import NewProduct from "@/module/home/NewProduct";
import Banner2 from "@/module/home/Banner2";
import CategoryBanner from "@/module/home/CategoryBanner";
import ProductCategori from "@/module/home/ProductCategori";
import BestSalling from "@/module/home/BestSalling";

function ShopPage() {
  return (
    <>
      <Banner2 />
      <NewProduct />
      <CategoryBanner />
      <ProductCategori />
      <BestSalling />
    </>
  )
}
export default ShopPage