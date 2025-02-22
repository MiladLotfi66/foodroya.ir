// app/contacts/ContactManager.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import ContactCard from "./ContactCard";
import AddContact from "./AddContact";
import {
  GetAllContacts,
} from "./contactsServerActions";
import { Toaster, toast } from "react-hot-toast";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [isOpenAddContact, setIsOpenAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContactFile, setSelectedContactFile] = useState(null); // افزودن استیت جدید
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
        "contactsPermissions"
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

  // بهینه‌سازی refreshContacts با استفاده از useCallback
  const refreshContacts = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }

      const response = await GetAllContacts(ShopId);

      setContacts(response.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("خطا در دریافت مخاطب‌ها.");
    }
  }, [ShopId,isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshContacts();
  }}, [isAuthenticated, hasViewPermission,refreshContacts]);

  const handleDeleteContact = useCallback((contactId) => {
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact._id !== contactId)
    );
    toast.success("مخاطب با موفقیت حذف شد.");
  }, []);

  const handleError = useCallback((errorMessage) => { // افزودن تابع handleError
    toast.error(errorMessage);
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddContact(false);
      setSelectedContact(null);
      setSelectedContactFile(null); // ریست کردن فایل مخاطب
    }
  }, []);

  const handleEditClick = useCallback((contact) => {
    setSelectedContact(contact);
    setSelectedContactFile(null); // ریست کردن فایل مخاطب در حالت ویرایش
    setIsOpenAddContact(true);
  }, []);

  const handleAddContactClick = useCallback(() => {
    setIsOpenAddContact(true);
    setSelectedContact(null);
    setSelectedContactFile(null); // ریست کردن فایل مخاطب در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddContact(false);
    setSelectedContact(null);
    setSelectedContactFile(null);
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
      {isOpenAddContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddContact
              contact={selectedContact}
              contactFile={selectedContactFile}
              onClose={handleCloseModal}
              refreshContacts={refreshContacts} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت مخاطب‌ها</h1>
          {hasAddPermission && 

          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add contact"
            onClick={handleAddContactClick}
          >
            <span className=" inline">افزودن </span>
          </button>
}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[70vh] overflow-y-auto">
          {contacts?.map((contact) => (
            <ContactCard
              className="p-2 md:p-4"
              key={contact._id}
              contact={contact}
              editFunction={() => handleEditClick(contact)}
              onDelete={() => handleDeleteContact(contact._id)} // پاس دادن تابع حذف
              onError={handleError} // ارسال تابع handleError به ContactCard
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

export default ContactManager;
