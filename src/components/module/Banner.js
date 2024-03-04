"use client";
import HeaderText from "@/module/HeaderText";
import { useState, useEffect } from "react";

function Banner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
 

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
    <section
      className={
        currentImageIndex === 0
          ? ` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/finger.jpg")]`
          : currentImageIndex === 1
          ? ` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/cake.jpg")]`
          : currentImageIndex === 2
          ? ` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/hamberger.jpg")]`
          : currentImageIndex === 3
          ? ` h-[200px] xs:h-auto xs:aspect-[2/1] md:aspect-auto   bg-no-repeat bg-cover bg-center  bg-[url("../../public/Images/jpg/rolet.jpg")]`
          : ""
      }
    >

      <HeaderText />
      <div className=" flex items-end justify-center  gap-2 pb-3 p-5 ">

        <div
          onClick={() => changeImage(0)}
          className="rounded-full bg-orange-300 border-orange-300 w-3 h-3 border-4  shadow-sm"
        ></div>

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
      </div>
    </section>
  );
}

export default Banner;
