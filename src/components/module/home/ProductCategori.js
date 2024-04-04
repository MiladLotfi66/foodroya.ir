import CategoriIconeAndName from "./CategoriIconeAndName";

function ProductCategori() {
  return (
    <section data-aos='fade-up' className="ProductCategori mb-10 md:mb-20  ">
      <div className="container ">
        <div className="flex items-center justify-center gap-y-6 gap-x-[29px] md:gap-[65px] flex-wrap">
          <CategoriIconeAndName />
          <CategoriIconeAndName />
          <CategoriIconeAndName />
          <CategoriIconeAndName />
          <CategoriIconeAndName />
      
        </div>
      </div>
    </section>
  );
}

export default ProductCategori;
