"use client";
import React from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import {
  BannerServerEnableActions,
  BannerServerDisableActions,
  DeleteBanners,
} from "@/components/signinAndLogin/Actions/BannerServerActions";

function BannerCard({ banner, editfunction }) {
  const enableFunc = async () => {
    try {
      await BannerServerEnableActions(banner._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در فعال‌سازی بنر:", error);
    }
  };

  const disableFunc = async () => {
    try {
      await BannerServerDisableActions(banner._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی بنر:", error);
    }
  };

  const deleteFunc = async () => {
    try {
      await DeleteBanners(banner._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در حذف بنر:", error);
    }
  };

  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center h-[150px] md:h-[300px] w-full rounded-lg"
      style={{ backgroundImage: `url("${banner.imageUrl}")` }}
    >
      {!banner.BannerStatus && (
        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
      )}
      <div className="hidden">
        <DeleteSvg />
        <EditSvg />
        <ShareSvg />
        <EyeSvg />
        <EyeslashSvg />
      </div>
      <div className="absolute top-2 right-2 z-20 p-2">
        <div className="flex items-center gap-2 child-hover:text-orange-300">
          {/* ///////////////////////////delete icone////////////////////////////////// */}
            <svg
              width="34"
              height="34"
              className=" cursor-pointer "
              aria-label="delete"
              onClick={deleteFunc}
            >
              <use href="#DeleteSvg"></use>
            </svg>
          {/* ///////////////////////////edit icone////////////////////////////////// */}

            <svg
              width="34"
              height="34"
              className=" cursor-pointer"
              aria-label="edit"
              onClick={editfunction}
            >
              <use href="#EditSvg"></use>
            </svg>
          {/* ///////////////////////////share icone////////////////////////////////// */}
            <svg width="34" height="34" className=" cursor-pointer" aria-label="share">
              <use href="#ShareSvg"></use>
            </svg>
          {/* ///////////////////////////enable disable icone////////////////////////////////// */}

          {!banner.BannerStatus && (
              <svg
                width="34"
                height="34"
                className=" cursor-pointer"
                aria-label="enable"
                onClick={enableFunc}
              >
                <use href="#EyeSvg"></use>
              </svg>
          )}
          {banner.BannerStatus && (
              <svg
                width="34"
                height="34"
                className=" cursor-pointer"
                aria-label="disable"
                onClick={disableFunc}
              >
                <use href="#EyeslashSvg"></use>
              </svg>
          )}
        </div>
      </div>
      <div
        className="absolute bottom-2 left-2 z-20 p-2"
        style={{ color: banner.BannerTextColor }}
      >
        <div>
          <span className="font-MorabbaBold text-sm md:text-xl">
            {banner.BannerBigTitle}
          </span>
          <p className="font-MorabbaLight text-xs md:text-lg mt-1">
            {banner.BannersmallDiscription}
          </p>
          <span className="block bg-orange-300 w-[25px] h-px md:w-[50px] md:h-0.5 my-1 md:my-2"></span>
          <p className="max-w-[100px] md:max-w-[200px] text-xs md:text-sm">
            {banner.BannerDiscription}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BannerCard;
