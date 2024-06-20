"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ThreeDotsMenu from "../minicomponents/ThreeDotsMenu";

function Banner2() {
  const [banners, setBanners] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const containerRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const EditHandler = (bannerId) => {
    console.log(`Editing banner with id: ${bannerId}`);
  };

  const DeleteHandler = (bannerId) => {
    console.log(`Deleting banner with id: ${bannerId}`);
  };

  const SendHandler = (bannerId) => {
    console.log(`Sending banner with id: ${bannerId}`);
  };

  const menuItems = [
    { label: 'ویرایش', action: 'edit' },
    { label: 'حذف', action: 'delete' },
    { label: 'ارسال', action: 'send' }
  ];

  const menuActions = {
    edit: (id) => EditHandler(id),
    delete: (id) => DeleteHandler(id),
    send: (id) => SendHandler(id),
  };

  const handleMenuToggle = (bannerId) => {
    setOpenMenuId(openMenuId === bannerId ? null : bannerId);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Swiper
        navigation={true}
        autoplay={{ delay: 2000 }}
        modules={[Navigation, Autoplay]}
        className="mySwiper"
        onClick={handleMenuClose}
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <section
              className="h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-center"
              style={{ backgroundImage: `url("${banner.imageUrl}")` }}
            >
              <ThreeDotsMenu
                bannerId={banner._id}
                menuItems={menuItems}
                menuActions={menuActions}
                isOpen={openMenuId === banner._id}
                onClose={handleMenuClose}
                onToggle={handleMenuToggle}
              />
              <div className="h-[100%] flex justify-end items-center md:min-h-[93vh]" style={{ color: banner.BannerTextColor }}>
                <div>
                  <span className="font-MorabbaBold text-2xl md:text-5xl ">{banner.BannerBigTitle}</span>
                  <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">{banner.BannersmallDiscription}</p>
                  <span className="block bg-orange-300 w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
                  <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">{banner.BannerDiscription}</p>
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
