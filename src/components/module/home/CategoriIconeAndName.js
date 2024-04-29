import Image from "next/image";
import img from "@/public/Images/jpg/hamber2.jpeg";

function CategoriIconeAndName() {
  return (
    <a href="#" className="w-25  md:w-50  text-center cursor-pointer">
      <Image 
        className=" mb-2.5 rounded-full"
        src={img}
        alt="signalmobile procuct"
        width={100}
        height={100}
        quality={80}
        priority={true}
      />
      <div className="flexCenter">

      <h4 className="text-wrap text-zinc-700 dark:text-white font-DanaDemiBold text-sm md:text-xl ">سوسیس و کالباس </h4>
      </div>
    </a>
  )
}

export default CategoriIconeAndName
