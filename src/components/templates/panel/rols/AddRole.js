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

function AddRole({ role = {}, onClose ,ShopId ,refreshRols}) {
  
  const [isSubmit, setIsSubmit] = useState(false);
  const [bannerPermissionState, setBannerPermissionState] = useState(role?.bannersPermissions || []);
  const [rolePermissionState, setRolePermissionState] = useState(role?.rolesPermissions || []);

  const { register, handleSubmit, setValue,formState: { errors } } = useForm({
    mode: "all",
    resolver: yupResolver(RoleSchema),
    defaultValues: {
      RoleStatus: role?.RoleStatus !== undefined ? role?.RoleStatus : true,
      RoleTitle: role?.RoleTitle || "",
      bannersPermissions: bannerPermissionState,
      rolesPermissions: rolePermissionState,
      ShopId:ShopId,
    },
  });

  useEffect(() => {
    setValue('bannersPermissions', bannerPermissionState);
    setValue('rolesPermissions', rolePermissionState);
    setValue('ShopId', ShopId); // تنظیم ShopId به صورت مخفی
  }, [bannerPermissionState, rolePermissionState, ShopId, setValue]);

  const handleTogglePermission = (permissionList, setPermissionList, name) => {
    if (permissionList.includes(name)) {
      setPermissionList(permissionList.filter(permission => permission !== name));
    } else {
      setPermissionList([...permissionList, name]);
    }
  };

  const formSubmitting = async (formData) => {
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

        <div className="flex gap-3 text-center">
          <div className="rounded-full bg-gray-300 dark:bg-zinc-600 h-[6rem] w-[6rem] text-sm md:text-lg md:h-32 md:w-32 flex items-center justify-center">
            <div className="flex items-center justify-center ">
              <p className="text-center mb-4 pt-5">بنر ها</p>
            </div>
          </div>
          <div className="flexCenter gap-2 md:gap-3 child-hover:text-orange-300">
            <PermissionSVG
              name="edit"
              permissions={bannerPermissionState}
              Icon="#EditSvg"
              onToggle={() => handleTogglePermission(bannerPermissionState, setBannerPermissionState, "edit")}
            />
            <PermissionSVG
              name="delete"
              permissions={bannerPermissionState}
              Icon="#DeleteSvg"
              onToggle={() => handleTogglePermission(bannerPermissionState, setBannerPermissionState, "delete")}
            />
            <PermissionSVG
              name="view"
              permissions={bannerPermissionState}
              Icon="#ViewDocumentSvg"
              onToggle={() => handleTogglePermission(bannerPermissionState, setBannerPermissionState, "view")}
            />
            <PermissionSVG
              name="add"
              permissions={bannerPermissionState}
              Icon="#CreateSvg"
              onToggle={() => handleTogglePermission(bannerPermissionState, setBannerPermissionState, "add")}
            /> 
    
          </div>
        </div>
        <div className="bg-orange-300 w-full h-[2px]"></div>

        <div className="flex gap-3 text-center">
          <div className="rounded-full bg-gray-300 dark:bg-zinc-600 h-[6rem] w-[6rem] text-sm md:text-lg md:h-32 md:w-32 flex items-center justify-center">
            <div className="flex items-center justify-center ">
              <p className="text-center mb-4 pt-5">نقش ها</p>
            </div>
          </div>
          <div className="flexCenter gap-2 md:gap-3 child-hover:text-orange-300">
            <PermissionSVG
              name="edit"
              permissions={rolePermissionState}
              Icon="#EditSvg"
              onToggle={() => handleTogglePermission(rolePermissionState, setRolePermissionState, "edit")}
            />
            <PermissionSVG
              name="delete"
              permissions={rolePermissionState}
              Icon="#DeleteSvg"
              onToggle={() => handleTogglePermission(rolePermissionState, setRolePermissionState, "delete")}
            />
            <PermissionSVG
              name="view"
              permissions={rolePermissionState}
              Icon="#ViewDocumentSvg"
              onToggle={() => handleTogglePermission(rolePermissionState, setRolePermissionState, "view")}
            />
            <PermissionSVG
              name="add"
              permissions={rolePermissionState}
              Icon="#CreateSvg"
              onToggle={() => handleTogglePermission(rolePermissionState, setRolePermissionState, "add")}
            />
          </div>
        </div>
        <div className="bg-orange-300 w-full h-[2px]"></div>

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
