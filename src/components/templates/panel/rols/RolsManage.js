"use client";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import RoleName from "@/templates/panel/rols/RoleName";
import AddRole from "./AddRole";
import UsersListModal from "@/module/User/UsersListModal"; // اضافه کردن ایمپورت UsersListModal
import { useState, useEffect } from "react";
import {
  GetShopRolesByShopUniqName,
  getUsersByRoleId,
} from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { GetAllUsers } from "@/components/signinAndLogin/Actions/UsersServerActions";
import { AddRoleToUser } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import UserMinus from "@/module/svgs/UserMinus";
import UserPlus from "@/module/svgs/UserPlus";

function RolsManage({ params }) {
  const [isOpenAddRole, setIsOpenAddRole] = useState(false);
  const [isOpenUsersList, setIsOpenUsersList] = useState(false); // وضعیت مودال UsersListModal
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // انتخاب کاربران برای نمایش در UsersListModal
  const [userListButtenName, setUserListButtenName] = useState("");

  const shopUniqName = params.shopUniqName;
  const [rols, setRols] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await GetShopRolesByShopUniqName(shopUniqName);
        setRols(response.Roles);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchRoles();
  }, [shopUniqName]); // اضافه کردن shopUniqName به آرایه وابستگی

  const handlerAddUserToRole = async (UserId) => {
    console.log("UserId, shopUniqName-------->", UserId, shopUniqName);
    let res = await AddRoleToUser(UserId, shopUniqName, selectedRole);
    console.log(res);
  };

  const handlerRemoveUserToRole = (user) => {
    console.log("remove user:", user);
  };

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

  async function handleUsersAtRole(roleId) {
    setIsOpenUsersList(true);
    let res = await getUsersByRoleId(roleId);

    setSelectedUsers(res.userNames); // فرض بر این است که هر نقش دارای یک ویژگی users است
    setUserListButtenName("حذف");
  }

  async function handleAllUsers(roleId) {
    setIsOpenUsersList(true);
    let res = await GetAllUsers();
    setSelectedUsers(res.data); // فرض بر این است که هر نقش دارای یک ویژگی users است
    setUserListButtenName("افزودن");
    setSelectedRole(roleId);
  }

  const handleSubmit = async (formData) => {
    console.log("addbaner run");
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
          <UserPlus />
          <UserMinus />
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

        <div className=" grid grid-cols-2 gap-6 md:grid-cols-4  p-4 pb-16 justify-items-center">
          {rols?.map((Role) => (
            <div key={Role._id} className="bg-cover bg-center  bg-[url('../../public/Images/webp/rols.webp')] rounded-xl">
   <div
              className=" flex border rounded-xl hover:border  p-2  bg-black bg-opacity-10 "
            >
            <div  className="flex-col gap-4 ">
              <RoleName
                name={Role.RoleTitle}
                Role={Role}
                />

              <div className="flexCenter gap-3 md:gap-4 my-2 md:my-4 ">
              <div className=" flexCenter m-auto child-hover:text-orange-300 mx-2 md:mx-4  gap-2 md:gap-3 bg-gray-300 dark:bg-black dark:bg-opacity-50 bg-opacity-50 rounded-xl  h-10">
              <svg className="h-5 w-5 md:h-7 md:w-7">
                    <use href="#EditSvg"></use>
                  </svg>

                  <svg className="h-5 w-5 md:h-7 md:w-7">
                    <use href="#DeleteSvg"></use>
                  </svg>

                  <svg className="h-5 w-5 md:h-7 md:w-7">
                    <use href="#EyeSvg"></use>
                  </svg>
                </div>
                <div className=" flexCenter m-auto child-hover:text-orange-300 mx-2 md:mx-4  gap-2 md:gap-3 bg-gray-300 dark:bg-black dark:bg-opacity-50 bg-opacity-50 rounded-xl  h-10">
                <svg
                  className="h-5 w-5 md:h-7 md:w-7"
                  onClick={() => handleAllUsers(Role._id)}
                >
                  <use href="#UserPlus"></use>
                </svg>
                <svg
                  className="h-5 w-5 md:h-7 md:w-7"
                  onClick={() => handleUsersAtRole(Role._id)}
                >
                  <use href="#UserMinus"></use>
                </svg>
                </div>

              </div>
            </div>
         
          </div>
          </div>

          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default RolsManage;
