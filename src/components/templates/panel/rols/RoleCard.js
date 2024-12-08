// components/RoleCard.jsx
"use client";
import React, { useState, useEffect } from "react";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import EyeSvg from "@/module/svgs/EyeSvg";
import EyeslashSvg from "@/module/svgs/EyeslashSvg";
import UserPlus from "@/module/svgs/UserPlus";
import RoleName from "@/templates/panel/rols/RoleName";
import ActionButton from "./ActionButton";
import * as Tooltip from "@radix-ui/react-tooltip";
import { getUsersByRoleId } from "./RolesPermissionActions";
import AvatarGroupTailwind from "@/module/User/AvatarGroupTailwind.js";

function RoleCard({
  role,
  handleDeleteRole,
  handleEnableRole,
  handleDisableRole,
  handleAllUsers,
  handleEditClick,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUsers = await getUsersByRoleId(role._id);
        console.log("fetchedUsers",fetchedUsers);
        
        setUsers(fetchedUsers);
      } catch (err) {
        setError("خطا در دریافت کاربران نقش");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role._id]);

  // استخراج URLهای آواتارها از کاربران
  const avatarUrls = users.map(user => user.userImage ).filter(Boolean);

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

        {/* نمایش لیست کاربران */}
        <div className="w-full">
          {loading ? (
            <div className="text-center text-gray-500">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : avatarUrls.length > 0 ? (
            <AvatarGroupTailwind 
              avatars={avatarUrls} 
              max={4} 
              size={30} 
              overlap={15} 
            />
          ) : (
            <div className="text-center text-gray-500">هیچ کاربری به این نقش اختصاص داده نشده است.</div>
          )}
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

            {/* دکمه افزودن کاربر به نقش */}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <ActionButton
                    onClick={() => handleAllUsers(role._id)}
                    Icon={UserPlus}
                    label="افزودن کاربر به نقش"
                    className="bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-400"
                  />
                </Tooltip.Trigger>
                <Tooltip.Content className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
                  افزودن کاربر به نقش
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
