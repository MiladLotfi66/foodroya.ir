"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import PriceTemplateSchema from "./PriceTemplateSchema";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  AddPriceTemplateAction,
  EditPriceTemplateAction,
} from "./PriceTemplateActions";
import Select from "react-select";
import { GetShopRolesByShopUniqName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import FormulaBuilderModal from "./FormulaBuilderModal";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

function AddPriceTemplate({
  priceTemplate = {},
  onClose,
  refreshPriceTemplates,
}) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { shopUniqName } = useParams();
  const [rolesOptions, setRolesOptions] = useState([]);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(null);

  const variables = [
    "averageBuyPriceForeign",
    "latestBuyPriceForeign",
    "averageBuyPriceBaseCurrency",
    "latestBuyPriceBaseCurrency",
  ];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    mode: "all",
    defaultValues: {
      name: priceTemplate?.title || "",
      status: priceTemplate?.status || "فعال",
      shopUniqName: shopUniqName || "",
      pricingFormulas:
        priceTemplate?.pricingFormulas?.length > 0
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

  const watchedFormulas = watch("pricingFormulas");

  // محاسبه نقش‌های استفاده شده
  const usedRoles = useMemo(() => {
    const roles = new Set();
    watchedFormulas.forEach((formula) => {
      formula.roles.forEach((role) => roles.add(role));
    });
    return Array.from(roles);
  }, [watchedFormulas]);

  // فیلتر کردن نقش‌های قابل انتخاب
  const availableRolesOptions = useMemo(() => {
    return rolesOptions.filter(
      (option) => !usedRoles.includes(option.value)
    );
  }, [rolesOptions, usedRoles]);

  const handleRoleChange = (selectedOptions, index) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setValue(`pricingFormulas.${index}.roles`, selectedValues);
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
        formDataObj.append(
          `pricingFormulas[${index}][roles]`,
          JSON.stringify(formula.roles)
        );
        formDataObj.append(
          `pricingFormulas[${index}][formula]`,
          formula.formula
        );
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
        const successMessage =
          priceTemplate && priceTemplate._id
            ? "قالب قیمتی با موفقیت ویرایش شد!"
            : "قالب قیمتی با موفقیت ایجاد شد!";
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
        <button
          aria-label="close"
          className=" hover:text-orange-300 transition-colors"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(formSubmitting)}
        className="flex flex-col gap-6  p-6 rounded-lg shadow-md"
      >
        <div className="flex items-center">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center">
                <span>غیرفعال</span>
                <button
                  type="button"
                  onClick={() =>
                    field.onChange(field.value === "فعال" ? "غیرفعال" : "فعال")
                  }
                  className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-2 m-1 duration-300 ease-in-out ${
                    field.value === "فعال" ? "bg-teal-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${
                      field.value === "فعال" ? "-translate-x-6" : ""
                    }`}
                  ></div>
                </button>
                <span className="ml-1 ">فعال</span>
              </div>
            )}
          />
        </div>
        <div>
          <label className="block  mb-2">نام قالب قیمتی</label>
          <input
            type="text"
            {...register("name")}
            className={`w-full border bg-gray-300 dark:bg-zinc-600 ${
              errors.name ? "border-red-400" : "border-gray-300"
            } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            placeholder="نام قالب قیمتی را وارد کنید"
            required
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block  mb-4 font-semibold">فرمول‌های قیمت</label>
          {fields.map((field, index) => (
            <div key={field.id} className="border  p-4 mb-4 rounded-lg">
              <div className="mb-4">
                <label className="block  mb-2">نقش‌ها</label>
                <Controller
                  name={`pricingFormulas.${index}.roles`}
                  control={control}
                  render={({ field: controllerField }) => {
                    // گزینه‌های قابل انتخاب برای این فرمول
                    const currentSelectedRoles = controllerField.value || [];

                    // فیلتر کردن نقش‌های قابل انتخاب:
                    // شامل نقش‌های استفاده نشده و نقش‌هایی که در این فرمول انتخاب شده‌اند
                    const filteredOptions = rolesOptions.map(option => ({
                      ...option,
                      isDisabled:
                        !currentSelectedRoles.includes(option.value) &&
                        usedRoles.includes(option.value),
                    }));

                    return (
                      <Select
                        isMulti
                        options={filteredOptions}
                        value={rolesOptions.filter(option =>
                          currentSelectedRoles.includes(option.value)
                        )}
                        onChange={(selectedOptions) => handleRoleChange(selectedOptions, index)}
                        className="react-select-container bg-gray-300 dark:bg-zinc-600 text-gray-900 dark:text-gray-100"
                        classNamePrefix="react-select"
                        placeholder="نقش‌ها را انتخاب کنید"
                      />
                    );
                  }}
                />
                {errors.pricingFormulas?.[index]?.roles && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.pricingFormulas[index].roles.message}
                  </p>
                )}
              </div>

              <div className="flex items-center mb-4">
                <label className="block  flex-1">فرمول قیمت</label>
              </div>
              <div className="flex justify-between w-full border  rounded px-4 py-2 bg-gray-300 dark:bg-zinc-600">
                {fields[index].formula || "فرمولی وارد نشده است."}
                <button
                  type="button"
                  onClick={() => openFormulaModal(index)}
                  className="text-teal-500 hover:text-teal-700 transition-colors"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-4 text-red-400 hover:text-red-700 transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-1" />
              </button>
              {errors.pricingFormulas?.[index]?.formula && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.pricingFormulas[index].formula.message}
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ roles: [], formula: "" })}
            className="flex items-center text-teal-500 hover:text-teal-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>افزودن فرمول قیمت جدید</span>
          </button>

          {errors.pricingFormulas &&
            typeof errors.pricingFormulas.message === "string" && (
              <p className="text-red-400 text-sm mt-1">
                {errors.pricingFormulas.message}
              </p>
            )}
        </div>

        <div>
          <label className="block  mb-4 font-semibold">فرمول سایر نقش‌ها</label>
          <div className="w-full border  rounded px-4 py-2  bg-gray-300 dark:bg-zinc-600">
            <div className="flex items-center justify-between ">
              <div>
                {getValues("defaultFormula") || "فرمولی وارد نشده است."}
              </div>
              <button
                type="button"
                onClick={openDefaultFormulaModal}
                className="flex items-center text-teal-500 hover:text-teal-700 transition-colors"
              >
                <PencilSquareIcon className="h-5 w-5 mr-1" />
              </button>
            </div>
          </div>
          {errors.defaultFormula && (
            <p className="text-red-400 text-sm mt-1">
              {errors.defaultFormula.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="flex justify-center items-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          disabled={isSubmit}
        >
          {isSubmit ? (
            <HashLoader size={20} color="#fff" />
          ) : priceTemplate?._id ? (
            "ویرایش قالب قیمتی"
          ) : (
            "افزودن قالب قیمتی"
          )}
        </button>
        <Toaster />
      </form>

      <FormulaBuilderModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onSave={saveFormula}
        variables={variables}
      />
    </div>
  );
}

export default AddPriceTemplate;
