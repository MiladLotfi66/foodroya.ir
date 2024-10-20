// AddAccount.jsx
"use client";
import { useForm } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import AccountSchema from "./AccountSchema";
import { useEffect, useState } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { createAccount, updateAccount } from "./accountActions";
import { useParams } from 'next/navigation';

function AddAccount({ account = null, parentAccount = null, onClose, refreshAccounts }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "all",
    defaultValues: {
      title: account?.title || "",
      accountType: account?.accountType || "حساب عادی",
      accountStatus: account?.accountStatus || "فعال",
    },
    resolver: yupResolver(AccountSchema),
  });

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      await AccountSchema.validate(formData, { abortEarly: false });

      let result;
      if (account?._id) {
        // ویرایش حساب
        result = await updateAccount(account._id, {
          ...formData,
        //   store: shopUniqName,
          parentAccount: account.parentAccount, // از پراپ ارسال شده
        });
        console.log("result",result);
        
      } else {
        // ایجاد حساب جدید
        if (!parentAccount) {
          throw new Error("حساب والد برای ایجاد حساب جدید ضروری است.");
        }
        result = await createAccount({
          ...formData,
          store: shopUniqName,
          parentAccount: parentAccount.id, // استفاده از حساب والد ارسال شده
        });
      }

      if (result.success) {
        await refreshAccounts();
        const successMessage = account && account._id ? "حساب با موفقیت ویرایش شد!" : "حساب با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        const errorMessage = account && account._id ? "خطایی در ویرایش حساب رخ داد." : "خطایی در ایجاد حساب رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error handling account:", error);
      toast.error(error.message || "مشکلی در پردازش حساب وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="overflow-y-auto max-h-screen">
      <div className="hidden">
        {/* اگر نیاز به SVG دارید می‌توانید اضافه کنید */}
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
          {account?._id ? "ویرایش حساب" : "افزودن حساب"}
        </h1>
      </div>

      {/* نمایش اطلاعات حساب والد در حالت افزودن حساب جدید */}
      {!account && parentAccount && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p><strong>حساب والد:</strong> {parentAccount.title}</p>
          <p><strong>کدینگ حساب والد:</strong> {parentAccount.accountCode}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* عنوان حساب */}
        <div>
          <label className="block mb-1">عنوان حساب</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        </div>

        {/* نوع حساب */}
        <div>
          <label className="block mb-1">نوع حساب</label>
          <select
            {...register("accountType")}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="صندوق">صندوق</option>
            <option value="حساب عادی">حساب عادی</option>
            <option value="حساب بانکی">حساب بانکی</option>
            <option value="کالا">کالا</option>
            <option value="دسته بندی کالا">دسته بندی کالا</option>
            <option value="اشخاص حقیقی">اشخاص حقیقی</option>
            <option value="اشخاص حقوقی">اشخاص حقوقی</option>
          </select>
          {errors.accountType && <p className="text-red-500">{errors.accountType.message}</p>}
        </div>

        {/* وضعیت حساب */}
        <div>
          <label className="block mb-1">وضعیت حساب</label>
          <select
            {...register("accountStatus")}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="فعال">فعال</option>
            <option value="غیر فعال">غیر فعال</option>
          </select>
          {errors.accountStatus && <p className="text-red-500">{errors.accountStatus.message}</p>}
        </div>

        {/* سایر فیلدهای مربوط به حساب می‌تواند اینجا اضافه شود */}

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          disabled={isSubmit}
        >
          {isSubmit ? <HashLoader size={20} color="#fff" /> : (account?._id ? "ویرایش حساب" : "افزودن حساب")}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddAccount;
