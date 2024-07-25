import Threedot from "@/module/svgs/threedot";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
function RoleName({ name }) {
  return (
    <div className=" rounded-full bg-gray-300 dark:bg-zinc-600 h-[6rem] w-[6rem] text-xs md:text-base md:h-32 md:w-32 flex items-center justify-center hover:border hover:dark:bg-zinc-500 hover:border-orange-300">
      <div className="hidden">
        <EditSvg />
        <DeleteSvg />
        <EyeSvg />
      </div>
      <div className="flex-col items-center justify-center ">
        <p className="text-center mb-4">{name}</p>
        <div className="flexCenter gap-2 md:gap-3 child-hover:text-orange-300">

        <svg className="h-5 w-5 md:h-7 md:w-7">
                  <use href="#EditSvg"></use>
        </svg> 

         <svg className="h-5 w-5 md:h-7 md:w-7">
                  <use href="#DeleteSvg"></use>
        </svg>  

        <svg className="h-5 w-5 md:h-7 md:w-7">
                  <use href="#EyeSvg"></use>
        </svg>
        
        
         
        </div>
      </div>
    </div>
  );
}

export default RoleName;
