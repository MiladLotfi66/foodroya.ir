"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import EditSvg from "../svgs/EditSvg";
import DeleteSvg from "../svgs/DeleteSvg";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';

import Link from "next/link";
import { GetAllEnableBanners,  BannerServerEnableActions,
  BannerServerDisableActions,
  DeleteBanners, } from "@/components/signinAndLogin/Actions/BannerServerActions";
import EyeSvg from "../svgs/EyeSvg";
import EyeslashSvg from "../svgs/EyeslashSvg";
import SettingSvg from "../svgs/SettingSvg";



function Banner2() {
  const router=useRouter();

  const params = useParams();
  const { shopUniqName} = params;

  const [banners, setBanners] = useState([]);
  const swiperRef = useRef(null);

   useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await GetAllEnableBanners(shopUniqName);
        setBanners(response.banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();

  }, []);



  const handleSwiper = (swiper) => {
    swiperRef.current = swiper;
  };


  return (
    <div className="relative" >
       <div className="hidden">
        <DeleteSvg />
        <EditSvg />
        <EyeSvg />
        <EyeslashSvg />
        <SettingSvg/>
      </div>
      <Swiper
        ref={swiperRef}
        onSwiper={handleSwiper}
        navigation={true}
        autoplay={{ delay: 5000 }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
      >
        {banners.map((banner, index) => (

          <SwiperSlide key={index}>

            
            <section
              className="h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-center"
              style={{ backgroundImage: `url("${banner.imageUrl}")` }}
              
            >
            
              {/* /////////////////////دکمه ها/////////////// */}
              <div className="flex items-center gap-2 child-hover:text-orange-300">
              <svg
            width="34"
            height="34"
            className=" cursor-pointer "
        aria-label="setting"
            onClick={async () => router.push("/panel/banners/bannerManage")}
          >
            <use href="#SettingSvg"></use>
          </svg>
          <svg
            width="34"
            height="34"
            className=" cursor-pointer "
            aria-label="delete"

            onClick={async () => {
              try {
                await DeleteBanners(banner._id);
                window.location.reload();
              } catch (error) {
                console.error("خطا در حذف بنر:", error);
              }
            }}
          >
            <use href="#DeleteSvg"></use>
          </svg>
             

          {!banner.BannerStatus && (
            <svg
              width="34"
              height="34"
              className=" cursor-pointer"
              aria-label="enable"

              onClick={    async () => {
              try {
                await BannerServerEnableActions(banner._id);
                window.location.reload();
              } catch (error) {
                console.error("خطا در فعال‌سازی بنر:", error);
              }
            }}
            >
              <use href="#EyeSvg"></use>
            </svg>
          )}
          {banner.BannerStatus && (
            <svg
              width="34"
              height="34"
              className=" cursor-pointer"
              aria-label="disable"

              onClick={async () => {
                try {
                  await BannerServerDisableActions(banner._id);
                  window.location.reload();
                } catch (error) {
                  console.error("خطا در غیرفعال‌سازی بنر:", error);
                }
              }}
            >
              <use href="#EyeslashSvg"></use>
            </svg>
          )}
        </div>
              {/* ///////////////////////////////// */}

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
   

    </div>
  );
}

export default Banner2;
