"use client";

import React, { useState, useEffect } from "react";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EditSvg from "@/module/svgs/EditSvg";
import ShareSvg from "@/module/svgs/ShareSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import CommentSvg from "@/module/svgs/CommentSvg";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import CommentComponent from "../comment/CommentComponent";
import {
  followShopServerAction,
  unfollowShopServerAction,
} from "@/templates/Shop/ShopServerActions";

function ShopCard({
  Shop,
  editfunction,
  editable,
  followable,
  user,
  userHasPermissionForEditShop,
  deleteFunc,
  handleEnableShop,
  handleDisableShop,
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

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
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("خطا در لغو دنبال کردن فروشگاه:", error);
    }
  };

  const handleComment = () => {
    setIsCommentOpen(!isCommentOpen);
  };

  return (
    <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* بخش تصویر */}
      <div
        className="relative h-48 bg-gray-100"
        style={{ backgroundImage: `url("${Shop.BackGroundShopUrl}")` }}
      >
        <Image
          src={Shop.BackGroundShopUrl}
          alt={`${Shop.ShopName} Background`}
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />

        {/* وضعیت غیرفعال */}
        {!Shop.ShopStatus && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">غیرفعال</span>
          </div>
        )}

        {/* دکمه‌های اقدام در بالای تصویر */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center px-2">
          <div className="flex gap-2">
            {editable && (
              <button
                onClick={() => deleteFunc(Shop._id)}
                className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
                title="حذف"
              >
                <DeleteSvg className="w-5 h-5 text-red-600" />
              </button>
            )}
            {editable && (
              <button
                onClick={editfunction}
                className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
                title="ویرایش"
              >
                <EditSvg className="w-5 h-5 text-blue-600" />
              </button>
            )}
            {editable && (
              <button
                className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
                title="اشتراک‌گذاری"
              >
                <ShareSvg className="w-5 h-5 text-green-600" />
              </button>
            )}
            {editable && (
              <button
                onClick={
                  Shop.ShopStatus ? () => handleDisableShop(Shop._id) : () => handleEnableShop(Shop._id)
                }
                className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
                title={Shop.ShopStatus ? "غیرفعال کردن" : "فعال کردن"}
              >
                {Shop.ShopStatus ? (
                  <EyeslashSvg className="w-5 h-5 text-gray-700" />
                ) : (
                  <EyeSvg className="w-5 h-5 text-gray-700" />
                )}
              </button>
            )}
          </div>

          {/* دکمه فالو/آنفالو */}
          {followable && (
            <button
              onClick={isFollowing ? unfollowFunc : followFunc}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                isFollowing
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              title={isFollowing ? "دنبال نکردن" : "دنبال کردن"}
            >
              {isFollowing ? "دنبال نکردن" : "دنبال کردن"}
              <UserPlus />
            </button>
          )}

          {/* دکمه کامنت */}
          <button
            className="p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 rounded-full shadow dark:shadow-gray-900"
            aria-label="comment"
            onClick={handleComment}
            title="افزودن نظر"
          >
            <CommentSvg className="w-5 h-5 text-yellow-600" />
          </button>
        </div>
      </div>

      {/* بخش اطلاعات فروشگاه در زیر تصویر */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <Image
            className="rounded-full"
            src={Shop.LogoUrl}
            alt={`${Shop.ShopName} Logo`}
            width={50}
            height={50}
            quality={50}
            objectFit="cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {Shop.ShopName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {Shop.ShopSmallDiscription}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-gray-700 dark:text-gray-200">
            {Shop.ShopDiscription}
          </p>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-blue-500 hover:underline">
            <Link href={`/${Shop._id}`}>@{Shop.ShopUniqueName}</Link>
          </h3>
        </div>
      </div>

      {/* کامپوننت کامنت */}
      {isCommentOpen && (
        <CommentComponent
          isOpen={isCommentOpen}
          onClose={handleClose}
          referenceId={Shop._id}
          type={"shop"}
        />
      )}

      {/* نمایش توستر */}
      <Toaster />
    </div>
  );
}

export default ShopCard;
