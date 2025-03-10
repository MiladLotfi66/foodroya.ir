//src/components/module/home/ContactSelector.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { GetAllContacts } from "@/templates/panel/Contact/contactsServerActions";
import { useParams } from 'next/navigation';


 function ContactSelector({ isOpen, onClose, onSelect }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  let { ShopId } = useParams();

  // فرض می‌کنیم که API برای دریافت مخاطبان موجود است
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GetAllContacts(ShopId);
      if (response.status === 200) {
        setContacts(response.contacts);
      } else {
        toast.error("خطایی در دریافت مخاطبان رخ داده است.");
      }
    } catch (error) {
      toast.error("خطایی در دریافت مخاطبان رخ داده است.");
    } finally {
      setLoading(false);
    }
  }, [ShopId]);  // وابستگی به ShopId تغییر کرده
  

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-zinc-600 rounded-lg w-11/12 md:w-1/2 lg:w-1/3 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">انتخاب مخاطب</h2>
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
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <li
                  key={contact._id}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    onSelect(contact);
                    onClose();
                  }}
                >
                  {contact.name} {/* نمایش اطلاعات دلخواه از مخاطب */}
                </li>
              ))
            ) : (
              <p>مخاطبی یافت نشد.</p>
            )}
          </ul>
        )}
        <Toaster />
      </div>
    </div>
  );
}

export default ContactSelector;
