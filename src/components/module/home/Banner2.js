"use client";
import HeaderText from "@/module/home/HeaderText";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";

function Banner2() {
  return (
    <div>
      <Swiper
        navigation={true}
        autoplay={{ delay: 2000 }}
        modules={[Navigation,Autoplay]}
        className="mySwiper"
      >
        <SwiperSlide>
          <section
            className={` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/finger.jpg")]`}
          >
            <HeaderText />
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section
            className={` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/cake.jpg")]`}
          >
            <HeaderText />
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section
            className={` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/hamberger.jpg")]`}
          >
            <HeaderText />
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section
            className={` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/rolet.jpg")]`}
          >
            <HeaderText />
          </section>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default Banner2;
