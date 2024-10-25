"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";
import { Toaster, toast } from "react-hot-toast";
import { yupResolver } from "@hookform/resolvers/yup";
import AccountSchema from "./AccountSchema";
import { createAccount, updateAccount } from "./accountActions";
import ContactSelector from "@/module/home/ContactSelector";
import { useParams } from "next/navigation";
import ContactMiniInfo from "@/module/home/ContactMiniInfo";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { GetAllCurrencies } from "@/components/signinAndLogin/Actions/currenciesServerActions";

function AddAccount({
  account = null,
  parentAccount = null,
  onClose,
  refreshAccounts,
}) {
  const { shopUniqName } = useParams();
  const [currencies, setCurrencies] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);

  const [isContactSelectorOpen, setIsContactSelectorOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(
    account?.contact || null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    mode: "all",
    defaultValues: {
      title: "",
      accountType: "حساب عادی",
      accountStatus: "فعال",
      accountContact: "",
      creditLimit: "",
      Currency: "",
    },
    resolver: yupResolver(AccountSchema),
  });

  const accountType = watch("accountType");

  useEffect(() => {
    const fetchCurrenciesAndSetValues = async () => {
      await getCurrencies(shopUniqName);
      if (account) {
        reset({
          title: account.title || "",
          accountType: account.accountType || "حساب عادی",
          accountStatus: account.accountStatus || "فعال",
          accountContact: account.contact?._id || "",
          creditLimit: account.creditLimit || "",
          Currency: account.Currency?._id || "",
        });
        setSelectedContact(account.contact || null);
      }
    };
    fetchCurrenciesAndSetValues();
  }, [shopUniqName, account, reset]);

  const handleFormSubmit = async (formData) => {
    try {
      await AccountSchema.validate(formData, { abortEarly: false });

      setIsSubmit(true);
      toast.dismiss();

      const payload = {
        ...formData,
        contact: selectedContact ? selectedContact._id : null,
      };

      let result;
      if (account?._id) {
        result = await updateAccount(account._id, payload);
      } else {
        if (!parentAccount) {
          throw new Error("حساب والد برای ایجاد حساب جدید ضروری است.");
        }
        result = await createAccount({
          ...payload,
          store: shopUniqName,
          parentAccount: parentAccount.id,
        });
      }

      if (result.success) {
        refreshAccounts();
        const successMessage =
          account && account._id
            ? "حساب با موفقیت ویرایش شد!"
            : "حساب با موفقیت ایجاد شد!";
        toast.success(successMessage);
        reset();
        setSelectedContact(null);
        onClose();
      } else {
        const errorMessage =
          account && account._id
            ? "خطایی در ویرایش حساب رخ داد."
            : "خطایی در ایجاد حساب رخ داد.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error handling account:", error);
      const errorMsg = error.errors
        ? error.errors.join(", ")
        : error.message || "مشکلی در پردازش حساب وجود دارد.";
      toast.error(errorMsg);
    } finally {
      setIsSubmit(false);
    }
  };

  const getCurrencies = async (shopUniqName) => {
    try {
      const ShopId = await GetShopIdByShopUniqueName(shopUniqName);
      const result = await GetAllCurrencies(ShopId.ShopID);
      if (result && result.currencies) {
        setCurrencies(result.currencies);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("مشکلی در دریافت ارزها وجود دارد.");
    }
  };

  const handleContactSelect = (contact) => {
    setValue("accountContact", contact._id);
    setSelectedContact(contact);
    setIsContactSelectorOpen(false);
  };

  return (
    <div className="overflow-y-auto max-h-screen p-4">
      <div className="flex justify-between items-center p-2 md:p-5 mt-4">
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

      {!account && parentAccount && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p>
            <strong>حساب والد:</strong> {parentAccount.title}
          </p>
          <p>
            <strong>کدینگ حساب والد:</strong> {parentAccount.accountCode}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-4 p-2 md:p-4"
      >
        {/* عنوان حساب */}
        <div>
          <label className="block mb-1 text-gray-700">عنوان حساب</label>
          <input
            type="text"
            {...register("title")}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.title
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-teal-500"
            }`}
            placeholder="عنوان حساب خود را وارد کنید"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* نوع حساب */}
        <div>
          <label className="block mb-1 text-gray-700">نوع حساب</label>
          <select
            {...register("accountType")}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.accountType
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-teal-500"
            }`}
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
          {errors.accountType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.accountType.message}
            </p>
          )}
        </div>

        {/* وضعیت حساب */}
        <div>
          <label className="block mb-1 text-gray-700">وضعیت حساب</label>
          <select
            {...register("accountStatus")}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              errors.accountStatus
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-teal-500"
            }`}
            required
          >
            <option value="فعال">فعال</option>
            <option value="غیر فعال">غیر فعال</option>
          </select>
          {errors.accountStatus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.accountStatus.message}
            </p>
          )}
        </div>

        {/* فیلد مخاطب و سقف اعتبار */}
        {(accountType === "اشخاص حقیقی" ||
          accountType === "اشخاص حقوقی") && (
          <>
            {/* انتخاب مخاطب */}
            <div className="relative">
              <label className="block mb-1 text-gray-700">مخاطب</label>
              {selectedContact ? (
                <div className="flex items-center gap-2">
                  <ContactMiniInfo
                    ContactImage={selectedContact.ContactImage}
                    name={selectedContact.name}
                    Contactname={selectedContact.ContactUniqName}
                  />

                  <button
                    type="button"
                    className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelectedContact(null);
                      setValue("accountContact", "");
                      setIsContactSelectorOpen(true);
                    }}
                  >
                    تغییر مخاطب
                  </button>
                  <button
                    type="button"
                    className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setSelectedContact(null);
                      setValue("accountContact", "");
                    }}
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setIsContactSelectorOpen(true)}
                >
                  انتخاب
                </button>
              )}
              {errors.accountContact && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountContact.message}
                </p>
              )}
              <ContactSelector
                isOpen={isContactSelectorOpen}
                onClose={() => setIsContactSelectorOpen(false)}
                onSelect={handleContactSelect}
              />
            </div>

            {/* سقف اعتبار و ارز */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* سقف اعتبار */}
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">سقف اعتبار</label>
                <input
                  type="number"
                  {...register("creditLimit")}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.creditLimit
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                  placeholder="سقف اعتبار را وارد کنید"
                />
                {errors.creditLimit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.creditLimit.message}
                  </p>
                )}
              </div>
              {/* انتخاب ارز */}
              <div className="flex-1">
                <label className="block mb-1 text-gray-700">ارز</label>
                <select
                  {...register("Currency")}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.Currency
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                  required
                >
                  {/* گزینه‌ی پیش‌فرض */}
                  <option value="">انتخاب ارز</option>

                  {/* گزینه‌های دینامیک */}
                  {currencies.map((currency) => (
                    <option key={currency._id} value={currency._id}>
                      {currency.title} ({currency.shortName})
                    </option>
                  ))}
                </select>
                {errors.Currency && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.Currency.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* دکمه ارسال */}
        <button
          type="submit"
          className={`mt-4 flex justify-center items-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded ${
            isSubmit ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmit}
        >
          {isSubmit ? (
            <>
              <HashLoader size={20} color="#fff" />
              <span className="mr-2">در حال ارسال...</span>
            </>
          ) : account?._id ? (
            "ویرایش حساب"
          ) : (
            "افزودن حساب"
          )}
        </button>
        <Toaster />
      </form>
    </div>
  );
}

export default AddAccount;
