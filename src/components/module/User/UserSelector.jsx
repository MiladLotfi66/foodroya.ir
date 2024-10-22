// app/Contact/UserSelector.js
"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { GetAllUsers } from "@/components/signinAndLogin/Actions/UsersServerActions";

function UserSelector({ isOpen, onClose, onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // فرض می‌کنیم که API برای دریافت کاربران موجود است
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await GetAllUsers(); // مسیر API را بر اساس نیاز خود تنظیم کنید
      console.log(response);
      
      if (response.status===200) {
        const data = response.data;
        setUsers(data);
      } else {
        toast.error("خطایی در دریافت کاربران رخ داده است.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطایی در دریافت کاربران رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-1/2 lg:w-1/3 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">انتخاب کاربر</h2>
          <button onClick={onClose} aria-label="بستن" className="text-red-500">
            &times;
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader"></div> {/* می‌توانید از Spinner یا Loader دلخواه استفاده کنید */}
          </div>
        ) : (
          <ul className="max-h-60 overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <li
                  key={user._id}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    onSelect(user);
                    onClose();
                  }}
                >
                  {user.name} {/* نمایش اطلاعات دلخواه از کاربر */}
                </li>
              ))
            ) : (
              <p>کاربری یافت نشد.</p>
            )}
          </ul>
        )}
        <Toaster />
      </div>
    </div>
  );
}

export default UserSelector;
