"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ShareSvg from "../svgs/ShareSvg";
import EditSvg from "../svgs/EditSvg";
import DeleteSvg from "../svgs/DeleteSvg";

function Banner2() {
  const [banners, setBanners] = useState([]);
  const containerRef = useRef(null);
  const swiperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // مرجع برای منو
  const position = { top: 0, left: 0 };

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("onClick", handleClickOutside);
    return () => {
      document.removeEventListener("onClick", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    axios
      .get("/api/panel/banner")
      .then((response) => {
        setBanners(response.data.banners);
      })
      .catch((error) => {
        console.error("Error fetching banners:", error);
      });
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

  return (
    <div className="relative" ref={containerRef}>
      <Swiper
        ref={swiperRef}
        onSwiper={handleSwiper}
        navigation={true}
        autoplay={{ delay: 2000 }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
        onClick={handleClickOutside}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <section
              className="h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-center"
              style={{ backgroundImage: `url("${banner.imageUrl}")` }}
            >
              <div className="absolute w-[20%] h-[10%] z-[46]">
                <button
                  className="w-full h-full"
                  onClick={(event) => handleMenuToggle(event, banner._id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-[50%] h-[50%] items-start text-zinc-600 dark:text-white shadowLightSvg dark:shadowDarkSvg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="transparent"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </div>

              <div
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
              </div>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
      {isOpen && (
        <div
          className="absolute w-[20%] h-[10%] z-[146]"
          style={{ top: position.top + 30, right: position.left + 60 }}
          ref={menuRef} // اضافه کردن مرجع به منو
        >
          <div className="relative group flex items-center">
            <ul className="relative top-full w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 space-y-4 text-zinc-700 bg-white text-sm md:text-base border-t-[3px] border-t-orange-300 rounded-xl tracking-normal shadow-normal transition-all dark:text-white dark:bg-zinc-700/90 p-6 pt-[21px] child:transition-colors child-hover:text-orange-300">
            <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("ویرایش")}
              >
                <EditSvg />
                <p>ویرایش</p>
              </div>
              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("حذف")}
              >
                <DeleteSvg />
                <p>حذف</p>
              </div>

              <div
                className="cursor-pointer flex gap-2 items-center"
                onClick={() => console.log("ارسال")}
              >
                <ShareSvg />
                <p>ارسال</p>
              </div>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Banner2;
