"use client";
import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import Image from "next/image";
import UserPlus from "@/module/svgs/UserPlus";
import CommentSvg from "@/module/svgs/CommentSvg";
import {

  followShopServerAction,
  unfollowShopServerAction,
  
} from "@/components/signinAndLogin/Actions/ShopServerActions";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import CommentComponent from "../comment/CommentComponent";

function ShopCard({
  Shop,
  editfunction,
  editable,
  followable,
  user,
  deleteFunc,
  handleEnableShop,
  handleDisableShop,
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentList , setCommetList]=useState([])

  useEffect(() => {
    // بررسی وضعیت فالو در زمان بارگذاری
    if (user && Shop) {
      const followedShop = user.following.includes(Shop._id);
      setIsFollowing(followedShop);
    }
  }, [user, Shop]);

    // تابع بستن کامپوننت کامنت
    function handleClose() {
      setIsCommentOpen(false);
    }
  const followFunc = async () => {
    try {
      const res = await followShopServerAction(Shop._id);
      if (res.status === 200 || res.status === 201) {
        toast.success("فروشگاه با موفقیت دنبال شد");
        setIsFollowing(true);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("خطا در دنبال کردن فروشگاه:", error);
    }
  };

  const unfollowFunc = async () => {
    try {
      const res = await unfollowShopServerAction(Shop._id);
      if (res.status === 200 || res.status === 201) {
        toast.success("فروشگاه با موفقیت از دنبال‌شدگان حذف شد");
        setIsFollowing(false);

        // socket.emit("unfollowShop", Shop._id); // ارسال رویداد لغو فالو به سرور
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("خطا در لغو دنبال کردن فروشگاه:", error);
    }
  };

  const handleComment =  () => {
    setIsCommentOpen(!isCommentOpen);
    }
  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center h-[150px] md:h-[300px] w-full rounded-lg"
      style={{ backgroundImage: `url("${Shop.BackGroundShopUrl}")` }}
    >
      {!Shop.ShopStatus && (
        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
      )}
           {isCommentOpen && (
        <CommentComponent
          isOpen={isCommentOpen}
          onClose={handleClose}
          referenceId={Shop._id} // ارسال لیست کامنت‌ها به کامپوننت
          type={"shop"} // ارسال لیست کامنت‌ها به کامپوننت

        />
      )}
      <div className="hidden">
        <DeleteSvg />
        <EditSvg />
        <ShareSvg />
        <EyeSvg />
        <EyeslashSvg />
        <UserPlus />
        <CommentSvg />
      </div>
      <div className="absolute top-2 flex gap-2 right-2 z-20 p-2">
        <div
          className={
            editable
              ? "flex items-center gap-2 child-hover:text-orange-300"
              : "hidden"
          }
        >
          {/* ///////////////////////////delete icone////////////////////////////////// */}
          <svg
            width="34"
            height="34"
            className=" cursor-pointer "
            aria-label="delete"
            onClick={() => deleteFunc(Shop._id)}
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
          <svg
            width="34"
            height="34"
            className=" cursor-pointer"
            aria-label="share"
          >
            <use href="#ShareSvg"></use>
          </svg>
          {/* ///////////////////////////enable disable icone////////////////////////////////// */}

          {!Shop.ShopStatus && (
            <svg
              width="34"
              height="34"
              className=" cursor-pointer"
              aria-label="enable"
              onClick={() => handleEnableShop(Shop._id)}
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
              onClick={() => handleDisableShop(Shop._id)}
            >
              <use href="#EyeslashSvg"></use>
            </svg>
          )}
         
        </div>
        {/* ///////////////////////////follow icone////////////////////////////////// */}
        {followable && (
          <div className="flex gap-1">
          <div
            onClick={isFollowing ? unfollowFunc : followFunc}
            className={`flexCenter bg-opacity-60 cursor-pointer flex-row text-center px-2  rounded-md ${
              isFollowing
                ? "bg-gray-500 border-gray-500"
                : "bg-blue-500 border-blue-500"
            } hover:border-orange-300 hover:text-orange-300`}
          >
            <p className="pl-2">{isFollowing ? "دنبال نکردن" : "دنبال کردن"}</p>
            <svg
              width="34"
              height="34"
              className="cursor-pointer"
              aria-label={isFollowing ? "unfollow" : "follow"}
            >
              <use href="#UserPlus"></use>
            </svg>
          </div>
         </div>
        )}
         <svg
           width="34"
           height="34"
           className="cursor-pointer"
           aria-label="comment"
           onClick={() => handleComment(Shop._id)}
         >
           <use href="#CommentSvg"></use>
         </svg>
      </div>
      <div className="absolute bottom-2 left-2 z-20 p-2">
        <div
          className="bg-white
 bg-opacity-50 dark:bg-zinc-700 dark:bg-opacity-50 rounded-md p-3"
        >
          <div className="flex">
            <Image
              className="rounded-full"
              src={Shop.LogoUrl}
              alt="Shop logo"
              width={30}
              height={30}
              quality={30}
              style={{ objectFit: "cover" }} // استفاده از objectFit برای تنظیم تناسب تصویر
            />

            <span className="font-MorabbaBold text-sm md:text-xl">
              {Shop.ShopName}
            </span>
          </div>
          <p className="font-MorabbaLight text-xs md:text-lg mt-1">
            {Shop.ShopSmallDiscription}
          </p>
          <span className="block bg-orange-300 w-[25px] h-px md:w-[50px] md:h-0.5 my-1 md:my-2"></span>
          <p
            className="text-zinc-700 dark:text-white font-DanaMedium text-xs md:text-sm  line-clamp-2 text-wrap max-w-80"
            // className="max-w-[100px] md:max-w-[200px] "
          >
            {Shop.ShopDiscription}
          </p>
          <h3 className="font-IranSans my-2 text-sm md:text-xl text-center child-hover:text-orange-300 truncate max-w-80 ltr">
            <Link href={`/${Shop.ShopUniqueName}`}>@{Shop.ShopUniqueName}</Link>
          </h3>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default ShopCard;
