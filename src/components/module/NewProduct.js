import NewProductBody from "@/module/NewProductBody";
import ChevronDown from "@/module/svgs/ChevronDown";
function NewProduct() {
  return (
    <section className="bg-no-repeat bg-cover bg-center  bg-[url('../../public/Images/jpg/chef2.jfif')] w-[1100]  ">
      <div className="lightlinergradient dark:darklinergradient w-[1100] ">
        <div className="container flex items-end justify-between">
          <div className="pt-48">
            <h3 className="section_title">جدید ترین محصولات</h3>
            <h3 className="section_Sub_title">آماده ارسال</h3>
          </div>
          <a href="#" className="section_showmore">
            <span className=" hidden md:inline-block"> مشاهده همه محصولات</span>
            <span className="inline-block md:hidden "> مشاهده همه </span>

            <svg className="  w-4 h-4 rotate-90">
              <ChevronDown />
            </svg>
          </a>
        </div>
        <NewProductBody />
      </div>
    </section>
  );
}

export default NewProduct;
