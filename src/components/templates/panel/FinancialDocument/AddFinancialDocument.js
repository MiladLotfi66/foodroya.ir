"use client";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import { ledgerValidationSchema } from "./FinancialDocumentSchema";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

import { useParams, useRouter } from "next/navigation";
import Select, { components } from "react-select";
import { GetAccountsByStartingCharacter } from "../Account/accountActions";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AddFinancialDocumentAction , EditFinancialDocumentAction} from "./FinancialDocumentsServerActions";
// import { GetAllCurrencies } from "../Currency/currenciesServerActions";
import { customSelectStyles } from "../Product/selectStyles";

function AddFinancialDocument({ financialDocument = {}, onClose,refreshFinancialDocuments }) {
  const [isSubmit, setIsSubmit] = useState(false);
  const { ShopId } = useParams();
  const router = useRouter();
  const [accountsOptions, setAccountsOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDebtors, setTotalDebtors] = useState(0);
  const [totalCreditors, setTotalCreditors] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);
  // const [currencies, setCurrencies] = useState([]);
  const { theme } = useTheme();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      type: "financialDocument", // اضافه کردن مقدار پیش‌فرض type
      ShopId: ShopId || "",
      debtors: financialDocument?.debtors || [{ account: null, amount: "" }],
      creditors: financialDocument?.creditors || [
        { account: null, amount: "" },
      ],
    },
    resolver: yupResolver(ledgerValidationSchema),
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

  // استفاده از useWatch برای مشاهده تغییرات بدهکارها و بستانکارها
  const watchDebtors = useWatch({
    control,
    name: "debtors",
  });

  const watchCreditors = useWatch({
    control,
    name: "creditors",
  });

  useEffect(() => {
    const calculateTotal = (items) => {
      return items.reduce((acc, item) => {
        const amount = parseFloat(item.amount);
        return acc + (isNaN(amount) ? 0 : amount);
      }, 0);
    };

    const debtorsTotal = calculateTotal(watchDebtors);
    const creditorsTotal = calculateTotal(watchCreditors);

    setTotalDebtors(debtorsTotal);
    setTotalCreditors(creditorsTotal);
    setIsBalanced(debtorsTotal === creditorsTotal && debtorsTotal > 0);
  }, [watchDebtors, watchCreditors]);
  ///////////////////////////////////
  useEffect(() => {
    if (financialDocument) {
      const { description, transactions } = financialDocument;

      // تقسیم تراکنش‌ها به بدهکارها و بستانکارها
      const debtorsTransactions = transactions
        .filter((tx) => tx.debit > 0)
        .map((tx) => ({
          account: tx.account._id, // تغییر accountId به account

          amount: tx.debit,
        }));

      const creditorsTransactions = transactions
        .filter((tx) => tx.credit > 0)
        .map((tx) => ({
          account: tx.account._id, // تغییر accountId به account
          amount: tx.credit,
        }));

      reset({
        description: description || "",
        // currency: transactions[0]?.currency?._id || "", // فرض می‌کنیم همه تراکنش‌ها از یک ارز هستند
        debtors:
          debtorsTransactions.length > 0
            ? debtorsTransactions
            : [{ account: "", amount: 0 }], // استفاده از account
        creditors:
          creditorsTransactions.length > 0
            ? creditorsTransactions
            : [{ account: "", amount: 0 }], // استفاده از account
      });
    }
  }, [financialDocument, reset]);


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

  const handleFormSubmit = async (formData) => {
    
    setIsSubmit(true);
    try {
      const formDataObj = {
        ...formData,

      };

      let result;
      if (financialDocument?._id) {
        formDataObj.id = financialDocument._id;
        result = await EditFinancialDocumentAction(formDataObj, ShopId);
      } else {
        result = await AddFinancialDocumentAction(formDataObj, ShopId);
      }

      if (result.status === 201 || result.status === 200) {
        await refreshFinancialDocuments();
        const successMessage = financialDocument && financialDocument._id ? "سند مالی با موفقیت ویرایش شد!" : "سند مالی با موفقیت ایجاد شد!";
        toast.success(successMessage);

        reset();
        onClose();
      } else {
        toast.error(result.message || "خطایی در پردازش سند مالی رخ داد.");
      }
    } catch (error) {
      console.error("Error handling financial document:", error);
      toast.error("مشکلی در پردازش سند مالی وجود دارد.");
    } finally {
      setIsSubmit(false);
    }
  };

  const formSubmitting = async (formData) => {
    await handleFormSubmit(formData);
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
            {/* <select
              className={`w-full mb-4 mt-2 border bg-gray-300 dark:bg-zinc-600 ${
                errors.description ? "border-red-400" : "border-gray-300"
              } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              {...register("currency", { required: "انتخاب ارز الزامی است" })}
            > */}
              {/* گزینه‌ی پیش‌فرض */}
              {/* <option value="">انتخاب ارز</option> */}

              {/* گزینه‌های دینامیک */}
              {/* {currencies.map((currency) => (
                // <option key={currency._id} value={currency._id}>
                //   {currency.title} ({currency.shortName})
                // </option>
              ))} */}
            {/* </select> */}
            {/* {errors.currency && (
              <span className="error">{errors.currency.message}</span>
            )} */}

            {/* بخش بدهکار */}
            <div
              className="border-l-4 border-red-500 p-1 md:p-4  text-xs md:text-base mb-1
                dark:border-red-400  dark:text-gray-200"
            >
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
                                // به جای null، می‌توانید یک مقدار پیش‌فرض یا خالی مناسب را تنظیم کنید
                                controllerField.onChange(""); // یا controllerField.onChange(undefined);
                              } else {
                                controllerField.onChange(
                                  selectedOption ? selectedOption.value : ""
                                );
                              }
                            }}
                            components={{ MenuList: CustomMenuList }}
                            styles={
                              theme === "dark" ? customSelectStyles : undefined
                            }
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
                      <input
                        type="number"
                        step="any"
                        {...register(`debtors.${index}.amount`, {
                          valueAsNumber: true, // تغییر داده شده
                        })}
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
            <div
              className="border-l-4 border-green-500 p-1 md:p-4  text-xs md:text-base mb-1
                dark:border-green-400 dark:text-gray-200"
            >
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
                                // به جای null، می‌توانید یک مقدار پیش‌فرض یا خالی مناسب را تنظیم کنید
                                controllerField.onChange(""); // یا controllerField.onChange(undefined);
                              } else {
                                controllerField.onChange(
                                  selectedOption ? selectedOption.value : ""
                                );
                              }
                            }}
                            components={{ MenuList: CustomMenuList }}
                            styles={
                              theme === "dark" ? customSelectStyles : undefined
                            }
                            placeholder="حساب بستانکار"
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
                        step="any"
                        {...register(`creditors.${index}.amount`, {
                          valueAsNumber: true, // تغییر داده شده
                        })}
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
            <div className="mt-4 space-y-2">
              <p className="text-gray-700 flex justify-between">
                <span>جمع بدهکارها:</span>
                <span className="font-bold">
                  {Number(totalDebtors).toLocaleString("fa-IR")} ریال
                </span>
              </p>
              <p className="text-gray-700 flex justify-between">
                <span>جمع بستانکارها:</span>
                <span className="font-bold">
                  {Number(totalCreditors).toLocaleString("fa-IR")} ریال
                </span>
              </p>
              {!isBalanced && totalDebtors > 0 && totalCreditors > 0 && (
                <p className="text-red-500 font-medium text-center">
                  جمع بدهکارها و بستانکارها باید برابر باشند
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isBalanced || isSubmit}
              className={`w-full my-2 py-2 px-4 rounded transition-all duration-200 ${
                isBalanced && !isSubmit
                  ? "bg-teal-500 hover:bg-teal-600 text-white cursor-pointer"
                  : "bg-gray-400 text-gray-100 cursor-not-allowed"
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
