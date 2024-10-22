// app/contacts/ContactManager.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import ContactCard from "./ContactCard";
import AddContact from "./AddContact";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { useParams } from 'next/navigation';
import { AddContactAction, DeleteContacts, EditContactAction ,GetAllContacts} from  "./contactsServerActions";
import { Toaster, toast } from "react-hot-toast";

function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [isOpenAddContact, setIsOpenAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContactFile, setSelectedContactFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { shopUniqName } = params;

  // بهینه‌سازی refreshContacts با استفاده از useCallback
  const refreshContacts = useCallback(async () => {
    try {
      if (!shopUniqName) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const ShopId = await GetShopIdByShopUniqueName(shopUniqName);

      if (!ShopId.ShopID) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }

      const response = await GetAllContacts(ShopId.ShopID);

      setContacts(response.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("خطا در دریافت مخاطبها.");
    }
  }, [shopUniqName]);

  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  const handleDeleteContact = useCallback((contactId) => {
    setContacts((prevContacts) => prevContacts.filter(contact => contact._id !== contactId));
    toast.success("مخاطب با موفقیت حذف شد.");
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddContact(false);
      setSelectedContact(null);
      setSelectedContactFile(null); // ریست کردن فایل مخاطب
    }
  }, []);

  const handleEditClick = useCallback((contact) => {
    setSelectedContact(contact);
    setSelectedContactFile(null); // ریست کردن فایل مخاطب در حالت ویرایش
    setIsOpenAddContact(true);
  }, []);

  const handleAddContactClick = useCallback(() => {
    setIsOpenAddContact(true);
    setSelectedContact(null);
    setSelectedContactFile(null); // ریست کردن فایل مخاطب در حالت افزودن جدید
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddContact(false);
    setSelectedContact(null);
    setSelectedContactFile(null);
  }, []);

  return (
    <FormTemplate>
      {isOpenAddContact && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddContact
              contact={selectedContact}
              contactFile={selectedContactFile}
              onClose={handleCloseModal}
              refreshContacts={refreshContacts} // اضافه کردن این خط
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت مخاطبها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add contact"
            onClick={handleAddContactClick}
          >
            افزودن مخاطب
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {contacts.map((contact) => (
            <ContactCard
              className="p-2 md:p-4"
              key={contact._id}
              contact={contact}
              editFunction={() => handleEditClick(contact)}
              onDelete={() => handleDeleteContact(contact._id)} // پاس دادن تابع حذف
            />
          ))}
        </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default ContactManager;
