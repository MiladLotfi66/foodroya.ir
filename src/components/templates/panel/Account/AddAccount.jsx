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
// import { GetAllCurrencies } from "../Currency/currenciesServerActions";
import AddProduct from "../Product/AddProduct";

function AddAccount({
  account = null,
  parentAccount = null,
  onClose,
  refreshAccounts,
}) {
  const { ShopId } = useParams();
  // const [currencies, setCurrencies] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // وضعیت بارگذاری جدید
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
      creditLimit: 0,
      // currency: "",
      bankAcountNumber:"",
      bankCardNumber:"",
      posConected:true,
    },
    resolver: yupResolver(AccountSchema),
  });

  const accountType = watch("accountType");

  useEffect(() => {
    const fetchAndSetValues = async () => {
      setIsLoading(true); // شروع بارگذاری
      try {
        // await getCurrencies(ShopId);
        if (account) {
          reset({
            title: account.title || "",
            accountType: account.accountType || "حساب عادی",
            accountStatus: account.accountStatus || "فعال",
            accountContact: account.contact?._id || "",
            creditLimit: account.creditLimit !== undefined ? account.creditLimit : "",
            // currency: account.currency?._id || "",
            bankAcountNumber:account.bankAcountNumber||"",
bankCardNumber:account.bankCardNumber||"",
posConected:account.posConected||true,

          });
          setSelectedContact(account.contact || null);
          console.log(account);
          
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("مشکلی در بارگذاری اطلاعات وجود دارد.");
      } finally {
        setIsLoading(false); // پایان بارگذاری
      }
    };
    fetchAndSetValues();
    
  }, [ShopId, account, reset]);

  function convertPersianToEnglishNumbers(value) {
    return value.replace(/[۰۱۲۳۴۵۶۷۸۹]/g, function (d) {
      return d.charCodeAt(0) - 1776;
    });
  }
  
  function handleInputChange(event) {
    const englishValue = convertPersianToEnglishNumbers(event.target.value);
    event.target.value = englishValue;
  }
  
  const handleFormSubmit = async (formData) => {
    try {
      await AccountSchema.validate(formData, { abortEarly: false });
      formData.creditLimit = formData.creditLimit || 0;

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
          store: ShopId,
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
        toast.error(result.message);
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

  // const getCurrencies = async (ShopId) => {
  //   try {
  //     const result = await GetAllCurrencies(ShopId);
  //     if (result && result.currencies) {
  //       setCurrencies(result.currencies);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching currencies:", error);
  //     toast.error("مشکلی در دریافت ارزها وجود دارد.");
  //   }
  // };

  const handleContactSelect = (contact) => {
    setValue("accountContact", contact._id);
    setSelectedContact(contact);
    setIsContactSelectorOpen(false);
  };

  // رندر شرطی برای نمایش لودر در حین بارگذاری
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <HashLoader size={50} color="#36d7b7" />
        <span className="mt-2 text-gray-700">در حال بارگذاری اطلاعات...</span>
      </div>
    );
  }

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
        <div className="mb-4 p-4 bg-white dark:bg-zinc-600 dark:text-gray-300 rounded">
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
            disabled={isSubmit}
          >
            <option value="صندوق">صندوق</option>
            <option value="حساب عادی">حساب عادی</option>
            <option value="گروه حساب">گروه حساب</option>
            <option value="حساب بانکی">حساب بانکی</option>
            <option value="کالا">کالا</option>
            <option value="دسته بندی کالا">دسته بندی کالا</option>
            <option value="اشخاص حقیقی">اشخاص حقیقی</option>
            <option value="اشخاص حقوقی">اشخاص حقوقی</option>
            <option value="انبار">انبار</option>
            <option value="حساب انتظامی">حساب انتظامی</option>
          </select>
          {errors.accountType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.accountType.message}
            </p>
          )}
        </div>

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
            disabled={isSubmit} // غیرفعال کردن در حالت ارسال
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
            disabled={isSubmit}
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
                    // ContactImage={selectedContact.ContactImage}
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
                    disabled={isSubmit}
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
                    disabled={isSubmit}
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={() => setIsContactSelectorOpen(true)}
                  disabled={isSubmit}
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
                min={0}
                  type="number"
                  {...register("creditLimit")}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.creditLimit
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-teal-500"
                  }`}
                  placeholder="سقف اعتبار را وارد کنید"
                  disabled={isSubmit}
                  onInput={handleInputChange}

                />
                {errors.creditLimit && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.creditLimit.message}
                  </p>
                )}
              </div>
              {/* انتخاب ارز */}
              {/* <div className="flex-1"> */}
                {/* <label className="block mb-1 text-gray-700">ارز</label> */}
                {/* <select */}
                  {/* {...register("currency")} */}
                  {/* className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${ */}
                    {/* errors.currency */}
                      {/* ? "border-red-500 focus:ring-red-500" */}
                      {/* : "border-gray-300 focus:ring-teal-500" */}
                  {/* }`} */}
                  {/* required */}
                  {/* disabled={isSubmit} */}
                {/* > */}
                  {/* گزینه‌ی پیش‌فرض */}
                  {/* <option value="" >انتخاب ارز</option> */}

                  {/* گزینه‌های دینامیک */}
                  {/* {currencies.map((currency) => ( */}
                    {/* <option key={currency._id} value={currency._id}> */}
                      {/* {currency.title} ({currency.shortName}) */}
                    {/* </option> */}
                  {/* ))} */}
                {/* </select> */}
                {/* {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currency.message}
                  </p>
                )} */}
              {/* </div> */}
            </div>
          </>
        )}

   {/* فیلد حساب بانکی */}
   {(accountType === "حساب بانکی" && (
      <div>
    <div className="flex flex-col md:flex-row gap-4">
      {/* شماره حساب بانکی */}
      <div className="flex-1">
        <label className="block mb-1 text-gray-700">شماره حساب بانکی</label>
        <input
          type="text"
          {...register("bankAcountNumber")}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.bankAcountNumber
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-teal-500"
          }`}
          placeholder="شماره حساب بانکی را وارد کنید"
          disabled={isSubmit}
          onInput={handleInputChange}
        />
        {errors.bankAcountNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.bankAcountNumber.message}
          </p>
        )}
      </div>

      {/* شماره کارت */}
      <div className="flex-1 gap-2">
        <label className="block mb-1 text-gray-700">شماره کارت</label>
        <input
          type="text"
          {...register("bankCardNumber")}
          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
            errors.bankCardNumber
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-teal-500"
          }`}
          placeholder="شماره کارت را وارد کنید"
          disabled={isSubmit}
          onInput={handleInputChange}
        />
        {errors.bankCardNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.bankCardNumber.message}
          </p>
        )}
      </div>

   </div>
     {/* متصل به پوز فروشگاهی */}
     <div className="flex-1 flex items-center">
     <label className="block mb-1 text-gray-700 mr-2">متصل به پوز فروشگاهی</label>
     <input
       type="checkbox"
       {...register("posConected")}
       className="h-4 w-4 text-teal-600 border-gray-300 rounded"
       disabled={isSubmit}
     />
 </div>
 </div>
    ))}

 {/* فیلد کالا */}
 {(accountType === "کالا" && (
<div>
  <AddProduct/>
</div>
 ))}
        {/* دکمه ارسال */}
        <button
          type="submit"
          className={`mt-4 flex justify-center items-center bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded ${
            isSubmit ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmit || isLoading} // غیرفعال کردن در حالت ارسال یا بارگذاری
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
