// app/AddPurchaseInvoice.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceItemCard from "./InvoiceItemCard";
import AddInvoiceItem from "./AddInvoiceItem";
import { useParams } from 'next/navigation';
import { DeleteInvoiceItems, GetAllInvoiceItems } from "./invoiceItemsServerActions"; // حذف سایر اکشن‌ها که دیگر نیاز نیستند
import { Toaster, toast } from "react-hot-toast";
import Select, { components } from "react-select";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { GetAllContacts } from "../Contact/contactsServerActions";
import { GetAllCurrencies } from "../Currency/currenciesServerActions";

function AddPurchaseInvoice() {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isOpenAddInvoiceItem, setIsOpenAddInvoiceItem] = useState(false);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const [selectedInvoiceItemFile, setSelectedInvoiceItemFile] = useState(null); // افزودن استیت جدید
  const params = useParams();
  const { ShopId } = params;
  const [contactsOptions, setContactsOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const totalItems = invoiceItems.length;
  const totalPrice = invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalRows = invoiceItems.length;

  useEffect(() => {
    // واکشی حساب‌ها
    const fetchContacts = async () => {
      try {
        const response = await GetAllContacts(ShopId)
        console.log("response",response);
        
        setContactsOptions(response.contacts);
      } catch (error) {
        console.error('خطا در واکشی حساب‌ها:', error);
      }
    };

    // واکشی ارزها
    const fetchCurrencies = async () => {
      try {
        const response = await GetAllCurrencies(ShopId)
        console.log("response",response);
        
        setCurrencies(response.currencies);
      } catch (error) {
        console.error('خطا در واکشی ارزها:', error);
      }
    };

    fetchContacts();
    fetchCurrencies();
  }, []);

  
  // بهینه‌سازی refreshInvoiceItems با استفاده از useCallback
  const refreshInvoiceItems = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("فروشگاهی با این نام یافت نشد.");
        return;
      }
      const response = await GetAllInvoiceItems(ShopId);
      setInvoiceItems(response.invoiceItems);
    } catch (error) {
      console.error("Error fetching invoiceItems:", error);
      toast.error("خطا در دریافت اقلام.");
    }
  }, [ShopId]);

  useEffect(() => {
    refreshInvoiceItems();
  }, [refreshInvoiceItems]);

  const handleCustomerChange = (event) => {
    setSelectedCustomer(event.target.value);
  };
  
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };
  
  const handleDeleteInvoiceItem = useCallback(async (invoiceItemId) => {
    try {
      const response = await DeleteInvoiceItems(invoiceItemId);
      if (response.success) {
        setInvoiceItems((prevInvoiceItems) => prevInvoiceItems.filter(invoiceItem => invoiceItem._id !== invoiceItemId));
        toast.success("کالا با موفقیت از لیست حذف شد.");
      } else {
        throw new Error(response.message || "خطا در حذف کالا.");
      }
    } catch (error) {
      console.error("Error deleting invoiceItem:", error);
      toast.error("خطا در حذف کالا.");
    }
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddInvoiceItem(false);
      setSelectedInvoiceItem(null);
      setSelectedInvoiceItemFile(null);
    }
  }, []);

  const handleEditClick = useCallback((invoiceItem) => {
    setSelectedInvoiceItem(invoiceItem);
    setSelectedInvoiceItemFile(null);
    setIsOpenAddInvoiceItem(true);
  }, []);

  const handleAddInvoiceItemClick = useCallback(() => {
    setIsOpenAddInvoiceItem(true);
    setSelectedInvoiceItem(null);
    setSelectedInvoiceItemFile(null);
  }, []);

  const handleAddItem = (item) => {
    setInvoiceItems((prevItems) => [...prevItems, item]);
  };

  const handleCloseModal = useCallback(() => {
    setIsOpenAddInvoiceItem(false);
    setSelectedInvoiceItem(null);
    setSelectedInvoiceItemFile(null);
  }, []);

  // تابع برای افزودن قلم جدید به لیست (به‌روز شده)
  const handleAddNewInvoiceItem = useCallback((newInvoiceItem) => {
    setInvoiceItems((prevInvoiceItems) => [...prevInvoiceItems, newInvoiceItem]);
    toast.success("کالا با موفقیت افزوده شد.");
    setIsOpenAddInvoiceItem(false);
  }, []);

  return (
    <FormTemplate>
      {isOpenAddInvoiceItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddInvoiceItem
              invoiceItem={selectedInvoiceItem}
              invoiceItemFile={selectedInvoiceItemFile}
              onClose={handleCloseModal}
              refreshInvoiceItems={refreshInvoiceItems}
              onAddNewInvoiceItem={handleAddNewInvoiceItem} // انتقال تابع افزودن جدید
              onAddItem={handleAddItem}
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">فاکتور خرید</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add invoiceItem"
            onClick={handleAddInvoiceItemClick}
          >
            افزودن کالا
          </button>
        </div>
  {/* /////////////////////////////////////////// */}
           {/* انتخاب مشتری */}
           <div className="flex items-center gap-4 px-2">

           <div className="flex items-center">
          <label htmlFor="customer">مشتری:</label>
          <select
           className={`w-full mb-4 mt-2 border bg-gray-300 dark:bg-zinc-600 ${
            errors.description ? "border-red-400" : "border-gray-300"
          } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            id="customer"
            {...register('customer', { required: 'مشتری الزامی است' })}
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
          {errors.customer && <span>{errors.customer.message}</span>}
        </div>

        {/* انتخاب ارز */}
        <div className="flex items-center">
          <label htmlFor="currency">ارز:</label>
          <select
                        className={`w-full mb-4 mt-2 border bg-gray-300 dark:bg-zinc-600 ${
                          errors.description ? "border-red-400" : "border-gray-300"
                        } rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
          
            id="currency"
            {...register('currency', { required: 'ارز الزامی است' })}
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
          {errors.currency && <span>{errors.currency.message}</span>}
        </div>
           </div>

            {/* //////////////////////////////// */}
     
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {invoiceItems.map((invoiceItem) => (
            <InvoiceItemCard
              className="p-2 md:p-4"
              key={invoiceItem._id}
              invoiceItem={invoiceItem}
              editFunction={() => handleEditClick(invoiceItem)}
              onDelete={() => handleDeleteInvoiceItem(invoiceItem._id)} // پاس دادن تابع حذف
            />
          ))}
        </div>
         {/* فوتر */}
         <div className="footer">
                    <div>تعداد کل اقلام: {totalItems}</div>
                    <div>جمع کل فاکتور: {totalPrice.toLocaleString()} تومان</div>
                    <div>تعداد ردیف‌ها: {totalRows}</div>
                </div>
      </div>
      <Toaster />
    </FormTemplate>
  );
}

export default AddPurchaseInvoice;