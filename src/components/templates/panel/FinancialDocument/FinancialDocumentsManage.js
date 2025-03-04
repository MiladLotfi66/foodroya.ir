// app/FinancialDocuments/FinancialDocumentManage.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import FinancialDocumentCard from "./FinancialDocumentCard";
import AddFinancialDocument from "./AddFinancialDocument";
import { GetAllFinancialDocuments} from  "./FinancialDocumentsServerActions";
import { Toaster, toast } from "react-hot-toast";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function FinancialDocumentManage() {
  const [financialDocuments, setFinancialDocuments] = useState([]);
  const [isOpenAddFinancialDocument, setIsOpenAddFinancialDocument] = useState(false);
  const [selectedFinancialDocument, setSelectedFinancialDocument] = useState(null);
  const [selectedFinancialDocumentFile, setSelectedFinancialDocumentFile] = useState(null); // افزودن استیت جدید
  const {
    currentShopId,
    shopPanelImage,
     } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
   const BGImage=shopPanelImage;  // بهینه‌سازی refreshFinancialDocuments با استفاده از useCallback
  ///////////////accessibility///////////////////
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
        "financialDocumentsPermissions"
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
   const refreshFinancialDocuments = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      const response = await GetAllFinancialDocuments(ShopId);
      
      setFinancialDocuments(response.Ledgers);
    } catch (error) {
      console.error("Error fetching financialDocuments:", error);
      toast.error("خطا در دریافت اسناد مالی.");
    }
  }, [ShopId,isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshFinancialDocuments();
  }}, [isAuthenticated,
    hasViewPermission,refreshFinancialDocuments]);

  const handleDeleteFinancialDocument = useCallback((financialDocumentId) => {
    setFinancialDocuments((prevFinancialDocuments) => prevFinancialDocuments.filter(financialDocument => financialDocument._id !== financialDocumentId));
    toast.success("سند مالی با موفقیت حذف شد.");
  }, []);
  // تابع برای دریافت خطا از فرزند
  const handleChildError = (errorMessage) => {
    toast.error(errorMessage || "خطایی رخ داد.");
  };

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddFinancialDocument(false);
      setSelectedFinancialDocument(null);
      setSelectedFinancialDocumentFile(null); // ریست کردن فایل سند مالی
    }
  }, []);

  const handleEditClick = useCallback((financialDocument) => {
    if (financialDocument.transactions[0].type==="invoice") {
      toast.error("برای ویرایش سند مالی فاکتور ها باید خود فاکتور را ویرایش کنید.");

    }else{
      setSelectedFinancialDocument(financialDocument);
      setSelectedFinancialDocumentFile(null); // ریست کردن فایل سند مالی در حالت ویرایش
      setIsOpenAddFinancialDocument(true);

    }
  }, []);

  const handleAddFinancialDocumentClick = useCallback(() => {
    setIsOpenAddFinancialDocument(true);
    setSelectedFinancialDocument(null);
    setSelectedFinancialDocumentFile(null); // ریست کردن فایل سند مالی در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddFinancialDocument(false);
    setSelectedFinancialDocument(null);
    setSelectedFinancialDocumentFile(null);
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
      {isOpenAddFinancialDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddFinancialDocument
              financialDocument={selectedFinancialDocument}
              financialDocumentFile={selectedFinancialDocumentFile}
              onClose={handleCloseModal}
              refreshFinancialDocuments={refreshFinancialDocuments} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="flex justify-between p-2 md:p-5 mt-6">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت اسناد مالی</h1>
          {hasAddPermission && 

          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add financialDocument"
            onClick={handleAddFinancialDocumentClick}
          >
            افزودن 
          </button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[78vh] overflow-y-auto">
          {financialDocuments?.map((financialDocument) => (
            <FinancialDocumentCard
              className="p-2 md:p-4"
              key={financialDocument._id}
              financialDocument={financialDocument}
              editFunction={() => handleEditClick(financialDocument)}
              onDelete={() => handleDeleteFinancialDocument(financialDocument._id,ShopId)} // پاس دادن تابع حذف
              ShopId={ShopId}
              onError={handleChildError} // ارسال تابع handleChildError به فرزند
              hasViewPermission={hasViewPermission}
              hasAddPermission={hasAddPermission}
              hasEditPermission={hasEditPermission}
              hasDeletePermission={hasDeletePermission}

            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default FinancialDocumentManage;
