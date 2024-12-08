'use client';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

import Link from "next/link";

import { GetAllEnableBanners } from "@/templates/panel/Banner/BannerServerActions";

function Banner2() {
  const router = useRouter();
  const params = useParams();
  const { ShopId } = params;

  const [banners, setBanners] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await GetAllEnableBanners(ShopId);
        setBanners(response.banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    if (ShopId) { // بررسی وجود ShopId قبل از فراخوانی
      fetchBanners();
    }
  }, [ShopId]); // افزودن ShopId به آرایه dependencies

  const handleSwiper = (swiper) => {
    swiperRef.current = swiper;
  };

  return (
    <div className="relative">
  
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
              
              {/* ///////////////////////////////// */}

              <Link
                href={banner.BannerLink || "#"}
                className="h-[100%] flex justify-end items-center md:min-h-[93vh]"
                style={{ color: banner.BannerTextColor }}
              >
                <div>
                  <span className="font-MorabbaBold text-2xl md:text-5xl">
                    {banner.BannerBigTitle}
                  </span>
                  <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2">
                    {banner.BannersmallDiscription}
                  </p>
                  <span className="block bg-orange-300 w-[100px] h-px md:h-0.5 my-2 md:my-8"></span>
                  <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl">
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
