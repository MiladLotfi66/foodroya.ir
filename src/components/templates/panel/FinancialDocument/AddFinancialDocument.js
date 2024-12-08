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
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/solid";

function AddFinancialDocument({ financialDocument = {}, onClose }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { ShopId } = useParams();
  const router = useRouter();
  const [accountsOptions, setAccountsOptions] = useState([]);
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
      ShopId: ShopId || "",
      debtors: financialDocument?.debtors || [{ account: null, amount: "" }],
      creditors: financialDocument?.creditors || [
        { account: null, amount: "" },
      ],
    },
    resolver: yupResolver(FinancialDocumentSchema),
  });

  const {
    fields: debtorFields,
    append: appendDebtor,
    remove: removeDebtor,
  } = useFieldArray({
    control,
    name: "debtors",
  });

  const {
    fields: creditorFields,
    append: appendCreditor,
    remove: removeCreditor,
  } = useFieldArray({
    control,
    name: "creditors",
  });

  // واکشی حساب‌ها
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await GetAccountsByStartingCharacter(
        ShopId,
        "",
        "title",
        [
          "صندوق",
          "حساب عادی",
          "حساب بانکی",
          "اشخاص حقیقی",
          "اشخاص حقوقی",
          "حساب انتظامی",
        ]
      );
      console.log(response);

      if (response.Accounts && Array.isArray(response.Accounts)) {
        const options = response.Accounts.map((Account) => ({
          value: Account._id,
          label: Account.title,
        })).concat({ value: "add_new", label: "افزودن حساب جدید" }); // افزودن گزینه "افزودن حساب جدید"
        setAccountsOptions(options);
      } else {
        throw new Error("داده‌های حساب‌ها به درستی دریافت نشده‌اند.");
      }
    } catch (error) {
      console.error("خطا در واکشی حساب‌ها:", error);
      toast.error("مشکلی در واکشی حساب‌ها وجود دارد.");
    } finally {
      setIsLoading(false);
    }
  }, [ShopId]);

  useEffect(() => {
    if (ShopId) {
      fetchAccounts();
    }
  }, [ShopId, fetchAccounts]);

  // هندلر اضافه کردن حساب جدید
  const handleAddNewAccount = () => {
    router.push(`/${ShopId}/panel/account`);
  };

  // کامپوننت سفارشی برای افزودن گزینه "افزودن حساب جدید" در لیست
  const CustomMenuList = (props) => {
    return (
      <>
        <components.MenuList {...props}>{props.children}</components.MenuList>
        <div
          style={{
            padding: "10px",
            cursor: "pointer",
            borderTop: "1px solid #ccc",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleAddNewAccount();
          }}
          className="hover:bg-gray-200 transition-colors"
        >
          افزودن حساب جدید
        </div>
      </>
    );
  };

  const formSubmitting = async (formData) => {
    console.log(formData);
    setIsSubmit(true);
    try {
      // منطق ارسال فرم به سرور
      // به عنوان مثال:
      // await SubmitFinancialDocument(formData);
      toast.success("سند مالی با موفقیت ثبت شد.");
      onClose();
    } catch (error) {
      console.error("خطا در ثبت سند مالی:", error);
      toast.error("مشکلی در ثبت سند مالی وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="overflow-y-auto max-h-screen md:p-4">
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
            className="max-w-lg mx-auto rounded"
          >
            {/* بخش بدهکار */}
            <div className="border-l-4 border-red-500 p-1 md:p-4 bg-red-50 text-xs md:text-base mb-1">
              <label className="block mb-1 md:mb-4 ">طرف حساب‌های بدهکار</label>
              {debtorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex justify-between border p-1 md:p-4  mb-1 md:mb-4 rounded-lg"
                >
                  <div className="flex-col gap-1 items-center content-center flex-[0_0_90%]">
                    <div className="mb-1 md:mb-4 ">
                      <Controller
                        name={`debtors.${index}.account`}
                        control={control}
                        defaultValue={field.account || null}
                        render={({ field: controllerField }) => (
                          <Select
                            isClearable
                            options={accountsOptions}
                            value={
                              accountsOptions.find(
                                (option) =>
                                  option.value === controllerField.value
                              ) || null
                            }
                            onChange={(selectedOption) => {
                              if (
                                selectedOption &&
                                selectedOption.value === "add_new"
                              ) {
                                handleAddNewAccount();
                                controllerField.onChange(null);
                              } else {
                                controllerField.onChange(
                                  selectedOption ? selectedOption.value : null
                                );
                              }
                            }}
                            components={{ MenuList: CustomMenuList }}
                            className="select bg-gray-300 dark:bg-zinc-600"
                            classNamePrefix="select"
                            placeholder="حساب بدهکار"
                          />
                        )}
                      />
                      {errors.debtors?.[index]?.account && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.debtors[index].account.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-1 md:mb-4 ">
                      {/* <label className="block mb-2">مبلغ بدهکار</label> */}
                      <input
                        type="number"
                        step="0.01"
                        {...register(`debtors.${index}.amount`)}
                        className={`w-full border bg-gray-300 dark:bg-zinc-600 ${
                          errors.debtors?.[index]?.amount
                            ? "border-red-400"
                            : "border-gray-300"
                        } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        placeholder="مبلغ"
                        required
                      />

                      {errors.debtors?.[index]?.amount && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.debtors[index].amount.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDebtor(index)}
                    className="flex-[0_0_10%] text-red-500 self-center flex justify-center items-center"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendDebtor({ account: null, amount: "" })}
                className="text-teal-500"
              >
                افزودن حساب بدهکار
              </button>
            </div>

            {/* بخش بستانکار */}
            <div className="border-l-4 border-green-500 p-1 md:p-4 bg-green-50 text-xs md:text-base mb-1">
              <label className="block mb-1 md:mb-4 ">
                طرف حساب‌های بستانکار
              </label>
              {creditorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex justify-between border p-1 md:p-4  mb-1 md:mb-4 rounded-lg"
                >
                  <div className="flex-col gap-1 items-center content-center flex-[0_0_90%]">
                    <div className="mb-1 md:mb-4 ">
                      <Controller
                        name={`creditors.${index}.account`}
                        control={control}
                        defaultValue={field.account || null}
                        render={({ field: controllerField }) => (
                          <Select
                            isClearable
                            options={accountsOptions}
                            value={
                              accountsOptions.find(
                                (option) =>
                                  option.value === controllerField.value
                              ) || null
                            }
                            onChange={(selectedOption) => {
                              if (
                                selectedOption &&
                                selectedOption.value === "add_new"
                              ) {
                                handleAddNewAccount();
                                controllerField.onChange(null);
                              } else {
                                controllerField.onChange(
                                  selectedOption ? selectedOption.value : null
                                );
                              }
                            }}
                            components={{ MenuList: CustomMenuList }}
                            className="select bg-gray-300 dark:bg-zinc-600"
                            classNamePrefix="select"
                            placeholder="حساب بستانکار را انتخاب کنید"
                          />
                        )}
                      />
                      {errors.creditors?.[index]?.account && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.creditors[index].account.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-1 md:mb-4 ">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`creditors.${index}.amount`)}
                        className={`w-full border bg-gray-300 dark:bg-zinc-600 ${
                          errors.creditors?.[index]?.amount
                            ? "border-red-400"
                            : "border-gray-300"
                        } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        placeholder="مبلغ"
                        required
                      />
                      {errors.creditors?.[index]?.amount && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.creditors[index].amount.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCreditor(index)}
                    className="text-red-500 self-center"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendCreditor({ account: null, amount: "" })}
                className="text-teal-500"
              >
                افزودن حساب بستانکار
              </button>
            </div>

            {/* ////////////////////////////////////// */}
            <input
              type="text"
              {...register("description")}
              className={`w-full mb-2 mt-2 border bg-gray-300 dark:bg-zinc-600 ${
                errors.description ? "border-red-400" : "border-gray-300"
              } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              placeholder="توضیحات"
            />

            <button
              type="submit"
              disabled={isSubmit}
              className={` my-2 bg-teal-500 text-white py-2 p-4 rounded ${
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
