"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import FinancialDocumentSchema from "./FinancialDocumentSchema";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Select, { components } from "react-select";
import { GetAccountsByStartingCharacter } from "../Account/accountActions";
import {
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

function AddFinancialDocument({
  financialDocument = {},
  onClose,
}) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { ShopId } = useParams();
  const router = useRouter();
  const [rebtorsOptions, setDebtorsOptions] = useState([]);
  const [selectedDebtors, setSelectedDebtors] = useState(new Set()); // وضعیت جدید برای حساب‌های انتخاب شده
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      Creditor: financialDocument?.Creditor || "",
      Debtor: financialDocument?.Debtor || "",
      ShopId: ShopId || "",
     
    },
    resolver: yupResolver(FinancialDocumentSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "pricingFormulas",
  });

  // تابع برای واکشی حساب‌ها و اضافه کردن گزینه "افزودن حساب جدید"
  const fetchDebtors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await GetAccountsByStartingCharacter(ShopId,"",'title', // پارامتر field را مشخص کنید

        ["صندوق","حساب عادی","حساب بانکی","اشخاص حقیقی","اشخاص حقوقی","حساب انتظامی"]);
      console.log(response);
      
      if (response.Accounts && Array.isArray(response.Accounts)) {
        const options = response.Accounts.map((Account) => ({
          value: Account._id,
          label: Account.AccountTitle,
        }));
        // افزودن گزینه "افزودن حساب جدید"
        setDebtorsOptions([...options]);
      } else {
        throw new Error("داده‌های حساب ها به درستی دریافت نشده‌اند.");
      }
    } catch (error) {
      console.error("خطا در واکشی حساب ها:", error);
      toast.error("مشکلی در واکشی حساب ها وجود دارد.");
    } finally {
      setIsLoading(false);
    }
  }, [ShopId]);

  useEffect(() => {
    if (ShopId) {
      fetchDebtors();
    }
  }, [ShopId, fetchDebtors]);

  // هندلر تغییر حساب‌ها
  const handleRebtorChange = (selectedOptions, index) => {
    // بررسی اگر گزینه "افزودن حساب جدید" انتخاب شده باشد
    const isAddNewSelected = selectedOptions.some(option => option.value === 'add_new');

    if (isAddNewSelected) {
      // هدایت به صفحه افزودن حساب جدید
      router.push(`/${ShopId}/panel/account`);
      
      // حذف گزینه "افزودن حساب جدید" از انتخاب‌ها
      const filteredOptions = selectedOptions.filter(option => option.value !== 'add_new');
      const selectedValues = filteredOptions.map(option => option.value);

      // به‌روزرسانی وضعیت انتخاب شده‌ها
      const newSelectedDebtors = new Set(selectedDebtors);
      // حذف حساب‌های قبلاً انتخاب شده
      fields[index].rebtors.forEach((rebtor) => {
        newSelectedDebtors.delete(rebtor);
      });

      // افزودن حساب‌های جدید
      selectedValues.forEach((rebtor) => {
        newSelectedDebtors.add(rebtor);
      });

      setSelectedDebtors(newSelectedDebtors);
      setValue(`pricingFormulas.${index}.rebtors`, selectedValues);

      // به‌روزرسانی آرایه فرمول‌ها
      const updatedFormulas = fields.map((field, i) => {
        if (i === index) {
          return {
            ...field,
            rebtors: selectedValues, // اطمینان از این که حساب‌های به‌روز شده استفاده شوند
          };
        }
        return field;
      });

      // به‌روزرسانی آرایه فرمول‌ها
      if (updatedFormulas[index]) {
        update(index, updatedFormulas[index]);
      }
    } else {
      const selectedValues = selectedOptions.map((option) => option.value);

      // به‌روزرسانی وضعیت selectedDebtors
      const newSelectedDebtors = new Set(selectedDebtors);

      // حذف حساب‌های قبلاً انتخاب شده
      fields[index].rebtors.forEach((rebtor) => {
        newSelectedDebtors.delete(rebtor);
      });

      // افزودن حساب‌های جدید
      selectedValues.forEach((rebtor) => {
        newSelectedDebtors.add(rebtor);
      });

      setSelectedDebtors(newSelectedDebtors);
      setValue(`pricingFormulas.${index}.rebtors`, selectedValues);

      // به‌روزرسانی فرمول‌ها
      const updatedFormulas = fields.map((field, i) => {
        if (i === index) {
          return {
            ...field,
            rebtors: selectedValues, // اطمینان از این که حساب‌های به‌روز شده استفاده شوند
          };
        }
        return field;
      });

      // به‌روزرسانی آرایه فرمول‌ها
      if (updatedFormulas[index]) {
        update(index, updatedFormulas[index]);
      }
    }
  };

  // تابع بازگشت لیست حساب‌های در دسترس برای هر فرمول
  const getAvailableDebtors = (index) => {
    const usedDebtors = fields.flatMap((field, i) =>
      i !== index ? field.rebtors : []
    );
    return rebtorsOptions.filter(
      (option) =>
        !usedDebtors.includes(option.value) && !selectedDebtors.has(option.value)
    );
  };

 

  const formSubmitting = async (formData) => {
console.log(formData);

  };

  // کامپوننت سفارشی برای افزودن گزینه "افزودن حساب جدید" در لیست
  const CustomMenuList = (props) => {
    return (
      <>
        <components.MenuList {...props}>
          {props.children}
        </components.MenuList>
        <div
          style={{
            padding: '10px',
            cursor: 'pointer',
            borderTop: '1px solid #ccc',
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            router.push(`/${ShopId}/panel/account`);
          }}
          className="hover:bg-gray-200 transition-colors"
        >
          افزودن حساب جدید  
               </div>
      </>
    );
  };

  return (
    <div className="overflow-y-auto max-h-screen p-4 ">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <HashLoader color="#4A90E2" size={50} />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {financialDocument?._id ? "ویرایش سند مالی" : "افزودن سند مالی"}
            </h1>
            <button
              aria-label="close"
              className="hover:text-orange-300 transition-colors"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(formSubmitting)}
            className="flex flex-col gap-6 p-6 rounded-lg shadow-md"
          >
            <div>
              <label className="block mb-4 font-semibold">طرف حساب های بدهکار</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex justify-between border p-4 mb-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block mb-2">حساب</label>
                    <Controller
                      name={`pricingFormulas.${index}.rebtors`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Select
                          isMulti
                          options={getAvailableDebtors(index)}
                          value={rebtorsOptions.filter((option) =>
                            controllerField.value.includes(option.value)
                          )}
                          onChange={(selectedOptions) =>
                            handleRebtorChange(selectedOptions, index)
                          }
                          components={{ MenuList: CustomMenuList }}
                          className="select bg-gray-300 dark:bg-zinc-600 "
                          classNamePrefix="select bg-gray-300 dark:bg-zinc-600 "
                          placeholder="حسابهای بدهکار را انتخاب کنید"
                        />
                      )}
                    />
                  </div>
                  <div>
              <label className="block mb-2">مبلغ بدهکار</label>
              <input
                type="text"
                {...register("Debtor")}
                className={`w-full border bg-gray-300 dark:bg-zinc-600 ${
                  errors.Debtor ? "border-red-400" : "border-gray-300"
                } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="مبلغ"
                required
              />
              {errors.Debtor && (
                <p className="text-red-400 text-sm mt-1">{errors.Debtor.message}</p>
              )}
            </div>
                 
                  
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ rebtors: [], formula: "" })}
                className="text-teal-500"
              >
                افزودن حساب بدهکار
              </button>
            </div> 
            {/* //////////////////////////////////////////////////////////////// */}
             <div>
              <label className="block mb-4 font-semibold">طرف حساب های بستانکار</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex justify-between border p-4 mb-4 rounded-lg">
                  <div className="mb-4">
                    <label className="block mb-2">حساب</label>
                    <Controller
                      name={`pricingFormulas.${index}.rebtors`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <Select
                          isMulti
                          options={getAvailableDebtors(index)}
                          value={rebtorsOptions.filter((option) =>
                            controllerField.value.includes(option.value)
                          )}
                          onChange={(selectedOptions) =>
                            handleRebtorChange(selectedOptions, index)
                          }
                          components={{ MenuList: CustomMenuList }}
                          className="select bg-gray-300 dark:bg-zinc-600 "
                          classNamePrefix="select bg-gray-300 dark:bg-zinc-600 "
                          placeholder="حسابهای بستانکار را انتخاب کنید"
                        />
                      )}
                    />
                  </div>

                  <div>
              <label className="block mb-2">مبلغ بستانکار</label>
              <input
                type="text"
                {...register("Creditor")}
                className={`w-full border bg-gray-300 dark:bg-zinc-600 ${
                  errors.Creditor ? "border-red-400" : "border-gray-300"
                } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="مبلغ"
                required
              />
              {errors.Creditor && (
                <p className="text-red-400 text-sm mt-1">{errors.Creditor.message}</p>
              )}
            </div>
                  
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ rebtors: [], formula: "" })}
                className="text-teal-500"
              >
                افزودن حساب بستانکار
              </button>
            </div>



            <button
              type="submit"
              disabled={isSubmit}
              className={`mt-4 bg-teal-500 text-white py-2 px-4 rounded ${
                isSubmit ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmit ? <HashLoader color="white" size={20} /> : "ذخیره"}
            </button>
          </form>

          <Toaster />
        </div>
      )}
    </div>
  );
}

export default AddFinancialDocument;
