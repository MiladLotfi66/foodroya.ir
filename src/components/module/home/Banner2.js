"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import axios from "axios";
import ThreeDotsMenu from "../minicomponents/ThreeDotsMenu";

function Banner2() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // درخواست به سمت سرور برای دریافت اطلاعات بنرها
    axios
      .get("/api/panel/banner")
      .then((response) => {
        setBanners(response.data.banners); // تنظیم داده‌های دریافت شده برای نمایش در Swiper
      })
      .catch((error) => {
        console.error("Error fetching banners:", error);
      });
  }, []); // اجرای این درخواست تنها یک بار هنگام بارگذاری کامپوننت

  
  return (
    <div className="relative">

      <Swiper
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
                          <ThreeDotsMenu  />

              <div
                className=" h-[100%] flex justify-end items-center  md:min-h-[93vh]  "
                style={{ color: banner.BannerTextColor }}
              >
                <div>
                  <span className="font-MorabbaBold text-2xl md:text-5xl ">
                    {banner.BannerBigTitle}
                  </span>
                  <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">
                    {banner.BannersmallDiscription}
                  </p>
                  <span className=" block bg-orange-300  w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
                  <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">
                    {banner.BannerDiscription}
                  </p>
                </div>
              </div>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Banner2;
