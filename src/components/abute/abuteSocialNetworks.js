"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import telegram from "@/public/Images/jpg/telegram.jpeg";
import insta from "@/public/Images/jpg/instagram.jpeg";
import email from "@/public/Images/jpg/email.jpg";
import twiter from "@/public/Images/jpg/twiter.jpeg";
import Whatsapp from "@/public/Images/jpg/Whatsapp.jpeg";
import Link from "next/link";
import Image from "next/image";


function AbuteSocialNetworks() {
  return (
    <div data-aos="fade-up" className="container  my-9 md:my-20">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="section_title mb-5">شبکه های اجتماعی</h3>
        </div>
      </div>

      <Swiper
        // install Swiper modules
        modules={[Autoplay]}
        spaceBetween={14}
        slidesPerView={5}
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
          <Link
            href="#"
            className="w-25 block md:w-50  text-center cursor-pointer"
          >
            <Image
              className=" mb-2.5 rounded-full"
              src={telegram}
              alt="signalmobile procuct"
              width={50}
              height={50}
              quality={80}
              priority={true}
            />
          </Link>{" "}
        </SwiperSlide>
        <SwiperSlide>
          <Link
            href="#"
            className="w-25 block md:w-50  text-center cursor-pointer"
          >
            <Image
              className=" mb-2.5 rounded-full"
              src={insta}
              alt="signalmobile procuct"
              width={50}
              height={50}
              quality={80}
              priority={true}
            />
          </Link>{" "}
        </SwiperSlide>
        <SwiperSlide>
          <Link
            href="#"
            className="w-25 block md:w-50  text-center cursor-pointer"
          >
            <Image
              className=" mb-2.5 rounded-full"
              src={email}
              alt="signalmobile procuct"
              width={50}
              height={50}
              quality={80}
              priority={true}
            />
          </Link>{" "}
        </SwiperSlide>
        <SwiperSlide>
          <Link
            href="#"
            className="w-25 block md:w-50  text-center cursor-pointer"
          >
            <Image
              className=" mb-2.5 rounded-full"
              src={twiter}
              alt="signalmobile procuct"
              width={50}
              height={50}
              quality={80}
              priority={true}
            />
          </Link>
        </SwiperSlide>
        <SwiperSlide>
          <Link
            href="#"
            className="w-25 block md:w-50  text-center cursor-pointer"
          >
            <Image
              className=" mb-2.5 rounded-full"
              src={Whatsapp}
              alt="signalmobile procuct"
              width={50}
              height={50}
              quality={80}
              priority={true}
            />
          </Link>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default AbuteSocialNetworks;
