"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { Navigation } from "swiper/modules";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
// import ThreeDotsMenu from "../minicomponents/ThreeDotsMenu";
import { useDispatch } from "react-redux";
import { openRightMenu, closeRightMenu } from "src/Redux/features/mobileMenu/mobileMenuSlice";

function Banner2() {
  const [banners, setBanners] = useState([]);
  const containerRef = useRef(null);
  const dispatch = useDispatch();

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
        dispatch(closeRightMenu());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

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
    edit: EditHandler,
    delete: DeleteHandler,
    send: SendHandler,
  };

  const handleMenuToggle = (event, bannerId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };

    dispatch(openRightMenu({ position, itemId: bannerId, menuItems }));
  };

  const handleMenuClose = () => {
    dispatch(closeRightMenu());
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
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="transparent" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
              </div>

              <div className="h-[100%] flex justify-end items-center md:min-h-[93vh]" style={{ color: banner.BannerTextColor }}>
                <div>
                  <span className="font-MorabbaBold text-2xl md:text-5xl ">{banner.BannerBigTitle}</span>
                  <p className="font-MorabbaLight text-xl md:text-5xl md:mt-2 ">{banner.BannersmallDiscription}</p>
                  <span className="block bg-orange-300 w-[100px] h-px md:h-0.5 my-2 md:my-8 "></span>
                  <p className="max-w-[201px] md:max-w-[460px] text-xs md:text-2xl ">{banner.BannerDiscription}</p>
                </div>
              </div>
            </section>
            {/* <ThreeDotsMenu menuActions={menuActions} onClose={handleMenuClose} /> */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Banner2;
