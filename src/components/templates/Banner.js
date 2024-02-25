"use client";
import HeaderText from "@/module/HeaderText";
import { useState, useEffect } from "react";

function Banner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 5000); // فاصله زمانی بین تصاویر (5 ثانیه)
    setIntervalId(interval);
    return () => clearInterval(interval);
  }, []);

  const changeImage = (index) => {
    setCurrentImageIndex(index);
    clearInterval(intervalId); // ریست تایمر
    const newInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 5000);
    setIntervalId(newInterval); // ذخیره شناسه تایمر جدید
  };

  const handleMouseDown = (event) => {
    setStartX(event.clientX);
  };

  const handleMouseUp = (event) => {
    setEndX(event.clientX);
    if (endX - startX > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 4);
    } else if (startX - endX > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + 4) % 4);
    }
    clearInterval(intervalId);
  };

  return (
    <header
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={
        currentImageIndex === 0
          ? `relative h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/finger.jpg")]`
          : currentImageIndex === 1
          ? `relative h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/cake.jpg")]`
          : currentImageIndex === 2
          ? `relative h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/header.jpg")]`
          : currentImageIndex === 3
          ? `relative h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/iphone14.jpg")]`
          : ""
      }

      // className={`h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover ${currentImageIndex === 0 ? 'banner1' : currentImageIndex === 1 ? 'banner2' : currentImageIndex === 2 ? 'banner3' : 'banner4'}`}
    >
      <div className="absolute flex items-end justify-center w-screen h-screen gap-2 pb-4 p-5 ">
        <div
          onClick={() => changeImage(1)}
          className="rounded-full bg-orange-300 border-orange-300 w-4 h-4 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(2)}
          className="rounded-full bg-orange-300 border-orange-300 w-4 h-4 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(3)}
          className="rounded-full bg-orange-300 border-orange-300 w-4 h-4 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(4)}
          className="rounded-full bg-orange-300 border-orange-300 w-4 h-4 border-4  shadow-sm"
        ></div>
      </div>
      <HeaderText />
    </header>
  );
}

export default Banner;
