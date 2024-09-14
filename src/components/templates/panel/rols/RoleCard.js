"use client";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import RoleName from "@/templates/panel/rols/RoleName";

function RoleCard({
  role,
  // :initialRole,
  handleDeleteRole,
  handleEnableRole,
  handleDisableRole,
  handleAllUsers,
  handleEditClick,
}) 

{

  return (
    <div className="bg-cover bg-center bg-[url('../../public/Images/webp/rols.webp')] rounded-xl">
      <div className="flex bg-black/50 bg-opacity-10 rounded-xl">
        <div
          className={
            !role.RoleStatus ? "bg-black/50 bg-opacity-60 rounded-xl" : ""
          }
        >
          <div className="flex-col gap-4">
            <RoleName name={role.RoleTitle} Role={role} />
            <div className="flexCenter gap-3 md:gap-4 my-2 md:my-4">
              <div className="flexCenter m-auto child-hover:text-orange-300 mx-2 md:mx-4 gap-2 md:gap-3 bg-gray-300 dark:bg-black dark:bg-opacity-50 bg-opacity-50 rounded-xl h-10">
                <svg
                  className="h-5 w-5 md:h-7 md:w-7"
                  onClick={() => handleEditClick(role)}
                >
                  <use href="#EditSvg"></use>
                </svg>
                <svg
                  className="h-5 w-5 md:h-7 md:w-7"
                  onClick={() => handleDeleteRole(role._id)}
                >
                  <use href="#DeleteSvg"></use>
                </svg>
                <svg
                  className={
                    role.RoleStatus ? "hidden" : "h-5 w-5 md:h-7 md:w-7"
                  }
                  onClick={() => handleEnableRole(role._id)}
                >
                  <use href="#EyeSvg"></use>
                </svg>
                <svg
                  className={
                    !role.RoleStatus ? "hidden" : "h-5 w-5 md:h-7 md:w-7"
                  }
                  onClick={() => handleDisableRole(role._id)}
                >
                  <use href="#EyeslashSvg"></use>
                </svg>
              </div>
              <div className="flexCenter m-auto p-2 child-hover:text-orange-300 mx-2 md:mx-4 gap-2 md:gap-3 bg-gray-300 dark:bg-black dark:bg-opacity-50 bg-opacity-50 rounded-xl h-10">
                <svg
                  className="h-5 w-5 md:h-7 md:w-7 "
                  onClick={() => handleAllUsers(role._id)}
                >
                  <use href="#UserPlus"></use>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleCard;
