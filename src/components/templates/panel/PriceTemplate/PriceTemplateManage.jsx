// app/PriceTemplateManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import PriceTemplateCard from "./PriceTemplateCard";
import AddPriceTemplate from "./AddPriceTemplate";
import { AddPriceTemplateAction, DeletePriceTemplates, EditPriceTemplateAction, GetAllPriceTemplates } from "./PriceTemplateActions";
import { Toaster, toast } from "react-hot-toast";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function PriceTemplateManage() {
  const [priceTemplates, setPriceTemplates] = useState([]);
  const [isOpenAddPriceTemplate, setIsOpenAddPriceTemplate] = useState(false);
  const [selectedPriceTemplate, setSelectedPriceTemplate] = useState(null);
  const [selectedPriceTemplateFile, setSelectedPriceTemplateFile] = useState(null); // افزودن استیت جدید
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
        "priceTemplatesPermissions"
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

  // بهینه‌سازی refreshPriceTemplates با استفاده از useCallback
  const refreshPriceTemplates = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      const response = await GetAllPriceTemplates(ShopId);
      setPriceTemplates(response.PriceTemplates);
    } catch (error) {
      console.error("Error fetching price templates:", error);
      toast.error("خطا در دریافت قالب‌های قیمتی.");
    }
  }, [ShopId,isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshPriceTemplates();
  }}, [isAuthenticated,hasViewPermission,refreshPriceTemplates]);

  const handleDeletePriceTemplate = useCallback((priceTemplateId) => {
    setPriceTemplates((prevPriceTemplates) => prevPriceTemplates.filter(template => template._id !== priceTemplateId));
    toast.success("قالب قیمتی با موفقیت حذف شد.");
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddPriceTemplate(false);
      setSelectedPriceTemplate(null);
      setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی
    }
  }, []);

  const handleEditClick = useCallback((priceTemplate) => {
    setSelectedPriceTemplate(priceTemplate);
    setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی در حالت ویرایش
    setIsOpenAddPriceTemplate(true);
  }, []);

  const handleAddPriceTemplateClick = useCallback(() => {
    setIsOpenAddPriceTemplate(true);
    setSelectedPriceTemplate(null);
    setSelectedPriceTemplateFile(null); // ریست کردن فایل قالب قیمتی در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddPriceTemplate(false);
    setSelectedPriceTemplate(null);
    setSelectedPriceTemplateFile(null);
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
      {isOpenAddPriceTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddPriceTemplate
              priceTemplate={selectedPriceTemplate}
              priceTemplateFile={selectedPriceTemplateFile}
              onClose={handleCloseModal}
              refreshPriceTemplates={refreshPriceTemplates} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="flex justify-between p-2 md:p-5 mt-6">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت قالب‌های قیمتی</h1>
          {hasAddPermission && 

          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add price template"
            onClick={handleAddPriceTemplateClick}
          >
            افزودن 
          </button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[78vh] overflow-y-auto">
          {priceTemplates?.map((priceTemplate) => (
            <PriceTemplateCard
              className="p-2 md:p-4"
              key={priceTemplate._id}
              priceTemplate={priceTemplate}
              hasViewPermission={hasViewPermission}
              hasAddPermission={hasAddPermission}
              hasEditPermission={hasEditPermission}
              hasDeletePermission={hasDeletePermission}

              editFunction={() => handleEditClick(priceTemplate)}
              onDelete={() => handleDeletePriceTemplate(priceTemplate._id)} // پاس دادن تابع حذف
            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default PriceTemplateManage;
