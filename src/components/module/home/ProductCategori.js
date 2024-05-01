import CategoriIconeAndName from "./CategoriIconeAndName";
import ChevronDown from "@/module/svgs/ChevronDown";

function ProductCategori() {
  return (
    <section data-aos='fade-up' className="ProductCategori mb-10 md:mb-20  ">
      <div className="container ">
      <div className="container flex items-end justify-between">
          <div >
            <h3 className="section_title">دسته بندی محصولات</h3>
            {/* <h3 className="section_Sub_title">آماده ارسال</h3> */}
          </div>
          <a href="#" className="section_showmore">
            <span className=" hidden md:inline-block"> مشاهده همه دسته بندی ها</span>
            <span className="inline-block md:hidden "> مشاهده همه </span>

            <svg className="  w-4 h-4 rotate-90">
              <ChevronDown />
            </svg>
          </a>
        </div>
        <div className="flex items-center justify-center pt-9 gap-y-6 gap-x-[29px] md:gap-[65px] flex-wrap">
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
