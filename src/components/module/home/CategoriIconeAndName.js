import Image from "next/image";
import img2 from "@/public/Images/jpg/hamber2.webp";

function CategoriIconeAndName() {
  return (
    <a href="/" className="w-25 block md:w-50  text-center cursor-pointer">
      <Image 
        className="w-25 h-25 mb-2.5 rounded-full"
        src={img2}
        alt="signalmobile procuct"
        width={70}
        height={70}
        quality={60}
        priority={true}
        // objectFit="contain"
        // objectFit="cover"
        style={{ objectFit: 'cover' }} // یا objectFit="contain" 
      />
      <div className="flexCenter">

      <h4 className="logoName line-clamp-2  h-10 md:h-[51px]">سوسیس و کالباس </h4>
      </div>
    </a>
  )
}

export default CategoriIconeAndName
