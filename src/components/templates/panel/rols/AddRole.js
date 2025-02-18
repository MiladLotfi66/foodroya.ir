"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import RoleSchema from "@/utils/yupSchemas/RoleSchema";
import CloseSvg from "@/module/svgs/CloseSvg";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import CreateSvg from "@/module/svgs/CreateSvg";
import ViewDocumentSvg from "@/module/svgs/ViewDocumentSvg"; 
import PermissionSVG from "./PermissionSVG";
import { useState, useEffect } from "react";
import { AddRoleServerAction, EditRole } from "./RolesPermissionActions";
import PermissionsSection from "./PermissionsSection";

function AddRole({ role = {}, onClose ,ShopId ,refreshRols}) {
  
  const [isSubmit, setIsSubmit] = useState(false);
  const [bannerPermissionState, setBannerPermissionState] = useState(role?.bannersPermissions || []);
  const [rolePermissionState, setRolePermissionState] = useState(role?.rolesPermissions || []);
  const [sendMethodPermissionState, setSendMethodPermissionState] = useState(role?.sendMethodPermissions || []);
  const [accountsPermissionState,setAccountsPermissionState] = useState(role?.accountsPermissions || []);
  const [contactsPermissionState,setContactsPermissionState] = useState(role?.contactsPermissions || []);
  const [priceTemplatesPermissionState,setPriceTemplatesPermissionState] = useState(role?.priceTemplatesPermissions || []);
  const [productsPermissionState,setProductsPermissionState] = useState(role?.productsPermissions || []);
  const [financialDocumentsPermissionState,setFinancialDocumentsPermissionState] = useState(role?.financialDocumentsPermissions || []);
  const [sendMethodsPermissionState,setSendMethodsPermissionState] = useState(role?.sendMethodsPermissions || []);
  const [purchaseInvoicesPermissionState,setPurchaseInvoicesPermissionState] = useState(role?.purchaseInvoicesPermissions || []);
  const [saleInvoicesPermissionState,setSaleInvoicesPermissionState] = useState(role?.saleInvoicesPermissions || []);
  const [purchaseReturnInvoicesPermissionState,setPurchaseReturnInvoicesPermissionState] = useState(role?.purchaseReturnInvoicesPermissions || []);
  const [saleReturnInvoicesPermissionState,setSaleReturnInvoicesPermissionState] = useState(role?.saleReturnInvoicesPermissions || []);
  const [wasteInvoicesPermissionState,setWasteInvoicesPermissionState] = useState(role?.wasteInvoicesPermissions || []);
  const [allInvoicesPermissionState,setAllInvoicesPermissionState] = useState(role?.allInvoicesPermissions || []);

  const { register, handleSubmit, setValue,formState: { errors } } = useForm({
    mode: "all",
    resolver: yupResolver(RoleSchema),
    defaultValues: {
      RoleStatus: role?.RoleStatus !== undefined ? role?.RoleStatus : true,
      RoleTitle: role?.RoleTitle || "",
      bannersPermissions: bannerPermissionState,
      rolesPermissions: rolePermissionState,
      sendMethodPermissions: sendMethodPermissionState,
      accountsPermissions: accountsPermissionState,
      contactsPermissions: contactsPermissionState,
      priceTemplatesPermissions: priceTemplatesPermissionState,
      productsPermissions: productsPermissionState,
      financialDocumentsPermissions: financialDocumentsPermissionState,
      sendMethodsPermissions: sendMethodsPermissionState,
      purchaseInvoicesPermissions: purchaseInvoicesPermissionState,
      saleInvoicesPermissions: saleInvoicesPermissionState,
      purchaseReturnInvoicesPermissions: purchaseReturnInvoicesPermissionState,
      saleReturnInvoicesPermissions: saleReturnInvoicesPermissionState,
      wasteInvoicesPermissions: wasteInvoicesPermissionState,
      allInvoicesPermissions: allInvoicesPermissionState,
      ShopId:ShopId,
    },
  });

  useEffect(() => {
    setValue('bannersPermissions', bannerPermissionState);
    setValue('rolesPermissions', rolePermissionState);
    setValue('sendMethodPermissions', sendMethodPermissionState);
    setValue('accountsPermissions',accountsPermissionState);
    setValue('contactsPermissions',contactsPermissionState);
    setValue('priceTemplatesPermissions',priceTemplatesPermissionState);
    setValue('productsPermissions',productsPermissionState);
    setValue('financialDocumentsPermissions',financialDocumentsPermissionState);
    setValue('sendMethodsPermissions',sendMethodsPermissionState);
    setValue('purchaseInvoicesPermissions',purchaseInvoicesPermissionState);
    setValue('saleInvoicesPermissions',saleInvoicesPermissionState);
    setValue('purchaseReturnInvoicesPermissions',purchaseReturnInvoicesPermissionState);
    setValue('saleReturnInvoicesPermissions',saleReturnInvoicesPermissionState);
    setValue('wasteInvoicesPermissions',wasteInvoicesPermissionState);
    setValue('allInvoicesPermissions',allInvoicesPermissionState);
    setValue('ShopId', ShopId); // تنظیم ShopId به صورت مخفی
  }, [bannerPermissionState, rolePermissionState,sendMethodPermissionState,accountsPermissionState,contactsPermissionState,priceTemplatesPermissionState,productsPermissionState,financialDocumentsPermissionState,sendMethodsPermissionState,
     purchaseInvoicesPermissionState,saleInvoicesPermissionState,purchaseReturnInvoicesPermissionState,saleReturnInvoicesPermissionState,
     wasteInvoicesPermissionState,allInvoicesPermissionState,ShopId, setValue]);

//////////////////////////////////////////////
const permissionsConfig = [
  {
    title: "بنر ها",
    permissions: bannerPermissionState,
    setPermissions: setBannerPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "نقش ها",
    permissions: rolePermissionState,
    setPermissions: setRolePermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "روش ارسال",
    permissions: sendMethodPermissionState,
    setPermissions: setSendMethodPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "حسابها",
    permissions: accountsPermissionState,
    setPermissions: setAccountsPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "مخاطبین",
    permissions: contactsPermissionState,
    setPermissions: setContactsPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "قالب های قیمت",
    permissions: priceTemplatesPermissionState,
    setPermissions: setPriceTemplatesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "محصولات",
    permissions: productsPermissionState,
    setPermissions: setProductsPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "اسناد مالی",
    permissions: financialDocumentsPermissionState,
    setPermissions: setFinancialDocumentsPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "روش های ارسال",
    permissions: sendMethodsPermissionState,
    setPermissions: setSendMethodsPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور خرید",
    permissions: purchaseInvoicesPermissionState,
    setPermissions: setPurchaseInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور فروش",
    permissions: saleInvoicesPermissionState,
    setPermissions: setSaleInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور خرید",
    permissions: purchaseReturnInvoicesPermissionState,
    setPermissions: setPurchaseReturnInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور فروش",
    permissions: saleReturnInvoicesPermissionState,
    setPermissions: setSaleReturnInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور ضایعات",
    permissions: wasteInvoicesPermissionState,
    setPermissions: setWasteInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  {
    title: "فاکتور ها",
    permissions: allInvoicesPermissionState,
    setPermissions: setAllInvoicesPermissionState,
    icons: [
      { name: "edit", icon: "#EditSvg" },
      { name: "delete", icon: "#DeleteSvg" },
      { name: "view", icon: "#ViewDocumentSvg" },
      { name: "add", icon: "#CreateSvg" },
    ],
  },
  // می‌توانید بخش‌های بیشتری اضافه کنید
];




  const formSubmitting = async (formData) => {
    console.log("formData",formData);
    
    setIsSubmit(true);
  
    try {
      await RoleSchema.validate(formData, { abortEarly: false });
  
      let res;
      // بررسی می‌کنیم که آیا در حالت ویرایش هستیم یا در حال افزودن نقش جدید
      if (role?._id) {
        // درخواست ویرایش نقش را ارسال کنید
        res = await EditRole(formData, role._id);
        
      } else {
        // درخواست ایجاد نقش جدید را ارسال کنید
        res = await AddRoleServerAction(formData);
      }
  
      if (res.status === 200 || res.status === 201) {
        refreshRols();  // به‌روزرسانی لیست نقش‌ها
        if (role?._id) {
          toast.success("ویرایبش با موفقیت انجام شد");
        } else {
          // درخواست ایجاد نقش جدید را ارسال کنید
        toast.success(" نقش جدید با موفقیت ثبت شد");
      }
      onClose();      // بستن پنجره مودال

      } else {
        toast.error(res.error || "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error(error.message || "خطایی در ارسال درخواست به سرور رخ داد");
    } finally {
      setIsSubmit(false);
    }
  };
  

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        <CloseSvg />
        <EditSvg />
        <DeleteSvg />
        <CreateSvg />
        <ViewDocumentSvg/>
      </div>

      <div className="flex justify-between p-2 md:p-5 mt-4">
        <button aria-label="close" className="hover:text-orange-300" onClick={onClose}>
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>

        <h1 className="text-3xl font-MorabbaBold">
          {role?._id ? "ویرایش نقش" : "افزودن نقش"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          formSubmitting(data);
        })}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        <div className="flex items-center">
          <label htmlFor="RoleStatus" className="w-1/5 text-xs md:text-sm">
            وضعیت نقش
          </label>
          <input
            className="inputStyle w-1/5"
            type="checkbox"
            name="RoleStatus"
            id="RoleStatus"
            {...register("RoleStatus")}
          />
        </div>

        <div className="flex items-center mb-3">
          <label htmlFor="RoleTitle" className="w-1/5 text-xs md:text-sm">
            عنوان نقش
          </label>
          <input
            className="inputStyle grow w-4/5"
            type="text"
            name="RoleTitle"
            id="RoleTitle"
            {...register("RoleTitle")}
          />
        </div>
        {errors.RoleTitle && (
          <div className="text-xs text-red-400">{errors.RoleTitle.message}</div>
        )}
        <p className="items-center text-center">تعیین سطوح دسترسی</p>
        <div className="bg-orange-300 w-full h-[2px]"></div>
        {permissionsConfig.map((config) => (
          <div key={config.title}>
            <PermissionsSection
              title={config.title}
              permissions={config.permissions}
              setPermissions={config.setPermissions}
              icons={config.icons}
            />
            <div className="bg-orange-300 w-full h-[2px] my-4"></div>
          </div>
        ))}

       

        <button
          type="submit"
          className={
            isSubmit
              ? "flexCenter gap-x-2 h-11 md:h-14 bg-gray-400 rounded-xl text-white mt-4"
              : "h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4"
          }
          disabled={isSubmit}
        >
          {isSubmit ? "در حال ثبت" : "ثبت"}
          {isSubmit ? <HashLoader size={25} color="#fff" /> : ""}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddRole;
