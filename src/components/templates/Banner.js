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


  useEffect(() => {
    // تابعی که می‌خواهید هنگام تغییر currentImageIndex اجرا شود
    // مثال: 
    const handleChange = () => {
      // کد مربوط به تغییر currentImageIndex
      console.log("currentImageIndex changed:", currentImageIndex);
    };

    // فراخوانی تابع handleChange هنگامی که currentImageIndex تغییر کند
    handleChange();

    // توجه: برای استفاده از currentImageIndex درون این تابع باید آن را به وابستگی اضافه کنید
  }, [currentImageIndex]); // این آرایه وابستگی ها است که تابع باید بر اساس آن اجرا شود

  // بقیه کدهای شما




  const changeImage = (index) => {
    setCurrentImageIndex(index);
    clearInterval(intervalId); // ریست تایمر
    const newInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % 4);
    }, 5000);
    setIntervalId(newInterval); // ذخیره شناسه تایمر جدید
  };

 

  return (
    <header
   
      className={
        currentImageIndex === 0
          ? `overflow-hidden h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/finger.jpg")]`
          : currentImageIndex === 1
          ? `overflow-hidden h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/cake.jpg")]`
          : currentImageIndex === 2
          ? `overflow-hidden h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/header.jpg")]`
          : currentImageIndex === 3
          ? `overflow-hidden h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover bg-[url("../../public/Images/jpg/iphone14.jpg")]`
          : ""
      }

      // className={`h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto bg-no-repeat bg-cover ${currentImageIndex === 0 ? 'banner1' : currentImageIndex === 1 ? 'banner2' : currentImageIndex === 2 ? 'banner3' : 'banner4'}`}
    >
      <HeaderText />
      <div className=" flex items-end justify-center  gap-2 pb-3 p-5 ">
        <div
          onClick={() => changeImage(1)}
          className="rounded-full bg-orange-300 border-orange-300 w-3 h-3 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(2)}
          className="rounded-full bg-orange-300 border-orange-300 w-3 h-3 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(3)}
          className="rounded-full bg-orange-300 border-orange-300 w-3 h-3 border-4  shadow-sm"
        ></div>

        <div
          onClick={() => changeImage(4)}
          className="rounded-full bg-orange-300 border-orange-300 w-3 h-3 border-4  shadow-sm"
        ></div>
      </div>
    </header>
  );
}

export default Banner;
