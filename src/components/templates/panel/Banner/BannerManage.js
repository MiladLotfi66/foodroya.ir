"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import BannerCard from "./BannerCard";
import { GetAllBanners } from "./BannerServerActions";
import AddBanner from "./AddBanner";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function BannerManage() {
  const [banners, setBanners] = useState([]);
  const [isOpenAddBanner, setIsOpenAddBanner] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null); // افزودن استیت جدید

  const {
     currentShopId,
     shopPanelImage,
      } = useShopInfoFromRedux();
   const ShopId  = currentShopId;

      ////////////////accessibility///////////////////
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const BGImage = shopPanelImage;

  const [hasViewPermission, setHasViewPermission] = useState(null);
  const [hasAddPermission, setHasAddPermission] = useState(null);
  const [hasEditPermission, setHasEditPermission] = useState(null);
  const [hasDeletePermission, setHasDeletePermission] = useState(null);
  const [permissionLoading, setPermissionLoading] = useState(true);

  const checkViewPermission = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissionLoading(false);
      return;
    }

    if (!ShopId) {
      // اگر ShopId موجود نیست، منتظر بمانید تا مقداردهی شود
      return;
    }

    setPermissionLoading(true); // شروع بارگذاری مجدد

    try {
      const response = await getUserPermissionInShopAccessList(
        ShopId,
        "bannersPermissions"
      );

      if (response.status === 200) {
        // بررسی اینکه آیا دسترسی view در آرایه hasPermission وجود دارد
        setHasViewPermission(response.hasPermission.includes("view"));
        setHasAddPermission(response.hasPermission.includes("add"));
        setHasEditPermission(response.hasPermission.includes("edit"));
        setHasDeletePermission(response.hasPermission.includes("delete"));
      } else {
        console.error("خطا در بررسی دسترسی:", response.message);
        setHasViewPermission(false);
        setHasAddPermission(false);
        setHasEditPermission(false);
        setHasDeletePermission(false);
      }
    } catch (error) {
      console.error("Error checking view permission:", error);
      setHasViewPermission(false);
      setHasAddPermission(false);
      setHasEditPermission(false);
      setHasDeletePermission(false);
      toast.error("خطا در بررسی دسترسی.");
    } finally {
      setPermissionLoading(false);
    }
  }, [ShopId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // بارگذاری دسترسی‌ها زمانی که احراز هویت انجام شده
      checkViewPermission();
    } else {
      // اگر احراز هویت نشده باشد، مطمئن شوید که وضعیت بارگذاری تنظیم شده است
      setPermissionLoading(false);
    }
  }, [checkViewPermission, isAuthenticated]);

///////////////////////////////////////

  // بهینه‌سازی refreshBanners با استفاده از useCallback
  const refreshBanners = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetAllBanners(ShopId);

      setBanners(response.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, [ShopId ,isAuthenticated]);


  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshBanners();
}}, [isAuthenticated, hasViewPermission, refreshBanners]);


 

  const handleDeleteBanner = useCallback((bannerId) => {
    setBanners((prevBanners) =>
      prevBanners.filter((banner) => banner._id !== bannerId)
    );
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddBanner(false);
      setSelectedBanner(null);
      setSelectedBannerFile(null); // ریست کردن فایل بنر
    }
  }, []);

  const handleEditClick = useCallback((banner) => {
    setSelectedBanner(banner);
    setSelectedBannerFile(null); // ریست کردن فایل بنر در حالت ویرایش
    setIsOpenAddBanner(true);
  }, []);

  const handleAddBannerClick = useCallback(() => {
    setIsOpenAddBanner(true);
    setSelectedBanner(null);
    setSelectedBannerFile(null); // ریست کردن فایل بنر در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddBanner(false);
    setSelectedBanner(null);
    setSelectedBannerFile(null);
  }, []);
  ///////////////////////////////////////
  if (status === "loading" || permissionLoading) {
    return <PermissionLoading BGImage={BGImage} />;
  }

  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  if (!hasViewPermission) {
    return <NoPermission />;
  }

  ///////////////////////////////////////////////

  return (
    <FormTemplate BGImage={BGImage}>
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

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت بنر ها</h1>
          {hasAddPermission && 
          <button
          className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
          aria-label="add baner"
          onClick={handleAddBannerClick}
          >
            افزودن 
          </button>
          }
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[70vh] overflow-y-auto">
          {banners.map((banner) => (
            <BannerCard
              className="p-2 md:p-4"
              key={banner._id}
              banner={banner}
              editfunction={() => handleEditClick(banner)}
              onDelete={() => handleDeleteBanner(banner._id)} // پاس دادن تابع حذف
              hasViewPermission={hasViewPermission}
              hasAddPermission={hasAddPermission}
              hasEditPermission={hasEditPermission}
              hasDeletePermission={hasDeletePermission}
              
              />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default BannerManage;
