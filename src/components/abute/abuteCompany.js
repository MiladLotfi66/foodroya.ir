import CategoriIconeAndName from "@/module/home/CategoriIconeAndName";
import AbuteDescription from "./abuteDescription";
import AbuteAddress from "./abuteAddress";
import AbuteMobile from "./abuteMobile";
import AbutePhone from "./abutePhone";
function AbuteCompany() {
  return (
    <div className=" container flex items-center md:pt-36 px-7">
       <CategoriIconeAndName/>
        <AbuteDescription/>
        <div className="flex-col space-y-5"> 

        <AbuteAddress/>
        <div className="flex gap-x-5">

        <AbuteMobile/>
        <AbutePhone/>
        </div>

        </div>

    </div>
  )
}
           
export default AbuteCompany
