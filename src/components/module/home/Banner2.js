"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import ShareSvg from "../svgs/ShareSvg";
import EditSvg from "../svgs/EditSvg";
import DeleteSvg from "../svgs/DeleteSvg";
import Threedot from "../svgs/threedot";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GetAllEnableBanners } from "@/components/signinAndLogin/Actions/BannerServerActions";


function Banner2() {
  const router=useRouter();
  const [banners, setBanners] = useState([]);
  const [bannerID, setBannerID] = useState();
  const swiperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // مرجع برای منو
  const position = { top: 0, left: 0 };

  const handleMenuToggle = (event ,id) => {
    setBannerID(id)
    setIsOpen(!isOpen);
  };

   useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await GetAllEnableBanners();
        setBanners(response.banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
    // axios
    // .get("/api/panel/banner?BannerStatus=active") // ارسال پارامتر status=active به عنوان فیلتر بر روی وضعیت بنرها
    // .then((response) => {
    //     setBanners(response.data.banners);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching banners:", error);
    //   });
  }, []);

  useEffect(() => {
    if (swiperRef.current) {
      if (isOpen) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
    }
  }, [isOpen]);

  const handleSwiper = (swiper) => {
    swiperRef.current = swiper;
  };

  const editHandler = (id) => {
router.push(`/panel/addbanner/edit/${id}`);

  }
    const deleteHandler = (id) => {
router.push(`/panel/addbanner/delete${id}`);

  }  
    const shareHandler = (id) => {
router.push(`/panel/addbanner/share${id}`);

  }

  return (
    <div className="relative" >
      <Swiper
        ref={swiperRef}
        onSwiper={handleSwiper}
        navigation={true}
        autoplay={{ delay: 2000 }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
      >
        {banners.map((banner, index) => (

          <SwiperSlide key={index}>

            
            <section
              className="h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-center"
              style={{ backgroundImage: `url("${banner.imageUrl}")` }}
              
            >
              <div className="absolute  w-4 h-4 md:w-8 md:h-8 z-[46] p-2">
                <button
                  aria-label="banner Menu Button"
                  onClick={(event) => handleMenuToggle(event, banner._id)}
                >
                 <Threedot/>
                </button>
              </div>

              <Link href={banner.BannerLink || "#"}
                className="h-[100%] flex justify-end items-center md:min-h-[93vh]"
                style={{ color: banner.BannerTextColor }}
              >
                <div>
                  <span className="font-MorabbaBold text-2xl md:text-5xl ">
                    {banner.BannerBigTitle}
                  </span>
                  <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">
                    {banner.BannersmallDiscription}
                  </p>
                  <span className="block bg-orange-300 w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
                  <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">
                    {banner.BannerDiscription}
                  </p>
                </div>
              </Link>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
      {isOpen && (
           <>
                  {/* لایه شفاف */}
                  <div
                  className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-[145]"
                  onClick={() => setIsOpen(false)} // بستن منو با کلیک بر روی لایه شفاف
                ></div>

        <div
          className="absolute w-[20%] h-[10%] z-[146]"
          style={{ top: position.top + 30, right: position.left + 60 }}
          ref={menuRef} // اضافه کردن مرجع به منو
        >

          <div className="relative group flex items-center">
            <ul className="relative top-full w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 space-y-4 text-zinc-700 bg-white text-sm md:text-base border-t-[3px] border-t-orange-300 rounded-xl tracking-normal shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 p-6 pt-[21px] child:transition-colors child-hover:text-orange-300">
              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => editHandler(bannerID)}
              >
                <EditSvg />
                <p>ویرایش</p>
              </div>
              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => deleteHandler(bannerID)}
              >
                <DeleteSvg />
                <p>حذف</p>
              </div>

              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => shareHandler(bannerID)}
              >
                <ShareSvg />
                <p>ارسال</p>
              </div>
            </ul>
          </div>
        </div>
        </>
      )}

    </div>
  );
}

export default Banner2;
