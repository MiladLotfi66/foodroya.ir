import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import CloseSvg from "@/module/svgs/CloseSvg";
import ArrowUpSvg from "@/module/svgs/ArrowUpSvg";
import usericone from "@/public/Images/jpg/user.webp";
import HeartSvg from "@/module/svgs/HeartSvg";
import DislikeSvg from "@/module/svgs/DislikeSvg";

// import { DevTool } from "@hookform/devtools";

function CommentComponent(isOpen, onClose) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-t-lg shadow-lg overflow-y-auto p-6 ">
        <div className="h-full ">
          {/* <div className=" overflow-y-auto max-h-screen"> */}
            <div className="hidden">
              <CloseSvg />
              <ArrowUpSvg />
              <HeartSvg />
              <DislikeSvg />
            </div>
            {/* /////////////////////title//////////////////////////// */}

            <div className="flex justify-between p-2 md:p-5  h-[10%]">
              <button aria-label="close" className="hover:text-orange-300">
                <svg
                  width="34"
                  height="34"
                  //   onClick={onClose} // Close the modal on click
                >
                  <use href="#CloseSvg"></use>
                </svg>
              </button>

              <h1 className="text-3xl font-MorabbaBold">نظرات</h1>
            </div>
            {/* /////////////////////comment//////////////////////////// */}
           <div className="flex flex-col justify-between h-[90%]">
            <div>
              <div className="flex  items-center justify-between mb-1">
                <div className="flex  items-center">
                  <Image
                    className="rounded-full"
                    src={usericone}
                    // src={user.image || "/default-user.png"}
                    alt="تصویر کاربر"
                    width={20}
                    height={20}
                    quality={30}
                  />
                  <span className="pr-2 mr-1 text-gray-500 text-sm">
                    {" "}
                    میلاد لطفی
                  </span>
                  <span className="pr-2 mr-1 text-gray-500 text-sm"> ۷روز</span>
                </div>

                <div className="flex  items-center">
                  <div className=" p-1 rounded-md">
                    <svg
                      width="24"
                      height="24"
                      //   onClick={onClose} // Close the modal on click
                    >
                      <use href="#DislikeSvg"></use>
                    </svg>
                  </div>
                  <div className=" p-1 rounded-md">
                    <svg
                      width="24"
                      height="24"
                      //   onClick={onClose} // Close the modal on click
                    >
                      <use href="#HeartSvg"></use>
                    </svg>
                  </div>
                </div>
              </div>
              <span className="text-sm lg:text-base line-clamp-2 text-wrap">
                این یک متن تستی است برای تست کامنت این یک متن تستی است برای تست
                کامنت این یک متن تستی است برای تست کامنت این یک متن تستی است
                برای تست کامنتها
              </span>

              <div className="flex items-center justify-between m-2 ">
                <span className="text-gray-500 text-sm">پاسخ دادن</span>
                <span className="bg-gray-500 h-1 w-10"></span>
                <span className="text-gray-500 text-sm">دیدن سایر پاسخ ها</span>
              </div>
            </div>
            {/* /////////////////////newcomment//////////////////////////// */}

            <div className="flex w-full ">
              <Image
                className="rounded-full w-[10%]"
                src={usericone}
                // src={user.image || "/default-user.png"}
                alt="تصویر کاربر"
                width={30}
                height={30}
                quality={60}
              />
              <input className="pr-2 mr-1 w-[80%]" placeholder="افزودن نظر ..."></input>
              <div className="bg-blue-400 p-1 rounded-md w-[10%]">
                <svg
                  width="34"
                  height="34"
                  //   onClick={onClose} // Close the modal on click
                >
                  <use href="#ArrowUpSvg"></use>
                </svg>
              </div>
            </div>
            </div>
          </div>

          <Toaster />
        </div>
      </div>
    // </div>
  );
}

export default CommentComponent;
