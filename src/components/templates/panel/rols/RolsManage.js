"use client";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import RoleName from "@/templates/panel/rols/RoleName";
import AddRole from "./AddRole";
import UsersListModal from "@/module/User/UsersListModal"; // اضافه کردن ایمپورت UsersListModal
import { useState , useEffect } from "react";
import { GetShopRolesByShopUniqName, getUsersByRoleId } from "@/components/signinAndLogin/Actions/RolesPermissionActions";

function RolsManage({ params }) {
  const [isOpenAddRole, setIsOpenAddRole] = useState(false);
  const [isOpenUsersList, setIsOpenUsersList] = useState(false); // وضعیت مودال UsersListModal
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]); // انتخاب کاربران برای نمایش در UsersListModal
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
    }
  };

  const handleCloseModal = () => {
    setIsOpenAddRole(false);
    setSelectedRole(null);
  };

  const handleCloseUsersListModal = () => {
    setIsOpenUsersList(false);
    setSelectedUsers([]);
  };

  async function handleRoleNameClick(roleId) {
    setIsOpenUsersList(true);
    let res= await getUsersByRoleId(roleId) 
    // if (res.userNames) {
    //   onClose()
    //   window.location.reload();
    //  } else {
    //   toast.error(res.error || "خطایی رخ داده است");
    // }  
    console.log(res);
      setSelectedUsers(res.userNames); // فرض بر این است که هر نقش دارای یک ویژگی users است
  };

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
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
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

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 xl:grid-cols-8 p-4 pb-16 justify-items-center">
          {rols.map((Role) => (
            <RoleName
              name={Role.RoleTitle}
              key={Role._id}
              Role={Role}
              editfunction={handleRoleNameClick} // اضافه کردن هندلر برای باز کردن UsersListModal
              onClickfunction={()=>handleRoleNameClick(Role._id)}
              />
          ))}
        </div>
       
      </div>
    </FormTemplate>
  );
}

export default RolsManage;
