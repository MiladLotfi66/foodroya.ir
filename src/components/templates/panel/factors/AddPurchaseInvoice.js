"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceItemCard from "./InvoiceItemCard";
import AddInvoiceItem from "./AddInvoiceItem";
import { useParams } from "next/navigation";
import { DeleteInvoiceItems } from "./invoiceItemsServerActions";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { GetAllContacts } from "../Contact/contactsServerActions";
import { GetAllCurrencies } from "../Currency/currenciesServerActions";
import { v4 as uuidv4 } from 'uuid';
import SubmitInvoiceModal from "./SubmitInvoiceModal";

function AddPurchaseInvoice() {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isOpenAddInvoiceItem, setIsOpenAddInvoiceItem] = useState(false);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const params = useParams();
  const { ShopId } = params;
  const [contactsOptions, setContactsOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [isOpenSubmitModal, setIsOpenSubmitModal] = useState(false);

  // استفاده از react-hook-form
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const totalItems = invoiceItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalPrice = invoiceItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const totalRows = invoiceItems.length;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await GetAllContacts(ShopId);
        setContactsOptions(response.contacts);
      } catch (error) {
        console.error("خطا در واکشی حساب‌ها:", error);
      }
    };

    const fetchCurrencies = async () => {
      try {
        const response = await GetAllCurrencies(ShopId);
        setCurrencies(response.currencies);
      } catch (error) {
        console.error("خطا در واکشی ارزها:", error);
      }
    };

    fetchContacts();
    fetchCurrencies();
  }, [ShopId]);

  const handleAddNewInvoiceItem = useCallback((newInvoiceItem) => {
    const itemWithUniqueKey = {
      ...newInvoiceItem,
      uniqueKey: uuidv4(),
      totalPrice: (parseInt(newInvoiceItem.quantity, 10) || 0) * (parseFloat(newInvoiceItem.unitPrice) || 0), // اطمینان از تبدیل به عدد
    };
    setInvoiceItems((prevInvoiceItems) => [...prevInvoiceItems, itemWithUniqueKey]);
    toast.success("کالا با موفقیت افزوده شد.");
    setIsOpenAddInvoiceItem(false);
  }, []);

  const handleUpdateInvoiceItem = useCallback((updatedItem) => {
    const updatedItemWithTotalPrice = {
      ...updatedItem,
      totalPrice: (parseInt(updatedItem.quantity, 10) || 0) * (parseFloat(updatedItem.unitPrice) || 0), // اطمینان از محاسبه مجدد
    };
    setInvoiceItems((prevInvoiceItems) =>
      prevInvoiceItems.map(item => item.uniqueKey === updatedItemWithTotalPrice.uniqueKey ? updatedItemWithTotalPrice : item)
    );
  }, []);

  const handleOpenSubmitModal = () => {
    // بررسی صحت داده‌ها قبل از باز کردن مودال (اختیاری)
    if (!selectedCustomer) {
      toast.error("لطفاً مشتری را انتخاب کنید.");
      return;
    }
    if (!selectedCurrency) {
      toast.error("لطفاً ارز را انتخاب کنید.");
      return;
    }
    if (invoiceItems.length === 0) {
      toast.error("لطفاً حداقل یک آیتم به فاکتور اضافه کنید.");
      return;
    }
    setIsOpenSubmitModal(true);
  };
  // تابع بستن مودال ثبت فاکتور
  const handleCloseSubmitModal = () => {
    setIsOpenSubmitModal(false);
  };

  // دریافت داده‌های توضیحات از react-hook-form
  const onSubmit = (data) => {
    // این تابع می‌تواند برای پردازش نهایی داده‌های فرم مورد استفاده قرار گیرد
    console.log(data);
  };

  // ایجاد invoiceData شامل توضیحات
  const invoiceData = {
    customer: contactsOptions.find(c => c._id === selectedCustomer) || "",
    currency: currencies.find(c => c._id === selectedCurrency)?.title || "",
    totalItems,
    totalPrice,
    totalRows,
    description: "", // مقدار اولیه توضیحات
    ShopId
  };

  // به‌روزرسانی invoiceData با توضیحات وارد شده
  useEffect(() => {
    // اگر توضیحات از react-hook-form مدیریت می‌شود
    const subscription = watch((value) => {
      invoiceData.description = value.description || "";
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDeleteInvoiceItem = useCallback(async (invoiceItemId) => {
    try {
      const response = await DeleteInvoiceItems(invoiceItemId);
      if (response.success) {
        setInvoiceItems((prevInvoiceItems) =>
          prevInvoiceItems.filter((item) => item._id !== invoiceItemId)
        );
        toast.success("کالا با موفقیت از لیست حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف کالا.");
      }
    } catch (error) {
      console.error("Error deleting invoiceItem:", error);
      toast.error("خطا در حذف کالا.");
    }
  }, []);

  const handleEditClick = useCallback((invoiceItem) => {
    setSelectedInvoiceItem(invoiceItem);
    setIsOpenAddInvoiceItem(true);
  }, []);

  const handleAddInvoiceItemClick = useCallback(() => {
    setIsOpenAddInvoiceItem(true);
    setSelectedInvoiceItem(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddInvoiceItem(false);
    setSelectedInvoiceItem(null);
  }, []);

  return (
    <FormTemplate>
      {isOpenAddInvoiceItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddInvoiceItem
              invoiceItem={selectedInvoiceItem}
              onClose={handleCloseModal}
              onAddNewInvoiceItem={handleAddNewInvoiceItem}
              onUpdateInvoiceItem={handleUpdateInvoiceItem}
            />
          </div>
        </div>
      )}
      {/* مودال ثبت فاکتور */}
      <SubmitInvoiceModal
        isOpen={isOpenSubmitModal}
        onClose={handleCloseSubmitModal}
        invoiceData={invoiceData}
        invoiceItems={invoiceItems}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">فاکتور خرید</h1>
          <button
            type="button"
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add invoiceItem"
            onClick={handleAddInvoiceItemClick}
          >
            افزودن کالا
          </button>
        </div>

        <div className="flex  gap-4 px-2">
          {/* فیلد مشتری */}
          <div className="flex flex-col mb-4">
            <label htmlFor="customer" className="mb-2">مشتری:</label>
            <select
              className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.customer ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              id="customer"
              {...register("customer", { required: "مشتری الزامی است" })}
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">انتخاب مشتری</option>
              {contactsOptions.map((contact) => (
                <option key={contact._id} value={contact._id}>
                  {contact.name}
                </option>
              ))}
            </select>
            {errors.customer && <span className="text-red-500">{errors.customer.message}</span>}
          </div>

          {/* فیلد ارز */}
          <div className="flex flex-col mb-4">
            <label htmlFor="currency" className="mb-2">ارز:</label>
            <select
              className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.currency ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              id="currency"
              {...register("currency", { required: "ارز الزامی است" })}
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              <option value="">انتخاب ارز</option>
              {currencies.map((currency) => (
                <option key={currency._id} value={currency._id}>
                  {currency.title}
                </option>
              ))}
            </select>
            {errors.currency && <span className="text-red-500">{errors.currency.message}</span>}
          </div>

   
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {invoiceItems.map((invoiceItem) => (
            <InvoiceItemCard
              key={invoiceItem.uniqueKey}
              invoiceItem={invoiceItem}
              editFunction={() => handleEditClick(invoiceItem)}
              onDelete={() => handleDeleteInvoiceItem(invoiceItem._id)}
              onUpdate={handleUpdateInvoiceItem}
            />
          ))}
        </div>
{/* /////////////////////////////// */}
       {/* فیلد توضیحات - **زندگی تغییرات** */}
       <div className="flex flex-col md:items-center md:flex-row m-2 md:col-span-2">
            <label htmlFor="description" className="mb-2">توضیحات:</label>
            <textarea
              className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.description ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              id="description"
              {...register("description")}
              placeholder="توضیحات فاکتور را وارد کنید..."
            ></textarea>
            {errors.description && <span className="text-red-500">{errors.description.message}</span>}
          </div>
{/* /////////////////////////////// */}
        <div className="bg-gray-100 dark:bg-zinc-800 shadow-md rounded-lg p-4 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-800 dark:text-gray-200">
              <div>تعداد کل اقلام: <span className="font-bold">{totalItems}</span></div>
              <div>جمع کل فاکتور: <span className="font-bold">{totalPrice.toLocaleString()} تومان</span></div>
              <div>تعداد ردیف‌ها: <span className="font-bold">{totalRows}</span></div>
            </div>
            <button
              type="button"
              className="mt-4 md:mt-0 bg-teal-600 text-white rounded-lg px-4 py-2 hover:bg-teal-700 transition duration-200"
              onClick={handleOpenSubmitModal} // افزودن تابع باز کردن مودال
            >
              ثبت فاکتور
            </button>
          </div>
        </div>
      </form>
      <Toaster />
    </FormTemplate>
  );
}

export default AddPurchaseInvoice;
