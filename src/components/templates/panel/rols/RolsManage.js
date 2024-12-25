// RolsManage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import AddRole from "./AddRole";
import ContactsListModal from "@/module/User/ContactsListModal";
import { useParams } from "next/navigation";

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

function RolsManage() {
  const [isOpenAddRole, setIsOpenAddRole] = useState(false);
  const [isOpenContactsList, setIsOpenContactsList] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [userListButtonName, setUserListButtonName] = useState("");
  const params = useParams();
  const { ShopId } = params;
  const [rols, setRols] = useState([]);
  
  // مدیریت تعداد مخاطبان هر نقش
  const [contactCounts, setContactCounts] = useState({});

  // فراخوانی نقش‌ها و تنظیم تعداد مخاطبان
  const refreshRols = useCallback(async () => {
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
  }, [ShopId]);

  useEffect(() => {
    refreshRols();
  }, [refreshRols]);

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
      console.error("Error deleting role:", res.status);
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

  return (
    <FormTemplate>
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

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="hidden">
          <EditSvg />
          <DeleteSvg />
          <EyeSvg />
          <EyeslashSvg />
          <UserPlus />
        </div>
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت نقش ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
            onClick={handleAddRoleClick}
          >
            افزودن نقش
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-3 p-4 pb-16 justify-items-center">
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
            />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default RolsManage;
