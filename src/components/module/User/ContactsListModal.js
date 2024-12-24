"use client"
import { useState, useEffect } from "react";
import RoleNameAndImageCart from "./RoleNameAndImageCart";

function ContactsListModal({ Contacts, AddFunc, RemoveFunc }) {
  
  const [localContacts, setLocalContacts] = useState([]);

  useEffect(() => {
    setLocalContacts(Contacts);
  }, [Contacts]);

  const handleAddRole = async (userId) => {
    
    const result = await AddFunc(userId);
    
    if (result?.success) {
      setLocalContacts((prevContacts) =>
        prevContacts?.map((user) =>
          user._id === userId ? { ...user, hasRole: true } : user
        )
      );
    } else {
      console.error("خطا در افزودن نقش");
    }
  };

  const handleRemoveRole = async (userId) => {
    const result = await RemoveFunc(userId);
    if (result?.success) {
      setLocalContacts((prevContacts) =>
        prevContacts?.map((user) =>
          user._id === userId ? { ...user, hasRole: false } : user
        )
      );
    } else {
      console.error("خطا در حذف نقش");
    }
  };

  return (
    <div>
      {localContacts?.map((user) => (
        <div key={user?._id} className="flex gap-3 justify-between mt-3">
          <RoleNameAndImageCart user={user} />
          {user.hasRole ? (
            <button
              className="h-9 w-[50%] md:h-14 rounded-xl flexCenter gap-x-2 text-white bg-gray-500 hover:bg-gray-600"
              onClick={() => handleRemoveRole(user._id)}
            >
              حذف نقش
            </button>
          ) : (
            <button
              className="h-9 w-[50%] md:h-14 rounded-xl flexCenter gap-x-2 text-white bg-blue-500 hover:bg-blue-600"
              onClick={() => handleAddRole(user._id)}
            >
              اعطای نقش
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ContactsListModal;
