"use client";
import HeaderText from "@/module/home/HeaderText";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";

function Banner2() {
  return (
    <div className="block">
      <Swiper
        navigation={true}
        autoplay={{ delay: 2000 }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
      >
        <SwiperSlide>
          <section
            className={`h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/finger.jpg")]`}
          >
            <div className=" h-[100%] flex justify-end items-center  md:min-h-[93vh]  text-white">
              <div>
                <span className="font-MorabbaBold text-2xl md:text-5xl ">
                  انواع کیک و شیرینی های تازه
                </span>
                <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">
                  تازگی را بچشید
                </p>
                <span className=" block bg-orange-300  w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
                <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">
                  کیک و شیرینی های خانگی که با مواد درجه یک و تازه پخته می شوند
                  را با ما تجربه کنید
                </p>
              </div>
            </div>
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
