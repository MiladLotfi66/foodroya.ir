// RoleCard.jsx
"use client";
import React, { useEffect } from "react";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import RoleName from "@/templates/panel/rols/RoleName";
import ActionButton from "./ActionButton";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CountContactsRoles, GetAllContactsWithRoles } from "./RolesPermissionActions";

 function RoleCard({
  role,
  handleDeleteRole,
  handleEnableRole,
  handleDisableRole,
  handleAllContacts,
  handleEditClick,
}
)
{



  
  return (
    <div
      className={`relative rounded-xl bg-white dark:bg-zinc-700 shadow-md p-6 transition-transform duration-300 hover:scale-105 ${
        role.RoleStatus ? "border-2 border-green-500" : "border-2 border-red-500"
      }`}
    >
      {/* بیج وضعیت */}
      <div className={`absolute top-4 right-4`}>
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
            role.RoleStatus
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {role.RoleStatus ? "فعال" : "غیرفعال"}
        </span>
      </div>
      <div className="flex flex-col items-center gap-6">
        {/* دایره حاوی نام نقش */}
        <div
          className={`flex justify-center items-center w-16 h-16 rounded-full ${
            role.RoleStatus
              ? "bg-green-100 dark:bg-green-800"
              : "bg-red-100 dark:bg-red-800"
          }`}
        >
          <RoleName name={role.RoleTitle} Role={role} />
        </div>
    
        {/* دکمه‌های عملیات */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <Tooltip.Provider>
              {/* ویرایش نقش */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <ActionButton
                    onClick={() => handleEditClick(role)}
                    Icon={EditSvg}
                    label="ویرایش نقش"
                    className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400"
                  />
                </Tooltip.Trigger>
                <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                  ویرایش نقش
                  <Tooltip.Arrow className="fill-gray-700" />
                </Tooltip.Content>
              </Tooltip.Root>

              {/* حذف نقش */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <ActionButton
                    onClick={() => handleDeleteRole(role._id)}
                    Icon={DeleteSvg}
                    label="حذف نقش"
                    className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
                  />
                </Tooltip.Trigger>
                <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                  حذف نقش
                  <Tooltip.Arrow className="fill-gray-700" />
                </Tooltip.Content>
              </Tooltip.Root>

              {/* فعال/غیرفعال کردن نقش */}
              {role.RoleStatus ? (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <ActionButton
                      onClick={() => handleDisableRole(role._id)}
                      Icon={EyeslashSvg}
                      label="غیرفعال کردن نقش"
                      className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400"
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                    غیرفعال کردن نقش
                    <Tooltip.Arrow className="fill-gray-700" />
                  </Tooltip.Content>
                </Tooltip.Root>
              ) : (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <ActionButton
                      onClick={() => handleEnableRole(role._id)}
                      Icon={EyeSvg}
                      label="فعال کردن نقش"
                      className="bg-green-500 text-white hover:bg-green-600 focus:ring-green-400"
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                    فعال کردن نقش
                    <Tooltip.Arrow className="fill-gray-700" />
                  </Tooltip.Content>
                </Tooltip.Root>
              )}
            </Tooltip.Provider>
            {/* دکمه افزودن مخاطب به نقش */}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <ActionButton
                    onClick={() => handleAllContacts(role._id)}
                    Icon={UserPlus}
                    label="افزودن مخاطب به نقش"
                    className="bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-400"
                  />
                </Tooltip.Trigger>
                <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                  افزودن مخاطب به نقش
                  <Tooltip.Arrow className="fill-gray-700" />
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleCard;