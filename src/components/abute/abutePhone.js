import PhoneSvg from "@/module/svgs/phoneSvg1"
function AbutePhone() {
  return (
    <div className="mr-10 flex items-center">
        <div className="w-10 h-10  ">

        <div className="logoName h-8 w-8 ml-3 transform -scale-x-100  -rotate-45">
            
          <PhoneSvg />
        </div>
        </div>
      <span className="logoName text-sm line-clamp-2">01142044443</span>
    </div>
  )
}

export default AbutePhone
