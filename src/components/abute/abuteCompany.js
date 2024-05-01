import CategoriIconeAndName from "@/module/home/CategoriIconeAndName";
import AbuteDescription from "./abuteDescription";
import AbuteAddress from "./abuteAddress";
import AbuteMobile from "./abuteMobile";
import AbutePhone from "./abutePhone";
import AbuteSocialNetworks from "./abuteSocialNetworks";

function AbuteCompany() {
  return (
    <div className="container px-7 flex-col gap-y-5">
      <div className="  mt-5 flex flex-wrap md:flex-nowrap items-center md:pt-36  gap-y-10">
        <div className="flex flex-1">
          <CategoriIconeAndName />
          <AbuteDescription />
        </div>
        <div className="flex-col flex-wrap space-y-5 flex-1">
          <AbuteAddress />
          <div className="flex gap-x-5">
            <AbuteMobile />
            <AbutePhone />
          </div>
        </div>
      </div>

      <div>
        <AbuteSocialNetworks />
      </div>
    </div>
  );
}

export default AbuteCompany;
