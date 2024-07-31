"use client";
import RoleNameAndImageCart from "./RoleNameAndImageCart";
import { useState } from "react";

function UsersListModal({ Users, buttonName, AddFunc,RemoveFunc }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleClick = (user) => {
    setSelectedUser(user);
    if (buttonName === 'افزودن') {
      AddFunc(user._id, "shopUniqName");
    } else {
      RemoveFunc(user._id);
    }
  };


  // بررسی وضعیت داده‌ها
  if (typeof Users === 'undefined') {
    return <p>کاربری وجود ندارد</p>;
  }

  if (!Users || Users.length === 0) {
    return <p>در حال بارگذاری...</p>;
  }

  return (
    <div>
      {Users.map((user) => (
        <div key={user?._id} className="flex gap-3 justify-between mt-3">
          <RoleNameAndImageCart user={user} />
          <button
            className="h-9 w-[50%] md:h-14 rounded-xl flexCenter gap-x-2 text-white bg-teal-600 hover:bg-teal-700"
            // onClick={buttonName==="حذف" ? RemoveFunc(user._id) : AddFunc(user._id)}
            onClick={() => handleClick(user)}
          >
            {buttonName}
          </button>
        </div>
      ))}
    </div>
  );
}

export default UsersListModal;
