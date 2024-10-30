"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import PriceTemplateSchema from "./PriceTemplateSchema";
import { useEffect, useState } from "react";
import CloseSvg from "@/module/svgs/CloseSvg";
import { useParams } from 'next/navigation';
import { AddPriceTemplateAction, EditPriceTemplateAction } from "./PriceTemplateActions";
import Select from 'react-select';
import { GetShopRolesByShopUniqName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import FormulaBuilderModal from "./FormulaBuilderModal"; // وارد کردن کامپوننت مودال
function AddPriceTemplate({ priceTemplate = {}, onClose, refreshPriceTemplates }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();
  const [rolesOptions, setRolesOptions] = useState([]);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(null);
const variable=["میانگین قیمت خرید ارزی"   , "آخرین قیمت خرید ارزی","میانگین قیمت خرید به ارز پایه"   , "آخرین قیمت خرید به ارز پایه"]
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: "all",
    defaultValues: {
      name: priceTemplate?.title || "",
      status: priceTemplate?.status || "فعال",
      shopUniqName: shopUniqName || "",
      pricingFormulas: priceTemplate?.pricingFormulas?.length > 0 ? priceTemplate.pricingFormulas.map(formula => ({
        roles: formula.roles.map(role => role._id),
        formula: formula.formula,
      })) : [{ roles: [], formula: "" }],
      defaultFormula: priceTemplate?.defaultFormula || "",
    },
    resolver: yupResolver(PriceTemplateSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "pricingFormulas",
  });

  // واکشی نقش‌ها از سرور
  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await GetShopRolesByShopUniqName(shopUniqName);
        console.log("response", response);
        
        if (response.Roles && Array.isArray(response.Roles)) {
          const options = response.Roles.map(role => ({
            value: role._id,
            label: role.RoleTitle,
          }));
          setRolesOptions(options);
        } else {
          throw new Error("داده‌های نقش‌ها به درستی دریافت نشده‌اند.");
        }
      } catch (error) {
        console.error("خطا در واکشی نقش‌ها:", error);
        toast.error("مشکلی در واکشی نقش‌ها وجود دارد.");
      }
    }

    if (shopUniqName) {
      fetchRoles();
    }
  }, [shopUniqName]);

  // دیباگ کردن مقادیر فرم
  const watchedFields = watch();
  useEffect(() => {
    console.log("Watched Fields:", watchedFields);
  }, [watchedFields]);

  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      const formattedData = {
        title: formData.name,
        status: formData.status,
        shopUniqName: formData.shopUniqName,
        pricingFormulas: formData.pricingFormulas.map(formula => ({
          roles: formula.roles,
          formula: formula.formula,
        })),
        defaultFormula: formData.defaultFormula,
      };

      const formDataObj = new FormData();
      formDataObj.append("shopUniqName", formattedData.shopUniqName);
      formDataObj.append("title", formattedData.title);
      formDataObj.append("status", formattedData.status);
      formDataObj.append("defaultFormula", formattedData.defaultFormula);

      // اضافه کردن فرمول‌های قیمت
      formattedData.pricingFormulas.forEach((formula, index) => {
        formDataObj.append(`pricingFormulas[${index}][roles]`, JSON.stringify(formula.roles));
        formDataObj.append(`pricingFormulas[${index}][formula]`, formula.formula);
      });

      if (priceTemplate?._id) {
        formDataObj.append("id", priceTemplate._id);
      }

      let result;
      if (priceTemplate?._id) {
        result = await EditPriceTemplateAction(formDataObj, shopUniqName);
      } else {
        result = await AddPriceTemplateAction(formDataObj);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshPriceTemplates();
        const successMessage = priceTemplate && priceTemplate._id ? "قالب قیمتی با موفقیت ویرایش شد!" : "قالب قیمتی با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        toast.error(result.message || "خطایی در پردازش قالب قیمتی رخ داد.");
      }
    } catch (error) {
      console.error("Error handling price template:", error);
      toast.error("مشکلی در پردازش قالب قیمتی وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formSubmitting = async (formData) => {
    await handleFormSubmit(formData);
  };

  // تابع برای باز کردن مودال فرمول
  const openFormulaModal = (index) => {
    setCurrentFormulaIndex(index);
    setIsFormulaModalOpen(true);
  };

  // تابع برای ذخیره فرمول از مودال
  const saveFormula = (formula) => {
    if (currentFormulaIndex !== null) {
      update(currentFormulaIndex, {
        ...fields[currentFormulaIndex],
        formula,
      });
      setIsFormulaModalOpen(false);
      setCurrentFormulaIndex(null);
    }
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
          {priceTemplate?._id ? "ویرایش قالب قیمتی" : "افزودن قالب قیمتی"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(formSubmitting)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* فیلد نام قالب قیمتی */}
        <div>
          <label className="block mb-1">نام قالب قیمتی</label>
          <input
            type="text"
            {...register("name")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        {/* فیلد وضعیت */}
        <div>
          <label className="block mb-1">وضعیت</label>
          <select
            {...register("status")}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="فعال">فعال</option>
            <option value="غیرفعال">غیرفعال</option>
          </select>
          {errors.status && <p className="text-red-500">{errors.status.message}</p>}
        </div>

        {/* فیلدهای فرمول‌های قیمت */}
        <div>
          <label className="block mb-2 font-semibold">فرمول‌های قیمت</label>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-3 mb-3 rounded">
              {/* انتخاب نقش‌ها */}
              <div className="mb-2">
                <label className="block mb-1">نقش‌ها</label>
                <Controller
                  name={`pricingFormulas.${index}.roles`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Select
                      isMulti
                      options={rolesOptions}
                      value={rolesOptions.filter(option => controllerField.value.includes(option.value))}
                      onChange={(selectedOptions) => {
                        const selectedValues = selectedOptions.map(option => option.value);
                        controllerField.onChange(selectedValues);
                      }}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.pricingFormulas?.[index]?.roles && (
                  <p className="text-red-500">{errors.pricingFormulas[index].roles.message}</p>
                )}
              </div>

              {/* فیلد فرمول */}
              <div className="mb-2 flex items-center">
                <label className="block mb-1 flex-1">فرمول قیمت</label>
                <button
                  type="button"
                  onClick={() => openFormulaModal(index)}
                  className="bg-blue-500 text-white px-3 py-1 rounded ml-2"
                >
                  ویرایش فرمول
                </button>
              </div>
              <div className="w-full border rounded px-3 py-2 bg-gray-100">
                {fields[index].formula || "فرمولی وارد نشده است."}
              </div>
              {errors.pricingFormulas?.[index]?.formula && (
                <p className="text-red-500">{errors.pricingFormulas[index].formula.message}</p>
              )}

              {/* دکمه حذف فرمول */}
              <button
                type="button"
                onClick={() => remove(index)}
                className="bg-red-500 text-white px-3 py-1 rounded mt-2"
              >
                حذف فرمول
              </button>
            </div>
          ))}

          {/* دکمه اضافه کردن فرمول جدید */}
          <button
            type="button"
            onClick={() => append({ roles: [], formula: "" })}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            اضافه کردن فرمول قیمت جدید
          </button>

          {errors.pricingFormulas && typeof errors.pricingFormulas.message === 'string' && (
            <p className="text-red-500">{errors.pricingFormulas.message}</p>
          )}
        </div>

        {/* فیلد فرمول پیش‌فرض */}
        <div>
          <label className="block mb-1">فرمول پیش‌فرض قیمت</label>
          <input
            type="text"
            {...register("defaultFormula")}
            className="w-full border rounded px-3 py-2"
            required
          />
          {errors.defaultFormula && <p className="text-red-500">{errors.defaultFormula.message}</p>}
        </div>
     
        {/* دکمه ارسال فرم */}
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          disabled={isSubmit}
        >
          {isSubmit ? <HashLoader size={20} color="#fff" /> : (priceTemplate?._id ? "ویرایش قالب قیمتی" : "افزودن قالب قیمتی")}
        </button>
        <Toaster />
      </form>

      {/* کامپوننت مودال فرمول ساز */}
      <FormulaBuilderModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onSave={saveFormula}
        variables={variable} // فرض می‌کنیم متغیرها از نقش‌ها هستند، در غیر این صورت باید متغیرهای مناسب را ارسال کنید
      />
    </div>
  );
}

export default AddPriceTemplate;
