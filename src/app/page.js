import NewProduct from "@/module/home/NewProduct";
import CategoryBanner from "@/module/home/CategoryBanner";
import ProductCategori from "@/module/home/ProductCategori";
import BestSalling from "@/module/home/BestSalling";

export default function Home() {
  return (
    <>
      <NewProduct />
      <CategoryBanner />
      <ProductCategori />
      <BestSalling />
    </>
  );
}
