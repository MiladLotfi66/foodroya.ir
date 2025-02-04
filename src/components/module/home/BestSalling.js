"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import ProductCard from "./ProductCard";

function BestSalling() {
  return (
    <div data-aos='fade-up' className="container  mb-9 md:mb-20">
      <div className="container flex items-end justify-between">
        <div>
          <h3 className="section_title">پر فروش ترین ها</h3>
          <h3 className="section_Sub_title">مختص شکمو ها</h3>
        </div>
      </div>

      <Swiper
        // install Swiper modules
        modules={[Autoplay]}
        spaceBetween={14}
        slidesPerView={2}
        autoplay={{ delay: 2000 }}
        // navigation
        // pagination={{ clickable: true }}
        // scrollbar={{ draggable: true }}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 14,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
      >
        <SwiperSlide>
          <ProductCard  />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default BestSalling;
