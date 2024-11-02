"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import PriceTemplateSchema from "./PriceTemplateSchema";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AddPriceTemplateAction, EditPriceTemplateAction } from "./PriceTemplateActions";
import Select from "react-select";
import { GetShopRolesByShopUniqName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import FormulaBuilderModal from "./FormulaBuilderModal";
import { XMarkIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

function AddPriceTemplate({ priceTemplate = {}, onClose, refreshPriceTemplates }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();
  const [rolesOptions, setRolesOptions] = useState([]);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState(new Set()); // وضعیت جدید برای نقش‌های انتخاب شده

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors } 
  } = useForm({
    mode: "all",
    defaultValues: {
      name: priceTemplate?.title || "",
      status: priceTemplate?.status || "فعال",
      shopUniqName: shopUniqName || "",
      pricingFormulas: priceTemplate?.pricingFormulas?.length > 0
        ? priceTemplate.pricingFormulas.map((formula) => ({
            roles: formula.roles.map((role) => role._id),
            formula: formula.formula,
          }))
        : [{ roles: [], formula: "" }],
      defaultFormula: priceTemplate?.defaultFormula || "",
    },
    resolver: yupResolver(PriceTemplateSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "pricingFormulas",
  });

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await GetShopRolesByShopUniqName(shopUniqName);
        if (response.Roles && Array.isArray(response.Roles)) {
          const options = response.Roles.map((role) => ({
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
  const handleRoleChange = (selectedOptions, index) => {
    const selectedValues = selectedOptions.map(option => option.value);
    
    // به‌روزرسانی وضعیت selectedRoles
    const newSelectedRoles = new Set(selectedRoles);
    
    // حذف نقش‌های قبلاً انتخاب شده
    fields[index].roles.forEach(role => {
        newSelectedRoles.delete(role);
    });
    
    // افزودن نقش‌های جدید
    selectedValues.forEach(role => {
        newSelectedRoles.add(role);
    });

    setSelectedRoles(newSelectedRoles);
    setValue(`pricingFormulas.${index}.roles`, selectedValues);

    // به‌روزرسانی فرمول‌ها
    const updatedFormulas = fields.map((field, i) => {
        if (i === index) {
            return {
                ...field,
                roles: selectedValues, // اطمینان از این که نقش‌های به‌روز شده استفاده شوند
            };
        }
        return field;
    });

    // به‌روزرسانی آرایه فرمول‌ها
    update(index, updatedFormulas[index]);
};


const getAvailableRoles = (index) => {
    const usedRoles = fields.flatMap((field, i) => i !== index ? field.roles : []);
    return rolesOptions.filter(option => !usedRoles.includes(option.value) && !selectedRoles.has(option.value));
};


  const handleFormSubmit = async (formData) => {
    setIsSubmit(true);
    try {
      const formattedData = {
        title: formData.name,
        status: formData.status,
        shopUniqName: formData.shopUniqName,
        pricingFormulas: formData.pricingFormulas.map((formula) => ({
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

      formattedData.pricingFormulas.forEach((formula, index) => {
        formDataObj.append(`pricingFormulas[${index}][roles]`, JSON.stringify(formula.roles));
        formDataObj.append(`pricingFormulas[${index}][formula]`, formula.formula);
      });

      if (priceTemplate?._id) {
        formDataObj.append("id", priceTemplate._id);
      }

      const result = priceTemplate?._id
        ? await EditPriceTemplateAction(formDataObj, shopUniqName)
        : await AddPriceTemplateAction(formDataObj);

      if (result.status === 201 || result.status === 200) {
        await refreshPriceTemplates();
        toast.success(priceTemplate?._id ? "قالب قیمتی با موفقیت ویرایش شد!" : "قالب قیمتی با موفقیت ایجاد شد!");
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

  const openFormulaModal = (index) => {
    setCurrentFormulaIndex(index);
    setIsFormulaModalOpen(true);
  };

  const saveFormula = (formula) => {
    if (currentFormulaIndex !== null) {
      if (currentFormulaIndex === "default") {
        setValue("defaultFormula", formula);
      } else {
        update(currentFormulaIndex, {
          ...fields[currentFormulaIndex],
          formula,
        });
      }
      setIsFormulaModalOpen(false);
      setCurrentFormulaIndex(null);
    }
  };

  const openDefaultFormulaModal = () => {
    setCurrentFormulaIndex("default");
    setIsFormulaModalOpen(true);
  };

  return (
    <div className="overflow-y-auto max-h-screen p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {priceTemplate?._id ? "ویرایش قالب قیمتی" : "افزودن قالب قیمتی"}
        </h1>
        <button aria-label="close" className="hover:text-orange-300 transition-colors" onClick={onClose}>
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(formSubmitting)} className="flex flex-col gap-6 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center">
                <span>غیرفعال</span>
                <button type="button" onClick={() => field.onChange(field.value === "فعال" ? "غیرفعال" : "فعال")}
                  className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-2 m-1 duration-300 ease-in-out ${field.value === "فعال" ? "bg-teal-500" : "bg-gray-300"}`}>
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${field.value === "فعال" ? "-translate-x-6" : ""}`}></div>
                </button>
                <span className="ml-1 ">فعال</span>
              </div>
            )}
          />
        </div>

        <div>
          <label className="block mb-2">نام قالب قیمتی</label>
          <input type="text" {...register("name")}
            className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.name ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            placeholder="نام قالب قیمتی را وارد کنید" required />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-4 font-semibold">فرمول‌های قیمت</label>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 mb-4 rounded-lg">
              <div className="mb-4">
                <label className="block mb-2">نقش‌ها</label>
                <Controller
  name={`pricingFormulas.${index}.roles`}
  control={control}
  render={({ field: controllerField }) => (
    <Select
      isMulti
      options={getAvailableRoles(index)}
      value={rolesOptions.filter(option => controllerField.value.includes(option.value))}
      onChange={(selectedOptions) => handleRoleChange(selectedOptions, index)}
      classNamePrefix="select"
      placeholder="نقش‌ها را انتخاب کنید"
    />
  )}
/>

              </div>

              <div className="flex items-center">
                <button type="button" onClick={() => openFormulaModal(index)} className="mr-2 text-teal-500">ویرایش فرمول</button>
                <button type="button" onClick={() => remove(index)} className="text-red-500">حذف</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => append({ roles: [], formula: "" })} className="text-teal-500">افزودن فرمول</button>
        </div>

        <div>
          <label className="block mb-2">فرمول پیش‌فرض</label>
          <div className="flex justify-between items-center mb-4">
            <span>{watch("defaultFormula") || "هیچ فرمول پیش‌فرضی انتخاب نشده است."}</span>
            <button type="button" onClick={openDefaultFormulaModal} className="text-teal-500">ویرایش</button>
          </div>
        </div>

        <button type="submit" disabled={isSubmit} className={`mt-4 bg-teal-500 text-white py-2 px-4 rounded ${isSubmit ? "opacity-50 cursor-not-allowed" : ""}`}>
          {isSubmit ? <HashLoader color="white" size={20} /> : "ذخیره"}
        </button>
      </form>

      <FormulaBuilderModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onSave={saveFormula}
        initialFormula={currentFormulaIndex !== null ? fields[currentFormulaIndex].formula : ""}
      />
      <Toaster position="top-right" />
    </div>
  );
}

export default AddPriceTemplate;
