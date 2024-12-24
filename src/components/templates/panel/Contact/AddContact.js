// app/Contact/AddContact.js
"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader"; // در صورت نیاز به Loader
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import ContactSchema from "./ContactSchema";
import { useEffect, useState } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from "next/navigation";
import { AddContactAction, EditContactAction } from "./contactsServerActions";
import UserSelector from "@/module/User/UserSelector"; // وارد کردن کامپوننت UserSelector
import UserMiniInfo from "@/module/home/UserMiniInfo";
import { AddRoleToContact, GetShopRolesByShopId, RemoveContactFromRole } from "../rols/RolesPermissionActions";

function AddContact({ contact = {}, onClose, refreshContacts }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { ShopId } = useParams();
  const [isUserSelectorOpen, setIsUserSelectorOpen] = useState(false); // کنترل باز بودن UserSelector
  const [selectedUser, setSelectedUser] = useState(
    contact?.userAccount || null
  ); // State to store selected User
  const [allRoles, setAllRoles] = useState([]); // لیست تمام نقش‌ها
  const [contactRoles, setContactRoles] = useState([]); // نقش‌های مخاطب
  const [isRolesLoading, setIsRolesLoading] = useState(false); // وضعیت بارگذاری نقش‌ها

  // مقداردهی صحیح contactRoles از RolesId
  useEffect(() => {
    if (contact?.RolesId) {
      if (Array.isArray(contact.RolesId) && typeof contact.RolesId[0] === 'object') {
        // اگر RolesId شامل اشیاء نقش باشد، شناسه‌های آنها را استخراج کنید
        const roleIds = contact.RolesId.map(role => role._id.toString());
        setContactRoles(roleIds);
      } else {
        // در غیر این صورت، به عنوان شناسه‌های مستقیم در نظر بگیرید
        setContactRoles(contact.RolesId.map(role => role.toString()));
      }
    } else {
      setContactRoles([]);
    }
  }, [contact]);

  const fetchRoles = async () => {
    setIsRolesLoading(true);
    try {
      const response = await GetShopRolesByShopId(ShopId);
      if (response.status === 200) {
        // تبدیل _id نقش‌ها به رشته‌ها
        const roles = response.Roles.map(role => ({
          ...role,
          _id: role._id.toString(),
        }));
        setAllRoles(roles);
      } else {
        toast.error("خطا در دریافت نقش‌ها");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("خطا در دریافت نقش‌ها");
    } finally {
      setIsRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [ShopId]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      name: contact?.name || "",
      roles: contactRoles, // اکنون contactRoles به درستی تنظیم شده است
      economicCode: contact?.economicCode || "",
      userAccount: selectedUser,
      address: contact?.address || "",
      phoneNumber: contact?.phone || "",
      email: contact?.email || "",
      nationalId: contact?.nationalId || "",
      ShopId: ShopId || "",
    },
    resolver: yupResolver(ContactSchema),
  });

  // همگام‌سازی contactRoles با فرم
  useEffect(() => {
    setValue("roles", contactRoles);
  }, [contactRoles, setValue]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await ContactSchema.validate(formData, { abortEarly: false });

      const formDataObj = new FormData();

      formDataObj.append("ShopId", formData.ShopId);
      formDataObj.append("name", formData.name);
      formDataObj.append("address", formData.address);
      formDataObj.append("phoneNumber", formData.phoneNumber);
      formDataObj.append("email", formData.email);
      formDataObj.append("nationalId", formData.nationalId);
      formDataObj.append("economicCode", formData.economicCode);
      if (selectedUser) {
        formDataObj.append("userAccount", selectedUser?._id);
      }
      if (contact?._id) {
        formDataObj.append("id", contact._id);
      }
      // اضافه کردن نقش‌ها به FormData
      if (formData.roles && formData.roles.length > 0) {
        formData.roles.forEach(roleId => {
          formDataObj.append("roles", roleId);
        });
      }

      let result;
      if (contact?._id) {
        // اگر مخاطب برای ویرایش است
        result = await EditContactAction(formDataObj, ShopId);
      } else {
        // اگر مخاطب جدید باشد
        result = await AddContactAction(formDataObj, ShopId);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshContacts();
        const successMessage =
          contact && contact._id
            ? "مخاطب با موفقیت ویرایش شد!"
            : "مخاطب با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error handling contact:", error);
      toast.error("مشکلی در پردازش مخاطب وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formSubmitting = async (formData) => {
    await handleFormSubmit(formData);
  };

  // تابع برای دریافت کاربر انتخاب شده
  const handleUserSelect = (user) => {
    setValue("userAccount", user._id);
    setSelectedUser(user); // تنظیم کاربر انتخاب شده
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        <CloseSvg />
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button
          aria-label="close"
          className="hover:text-orange-300"
          onClick={onClose}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {contact?._id ? "ویرایش مخاطب" : "افزودن مخاطب"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(formSubmitting)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* فیلد نام */}
        <div>
          <label className="block mb-1">نام</label>
          <input
            type="text"
            {...register("name", {
              required: "نام الزامی است",
              minLength: {
                value: 2,
                message: "نام باید حداقل 2 حرف باشد",
              },
            })}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        {/* بخش نقش‌ها */}
        <div>
          <label className="block mb-1">نقش‌ها</label>
          {isRolesLoading ? (
            <HashLoader size={20} color="#123abc" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {allRoles.map((role) => (
                <div key={role._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`role-${role._id}`}
                    checked={contactRoles.includes(role._id)}
                    onChange={(e) => {
                      const roleId = role._id;
                      if (e.target.checked) {
                        setContactRoles([...contactRoles, roleId]);
                      } else {
                        setContactRoles(contactRoles.filter(r => r !== roleId));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`role-${role._id}`}>{role.RoleTitle}</label>
                </div>
              ))}
            </div>
          )}
          {errors.roles && <p className="text-red-500">{errors.roles.message}</p>}
        </div>

        {/* فیلد کد اقتصادی */}
        <div>
          <label className="block mb-1">کد اقتصادی</label>
          <input
            type="text"
            {...register("economicCode", {
              minLength: {
                value: 10,
                message: "کد اقتصادی باید حداقل 10 رقم باشد",
              },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.economicCode && (
            <p className="text-red-500">{errors.economicCode.message}</p>
          )}
        </div>

        {/* فیلد کاربر با نمایش UserMiniInfo */}
        <div className="relative">
          <label htmlFor="userAccount" className="block mb-1">
            کاربر
          </label>
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <UserMiniInfo
                userImage={selectedUser.userImage}
                name={selectedUser.name}
                username={selectedUser.userUniqName}
              />

              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  setSelectedUser(null);
                  setValue("userAccount", "");
                  setIsUserSelectorOpen(true);
                }}
              >
                تغییر کاربر
              </button>
              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => setSelectedUser(null)}
              >
                حذف
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setIsUserSelectorOpen(true)}
            >
              انتخاب
            </button>
          )}
          {errors.userAccount && (
            <p className="text-red-500">{errors.userAccount.message}</p>
          )}
        </div>

        {/* فیلد آدرس */}
        <div>
          <label className="block mb-1">آدرس</label>
          <input
            type="text"
            {...register("address", {
              minLength: {
                value: 5,
                message: "آدرس باید حداقل 5 حرف باشد",
              },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.address && (
            <p className="text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* فیلد شماره تماس */}
        <div>
          <label className="block mb-1">شماره تماس</label>
          <input
            type="text"
            {...register("phoneNumber", {
              required: "شماره تماس الزامی است",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "شماره تماس باید 10 رقم باشد",
              },
            })}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.phoneNumber && (
            <p className="text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* فیلد ایمیل */}
        <div>
          <label className="block mb-1">ایمیل</label>
          <input
            type="email"
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "ایمیل نامعتبر است",
              },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* فیلد شناسه ملی */}
        <div>
          <label className="block mb-1">شناسه ملی</label>
          <input
            type="text"
            {...register("nationalId", {
              pattern: {
                value: /^[0-9]{10}$/,
                message: "شناسه ملی باید 10 رقم باشد",
              },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.nationalId && (
            <p className="text-red-500">{errors.nationalId.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          disabled={isSubmit}
        >
          {isSubmit ? (
            <HashLoader size={20} color="#fff" />
          ) : contact?._id ? (
            "ویرایش مخاطب"
          ) : (
            "افزودن مخاطب"
          )}
        </button>
        <Toaster />
      </form>

      {/* کامپوننت UserSelector */}
      <UserSelector
        isOpen={isUserSelectorOpen}
        onClose={() => setIsUserSelectorOpen(false)}
        onSelect={handleUserSelect}
      />
    </div>
  );
}

export default AddContact;
