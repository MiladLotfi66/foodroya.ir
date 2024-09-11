"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import BannerCard from "./BannerCard";
import { GetAllBanners } from "@/components/signinAndLogin/Actions/BannerServerActions";
import AddBanner from "./AddBanner";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { useParams } from 'next/navigation';


function BannerManage() {
  const [banners, setBanners] = useState([]);
  const [isOpenAddBanner, setIsOpenAddBanner] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { shopUniqName } = params;

 

  useEffect(() => {
    refreshBanners();
  }, []);

  const refreshBanners = async () => {
    
    try {
      if (!shopUniqName) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }
  
      const ShopId = await GetShopIdByShopUniqueName(shopUniqName);
  
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      
      const response = await GetAllBanners(ShopId.ShopID);
      
      setBanners(response.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  const handleDeleteBanner = (bannerId) => {
    setBanners(banners.filter(banner => banner._id !== bannerId)); // حذف بنر از لیست
  };


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
              onClose={handleCloseModal}
              refreshBanners={refreshBanners} // اضافه کردن این خط

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
              onDelete={() => handleDeleteBanner(banner._id)} // پاس دادن تابع حذف

              />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default BannerManage;
