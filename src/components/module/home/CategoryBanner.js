import CategoriBannerItem from "./CategoriBannerItem";
function CategoryBanner() {
  return (
    <section data-aos='fade-up' className="category_banner container mt-8 mb-10 md:my-20 grid grid-cols-1 md:grid-cols-2 gap-5 ">
    
      <CategoriBannerItem />
      <CategoriBannerItem />
    </section>
  );
}

export default CategoryBanner;
