"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/formTemplate";
import BannerCard from "./BannerCard";
import { GetAllBanners } from "@/components/signinAndLogin/Actions/BannerServerActions";
import AddBanner from "./AddBanner";

function BannerManage() {
  const [banners, setBanners] = useState([]);
  const [isOpenAddBanner, setIsOpenAddBanner] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null); // افزودن استیت جدید

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await GetAllBanners();
        setBanners(response.banners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddBanner(false);
      setSelectedBanner(null);
      setSelectedBannerFile(null); // ریست کردن فایل بنر
    }
  };

  const handleEditClick = (banner) => {
    setSelectedBanner(banner);
    setSelectedBannerFile(null); // ریست کردن فایل بنر در حالت ویرایش
    setIsOpenAddBanner(true);
  };

  const handleAddBannerClick = () => {
    setIsOpenAddBanner(true);
    setSelectedBanner(null);
    setSelectedBannerFile(null); // ریست کردن فایل بنر در حالت افزودن جدید
  };

  const handleCloseModal = () => {
    setIsOpenAddBanner(false);
    setSelectedBanner(null);
    setSelectedBannerFile(null);
  };

  const handleSubmit = async (formData, bannerId) => {
    console.log("addbaner run");
    try {
      const formDataObj = new FormData();
      formDataObj.append("BannerImage", formData.BannerImage);
      formDataObj.append("BannerBigTitle", formData.BannerBigTitle);
      formDataObj.append("BannersmallDiscription",formData.BannersmallDiscription);
      formDataObj.append("BannerDiscription", formData.BannerDiscription);
      formDataObj.append("BannerStep", formData.BannerStep);
      formDataObj.append("BannerTextColor", formData.BannerTextColor);
      formDataObj.append("BannerStatus", formData.BannerStatus);
      formDataObj.append("BannerLink", formData.BannerLink);

      const res = await fetch(
        `/api/panel/banner${bannerId ? `/${bannerId}` : ""}`,
        {
          method: bannerId ? "PATCH" : "PUT",
          body: formDataObj,
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("بنر با موفقیت ثبت شد");
        setSelectedBanner(null);
        setSelectedBannerFile(null); // ریست کردن فایل بنر پس از ثبت موفقیت‌آمیز
        setIsOpenAddBanner(false);
        // Refresh banners list after successful submission
      } else {
        toast.error(result.message || "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error("خطایی در ارسال درخواست به سرور رخ داد");
    }
  };

  return (
    <FormTemplate>
      {isOpenAddBanner && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddBanner
              banner={selectedBanner}
              bannerFile={selectedBannerFile}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت بنر ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add baner"
            onClick={handleAddBannerClick}
          >
            افزودن بنر
          </button>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {banners.map((banner) => (
            <BannerCard
              className="p-2 md:p-4"
              key={banner._id}
              banner={banner}
              editfunction={() => handleEditClick(banner)}
            />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default BannerManage;
