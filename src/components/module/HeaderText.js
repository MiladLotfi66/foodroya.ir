function HeaderText() {
  return (
    <div className="container h-full flex justify-end items-center  md:min-h-screen  text-white">
      <div >
        <span className="font-MorabbaBold text-2xl md:text-5xl ">
          انواع کیک و شیرینی های تازه
        </span>
        <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">
          تازگی را بچشید
        </p>
        <span className=" block bg-orange-300  w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
        <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">
          کیک و شیرینی های خانگی که با مواد درجه یک و تازه پخته می شوند را با ما
          تجربه کنید
        </p>
      </div>
    </div>
  );
}

export default HeaderText;
