"use client";
import { useState, useEffect ,useCallback} from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import RoleName from "@/templates/panel/rols/RoleName";
import AddRole from "./AddRole";
import UsersListModal from "@/module/User/UsersListModal"; // اضافه کردن ایمپورت UsersListModal
import { useParams } from "next/navigation";

///////////////////////server actions////////////////////////
import {
  DeleteRole,
  DisableRole,
  EnableRole,
  GetAllFollowedUsersWithRoles,
  GetShopIdByShopUniqueName,
  GetShopRolesByShopUniqName,
  RemoveUserFromRole,
} from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { AddRoleToUser } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
////////////////////////svg////////////////
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import RoleCard from "./RoleCard";
/////////////////////////////////////////
function RolsManage() {
  const [isOpenAddRole, setIsOpenAddRole] = useState(false);
  const [isOpenUsersList, setIsOpenUsersList] = useState(false); // وضعیت مودال UsersListModal
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // انتخاب کاربران برای نمایش در UsersListModal
  const [userListButtenName, setUserListButtenName] = useState("");
  const params = useParams();
  const { shopUniqName } = params;
  const [rols, setRols] = useState([]);
  const [shopId, setShopId] = useState([]);
  
  useEffect(() => {
    refreshRols();
  }, []);

  const refreshRols = async () => {
    try {
      if (!shopUniqName) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const Shop = await GetShopIdByShopUniqueName(shopUniqName);
      if (Shop.status!==200) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      setShopId(Shop.ShopID);
      const response = await GetShopRolesByShopUniqName(shopUniqName);
      setRols(response.Roles);
      
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole(role); // نقش انتخابی برای ویرایش
    setIsOpenAddRole(true);

  };


  const handlerAddUserToRole = useCallback(async (UserId) => {
  
    try {
      let res = await AddRoleToUser(UserId, shopUniqName, selectedRole);
      if (res && res.success) {
        // به‌روزرسانی لیست کاربران محلی
        return { success: true };
      } else {
        console.error("خطایی در تخصیص نقش به کاربر رخ داد:", res.error);
        return { success: false };
      }
    } catch (error) {
      console.error("خطایی در تخصیص نقش:", error);
      return { success: false };
    }
  }, [shopUniqName, selectedRole]);
  //////////////////////////////////////////////////////////////////////////////////
  const handlerRemoveUserToRole = useCallback(async (UserId) => {
    try {
      let res = await RemoveUserFromRole(UserId, shopUniqName, selectedRole);
      if (res && res.success) {
        // در صورت موفقیت آمیز بودن عملیات، اینجا می‌توانید تغییرات لازم را اعمال کنید.
        return { success: true }; // بازگشت نتیجه صحیح
      } else {
        console.error("خطایی در حذف نقش کاربر رخ داد:", res.error);
        return { success: false }; // بازگشت نتیجه در صورت خطا
      }
    } catch (error) {
      console.error("خطایی در حین حذف نقش:", error);
      return { success: false }; // بازگشت نتیجه در صورت خطا
    }
  }, [shopUniqName, selectedRole]);
  

  const handleEnableRole = useCallback(async (RoleID) => {
    let res = await EnableRole(RoleID);
    if (res.status === 200) {
      const updatedRoles = rols.map((role) =>
        role._id === RoleID ? { ...role, RoleStatus: true } : role
      );
      setRols(updatedRoles);  
    }
  }, [rols]);

  const handleDeleteRole = useCallback(async (RoleID) => {
    let res = await DeleteRole(RoleID);
    if (res.status === 200) {
      const updatedRoles = rols.filter((role) => role._id !== RoleID);
      setRols(updatedRoles);
    } else {
      console.error("Error deleting role:", res.status);
    }
  }, [rols]);

  const handleDisableRole = useCallback(async (RoleID) => {
    let res = await DisableRole(RoleID);
    if (res.status===200) {
      const updatedRoles = rols.map((role) =>
        role._id === RoleID ? { ...role, RoleStatus: false } : role
      );
      setRols(updatedRoles);  
    }
  }, [rols]);

  const handleAddRoleClick = () => {
    setIsOpenAddRole(true);
    setSelectedRole(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddRole(false);
      setSelectedRole(null);
      setIsOpenUsersList(false); // بستن UsersListModal
      setSelectedUsers([]); // خالی کردن کاربران انتخاب شده
      setUserListButtenName("");
    }
  };

  const handleCloseModal = () => {
    setIsOpenAddRole(false);
    setSelectedRole(null);
  };

  const handleCloseUsersListModal = () => {
    setIsOpenUsersList(false);
    setSelectedUsers([]);
    setUserListButtenName("");
  };

  // async function handleUsersAtRole(roleId) {
  //   setIsOpenUsersList(true);
  //   try {
  //     let res = await getUsersByRoleId(roleId);
  //     setSelectedUsers(res);
  //     setSelectedRole(roleId);
  //     setUserListButtenName("حذف");
  //   } catch (error) {
  //     console.error("Error handling users at role:", error.message);
  //     setSelectedUsers([]);
  //   }
  // }

  const handleAllUsers = useCallback(async (roleId) => {
    if (!shopId) return; // مطمئن شوید که ShopId مقداردهی شده است
    setIsOpenUsersList(true);
    let res = await GetAllFollowedUsersWithRoles(shopId, roleId)
    
    setSelectedUsers(res.data);
    setUserListButtenName("افزودن");
    setSelectedRole(roleId);
  }, [shopId]);
  
  const handleSubmit = async (formData) => {
    // ارسال داده‌های فرم به سرور
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
              shopUniqName={shopUniqName}
              refreshRols={refreshRols} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      {isOpenUsersList && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <UsersListModal
              Users={selectedUsers}
              onClose={handleCloseUsersListModal}
              buttonName={userListButtenName}
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

        <div className=" grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-3  p-4 pb-16 justify-items-center ">
          {rols?.map((role) => (
            <RoleCard
              key={role._id}
              role={role}
              handleDeleteRole={handleDeleteRole}
              handleEnableRole={handleEnableRole}
              handleDisableRole={handleDisableRole}
              handleEditClick={handleEditClick}
              handleAllUsers={handleAllUsers}
                 />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default RolsManage;
