import ProductCard from "./ProductCard"
import Image from "next/image";
import Basketsvg from "./svgs/Basketsvg";
import calbas from "../../../public/Images/jpg/Sausage.jpg";
import Chatsvg from "./svgs/ChatSVG";
import Star from "./svgs/Star";

function NewProductBody() {
  return (
    <div className="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-3.5 md:gap-5 pb-5">
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
     <ProductCard/>
   
    </div>
  )
}

export default NewProductBody
