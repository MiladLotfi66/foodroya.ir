// RolsManage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import AddRole from "./AddRole";
import ContactsListModal from "@/module/User/ContactsListModal";
import { Toaster, toast } from "react-hot-toast";

// Import توابع مربوط به اکشن‌های سروری
import {
  DeleteRole,
  DisableRole,
  EnableRole,
  GetShopRolesByShopId,
  RemoveContactFromRole,
  AddRoleToContact,
  GetAllContactsWithRoles,
} from "./RolesPermissionActions";

// Importهای SVG
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import RoleCard from "./RoleCard";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function RolsManage() {
  const [isOpenAddRole, setIsOpenAddRole] = useState(false);
  const [isOpenContactsList, setIsOpenContactsList] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [userListButtonName, setUserListButtonName] = useState("");
  const [rols, setRols] = useState([]);
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
               "rolesPermissions"
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
       


  // مدیریت تعداد مخاطبان هر نقش
  const [contactCounts, setContactCounts] = useState({});

  // فراخوانی نقش‌ها و تنظیم تعداد مخاطبان
  const refreshRols = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await GetShopRolesByShopId(ShopId);
      setRols(response.Roles);
      // فرض می‌کنیم هر نقش دارای یک فیلد contacts که آرایه‌ای از مخاطبان است
      const counts = {};
      
      response.Roles.forEach(role => {
        counts[role._id] = role.contacts ? role.contacts.length : 0;
      });
      setContactCounts(counts);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, [ShopId,isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasViewPermission) {

    refreshRols();
  }}, [refreshRols,isAuthenticated,hasViewPermission]);

  // توابع افزودن و حذف مخاطب
  const handlerAddUserToRole = useCallback(async (UserId) => {
    try {
      let res = await AddRoleToContact(UserId, ShopId, selectedRole);
      
      if (res && res.success) {
        // به‌روزرسانی تعداد مخاطبان محلی
        setContactCounts(prevCounts => ({
          ...prevCounts,
          [selectedRole]: prevCounts[selectedRole] + 1
        }));
        return { success: true };
      } else {
        console.error("خطایی در تخصیص نقش به کاربر رخ داد:", res.error);
        return { success: false };
      }
    } catch (error) {
      console.error("خطایی در تخصیص نقش:", error);
      return { success: false };
    }
  }, [ShopId, selectedRole]);

  const handlerRemoveUserToRole = useCallback(async (UserId) => {
    try {
      let res = await RemoveContactFromRole(UserId, ShopId, selectedRole);
      if (res && res.success) {
        // به‌روزرسانی تعداد مخاطبان محلی
        setContactCounts(prevCounts => ({
          ...prevCounts,
          [selectedRole]: prevCounts[selectedRole] - 1
        }));
        return { success: true };
      } else {
        console.error("خطایی در حذف نقش کاربر رخ داد:", res.error);
        return { success: false };
      }
    } catch (error) {
      console.error("خطایی در حین حذف نقش:", error);
      return { success: false };
    }
  }, [ShopId, selectedRole]);

  // سایر توابع (فعال/غیرفعال/حذف نقش‌ها) بدون تغییر باقی می‌مانند
  const handleEnableRole = useCallback(async (RoleID) => {
    let res = await EnableRole(RoleID);
    if (res.status === 200) {
      const updatedRoles = rols.map((role) =>
        role._id === RoleID ? { ...role, RoleStatus: true } : role
      );
      setRols(updatedRoles);  
    }
  }, [rols]);

  const handleDisableRole = useCallback(async (RoleID) => {
    let res = await DisableRole(RoleID);
    if (res.status === 200) {
      const updatedRoles = rols.map((role) =>
        role._id === RoleID ? { ...role, RoleStatus: false } : role
      );
      setRols(updatedRoles);  
    }
  }, [rols]);

  const handleDeleteRole = useCallback(async (RoleID) => {
    let res = await DeleteRole(RoleID);
    console.log("res",res);
    
    if (res.status === 200) {
      const updatedRoles = rols.filter((role) => role._id !== RoleID);
      setRols(updatedRoles);
      
      // همچنین باید تعداد مخاطبان نقش را حذف کنیم
      setContactCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        delete newCounts[RoleID];
        return newCounts;
      });
    } else {
      toast.error(res.message);
    }
  }, [rols]);

  const handleAddRoleClick = () => {
    setIsOpenAddRole(true);
    setSelectedRole(null);
  };

  const handleEditClick = (role) => {
    setIsOpenAddRole(true);
    setSelectedRole(role);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddRole(false);
      setSelectedRole(null);
      setIsOpenContactsList(false);
      setSelectedContacts([]);
      setUserListButtonName("");
    }
  };

  const handleCloseModal = () => {
    setIsOpenAddRole(false);
    setSelectedRole(null);
  };

  const handleCloseContactsListModal = () => {
    setIsOpenContactsList(false);
    setSelectedContacts([]);
    setUserListButtonName("");
  };

  const handleAllContacts = useCallback(async (roleId) => {
    if (!ShopId) return;
    setIsOpenContactsList(true);
    let res = await GetAllContactsWithRoles(ShopId, roleId);
    
    setSelectedContacts(res.data);
    setUserListButtonName("افزودن");
    setSelectedRole(roleId);
  }, [ShopId]);

  const handleSubmit = async (formData) => {
    // ارسال داده‌های فرم به سرور
    // بعد از افزودن نقش جدید، باید تعداد مخاطبان آن نقش را نیز اضافه کنید
    await refreshRols();
  };
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
      {isOpenAddRole && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddRole
              role={selectedRole}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
              ShopId={ShopId}
              refreshRols={refreshRols}
            />
          </div>
        </div>
      )}

      {isOpenContactsList && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ContactsListModal
              Contacts={selectedContacts}
              onClose={handleCloseContactsListModal}
              buttonName={userListButtonName}
              AddFunc={handlerAddUserToRole}
              RemoveFunc={handlerRemoveUserToRole}
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6">
        <div className="hidden">
          <EditSvg />
          <DeleteSvg />
          <EyeSvg />
          <EyeslashSvg />
          <UserPlus />
        </div>
        <div className="flex justify-between p-2 md:p-5 mt-6">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت نقش ها</h1>
          {hasAddPermission && 

          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
            onClick={handleAddRoleClick}
          >
            افزودن 
          </button>
}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 p-4 pb-16 justify-items-center max-h-[78vh] overflow-y-auto">
          {rols?.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              contactCount={contactCounts[role._id] || 0} // ارسال تعداد مخاطبان به RoleCard
              handleDeleteRole={handleDeleteRole}
              handleEnableRole={handleEnableRole}
              handleDisableRole={handleDisableRole}
              handleEditClick={() => handleEditClick(role)}
              handleAllContacts={handleAllContacts}
              ShopId
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

export default RolsManage;
