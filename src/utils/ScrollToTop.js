"use client";
import { useEffect, useState } from "react";
import ChevronDown from "@/module/svgs/ChevronDown";
import styles from "@/styles/ScrollToTop.module.css";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      window.scrollY > 120 ? setIsVisible(true) : setIsVisible(false);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    isVisible &&
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
  };

  return (
    <button
      className={isVisible ? styles.buttonVisible : styles.button}
      onClick={scrollToTop}
    >
      <div className="rotate-180">
        <ChevronDown />
      </div>
    </button>
  );
};

export default ScrollToTop;
