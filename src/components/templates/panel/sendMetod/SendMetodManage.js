"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import SendMetodCard from "./SendMetodCard";
import { GetAllSendMetods } from "./SendMetodServerActions";
import AddSendMetod from "./AddSendMetod";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import { Toaster, toast } from "react-hot-toast";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function SendMetodManage() {
  const [sendMetods, setSendMetods] = useState([]);
  const [isOpenAddSendMetod, setIsOpenAddSendMetod] = useState(false);
  const [selectedSendMetod, setSelectedSendMetod] = useState(null);
  const [selectedSendMetodFile, setSelectedSendMetodFile] = useState(null); // افزودن استیت جدید

  const {
     currentShopId,
     shopPanelImage,
      } = useShopInfoFromRedux();
   const ShopId  = currentShopId;
    const BGImage=shopPanelImage;
             ////////////////accessibility///////////////////
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

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
        "sendMethodPermissions"
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


///////////////////////////////

  // بهینه‌سازی refreshSendMetods با استفاده از useCallback
  const refreshSendMetods = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetAllSendMetods(ShopId);

      setSendMetods(response.sendMetods);
    } catch (error) {
      console.error("Error fetching sendMetods:", error);
    }
  }, [ShopId  , isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshSendMetods();
  }}, [isAuthenticated, hasViewPermission,refreshSendMetods]);

  const handleDeleteSendMetod = useCallback((sendMetodId) => {
    setSendMetods((prevSendMetods) =>
      prevSendMetods.filter((sendMetod) => sendMetod._id !== sendMetodId)
    );
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddSendMetod(false);
      setSelectedSendMetod(null);
      setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال
    }
  }, []);

  const handleEditClick = useCallback((sendMetod) => {
    setSelectedSendMetod(sendMetod);
    setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال در حالت ویرایش
    setIsOpenAddSendMetod(true);
  }, []);

  const handleAddSendMetodClick = useCallback(() => {
    setIsOpenAddSendMetod(true);
    setSelectedSendMetod(null);
    setSelectedSendMetodFile(null); // ریست کردن فایل روش ارسال در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddSendMetod(false);
    setSelectedSendMetod(null);
    setSelectedSendMetodFile(null);
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
      {isOpenAddSendMetod && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddSendMetod
              sendMetod={selectedSendMetod}
              sendMetodFile={selectedSendMetodFile}
              onClose={handleCloseModal}
              refreshSendMetods={refreshSendMetods} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="flex justify-between p-2 md:p-5 mt-6">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت روش ارسال ها</h1>
          {hasAddPermission && 
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add baner"
            onClick={handleAddSendMetodClick}
          >
            افزودن 
          </button>
          }
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[78vh]  overflow-y-auto">
          {sendMetods.map((sendMetod) => (
           <SendMetodCard
           key={sendMetod._id}
           sendMetod={sendMetod}
           hasViewPermission={hasViewPermission}
           hasAddPermission={hasAddPermission}
           hasEditPermission={hasEditPermission}
           hasDeletePermission={hasDeletePermission}

           editfunction={() => handleEditClick(sendMetod)}
           onDelete={() => handleDeleteSendMetod(sendMetod._id)}
           updateSendMetod={(updatedData) => {
             setSendMetods((prev) =>
               prev.map((item) =>
                 item._id === updatedData._id ? updatedData : item
               )
             );
           }}
         />
         
          ))}
        </div>
      </div>
      <Toaster />

    </FormTemplate>
  );
}

export default SendMetodManage;
