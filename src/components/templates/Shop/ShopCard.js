"use client";
import React from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import Image from "next/image";

import { ShopServerDisableActions,ShopServerEnableActions,DeleteShops } from "@/components/signinAndLogin/Actions/ShopServerActions";

function ShopCard({ Shop, editfunction }) {
  const enableFunc = async () => {
    try {
      await ShopServerEnableActions(Shop._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در فعال‌سازی بنر:", error);
    }
  };

  const disableFunc = async () => {
    try {
      await ShopServerDisableActions(Shop._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در غیرفعال‌سازی بنر:", error);
    }
  };

  const deleteFunc = async () => {
    try {
      await DeleteShops(Shop._id);
      window.location.reload();
    } catch (error) {
      console.error("خطا در حذف بنر:", error);
    }
  };

  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center h-[150px] md:h-[300px] w-full rounded-lg"
      style={{ backgroundImage: `url("${Shop.BackGroundShopUrl}")` }}
    >
      {!Shop.ShopStatus && (
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

          {!Shop.ShopStatus && (
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
          {Shop.ShopStatus && (
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
        // style={{ color: Shop.BannerTextColor }}
      >
        <div className="bg-black bg-opacity-50 rounded-md p-3">
       <div className="flex">
        <Image
        className="rounded-full"
        src={Shop.LogoUrl}
        alt="Shop logo"
        width={30}
        height={30}
        quality={30}

      />
          <span className="font-MorabbaBold text-sm md:text-xl">
            {Shop.ShopName}
          </span>
          </div>
          <p className="font-MorabbaLight text-xs md:text-lg mt-1">
            {Shop.ShopSmallDiscription}
          </p>
          <span className="block bg-orange-300 w-[25px] h-px md:w-[50px] md:h-0.5 my-1 md:my-2"></span>
          <p className="text-zinc-700 dark:text-white font-DanaMedium text-xs md:text-sm  line-clamp-2 text-wrap  "
          // className="max-w-[100px] md:max-w-[200px] "
          >
            {Shop.ShopDiscription}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShopCard;
