import LocationSvg from "@/module/svgs/location"
function AbuteAddress() {
  return (
    <div className=" flex items-center ">
        <div className="w-10 h-10 ">

        <div className="logoName h-8 w-8 ml-3 ">
            
          <LocationSvg />
        </div>
        </div>
      <span className="logoName text-sm line-clamp-2">مازندران ، قائمشهر  ، خیابان ساری ، سراه شهدا  ، نبش شهدا ۴ ، ساختمان بیتا</span>
    </div>
  )
}

export default AbuteAddress
