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
import { 
  GetAllGlobalVariables, 
  AddGlobalVariableAction, 
  EditGlobalVariableAction, 
  DeleteGlobalVariable 
}  from "./GlobalVariableServerAction";
import GlobalVariableCard from "./GlobalVariableCard"; // این کامپوننت را باید بسازیم
import AddGlobalVariable from "./AddGlobalVariable"; // این کامپوننت را باید بسازیم


function PriceTemplateManage() {
  const [priceTemplates, setPriceTemplates] = useState([]);
  const [isOpenAddPriceTemplate, setIsOpenAddPriceTemplate] = useState(false);
  const [selectedPriceTemplate, setSelectedPriceTemplate] = useState(null);
  const [selectedPriceTemplateFile, setSelectedPriceTemplateFile] = useState(null);
  
  // اضافه کردن state‌های جدید برای متغیرهای عمومی
  const [globalVariables, setGlobalVariables] = useState([]);
  const [isOpenAddGlobalVariable, setIsOpenAddGlobalVariable] = useState(false);
  const [selectedGlobalVariable, setSelectedGlobalVariable] = useState(null);
  
  const {
    currentShopId,
    shopPanelImage,
  } = useShopInfoFromRedux();
  const ShopId = currentShopId;
  const BGImage = shopPanelImage;
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
   
  // اضافه کردن تابع refreshGlobalVariables
  const refreshGlobalVariables = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      const response = await GetAllGlobalVariables(ShopId);
      console.log("response",response);
      
      if (response.status === 200) {
        setGlobalVariables(response.globalVariables);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching global variables:", error);
      toast.error("خطا در دریافت متغیرهای عمومی.");
    }
  }, [ShopId, isAuthenticated]);

  // اضافه کردن useEffect برای لود اولیه متغیرهای عمومی
  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {
      refreshGlobalVariables();
    }
  }, [isAuthenticated, hasViewPermission, refreshGlobalVariables]);

  // اضافه کردن handler‌های مربوط به متغیرهای عمومی
  const handleAddGlobalVariableClick = useCallback(() => {
    setIsOpenAddGlobalVariable(true);
    setSelectedGlobalVariable(null);
  }, []);

  const handleEditGlobalVariable = useCallback((globalVariable) => {
    setSelectedGlobalVariable(globalVariable);
    setIsOpenAddGlobalVariable(true);
  }, []);

  const handleDeleteGlobalVariable = useCallback(async (globalVariableId) => {
    try {
      const response = await DeleteGlobalVariable(globalVariableId);
      if (response.status === 200) {
        setGlobalVariables(prev => prev.filter(v => v._id !== globalVariableId));
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting global variable:", error);
      toast.error("خطا در حذف متغیر عمومی.");
    }
  }, []);

  const handleCloseGlobalVariableModal = useCallback(() => {
    setIsOpenAddGlobalVariable(false);
    setSelectedGlobalVariable(null);
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
            {/* Modal برای افزودن/ویرایش متغیر عمومی */}
            {isOpenAddGlobalVariable && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseGlobalVariableModal();
            }
          }}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddGlobalVariable
              globalVariable={selectedGlobalVariable}
              onClose={handleCloseGlobalVariableModal}
              refreshGlobalVariables={refreshGlobalVariables}
              ShopId={ShopId}
            />
          </div>
        </div>
      )}

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

              {/* بخش متغیرهای عمومی */}
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="flex justify-between p-2 md:p-5">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">متغیرهای عمومی</h1>
          {hasAddPermission && (
            <button
              className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
              aria-label="add global variable"
              onClick={handleAddGlobalVariableClick}
            >
              افزودن متغیر عمومی
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[78vh] overflow-y-auto">
          {globalVariables.map((globalVariable) => (
            <GlobalVariableCard
              key={globalVariable._id}
              globalVariable={globalVariable}
              hasViewPermission={hasViewPermission}
              hasEditPermission={hasEditPermission}
              hasDeletePermission={hasDeletePermission}
              onEdit={() => handleEditGlobalVariable(globalVariable)}
              onDelete={() => handleDeleteGlobalVariable(globalVariable._id)}
            />
          ))}
        </div>
      </div>

      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default PriceTemplateManage;
