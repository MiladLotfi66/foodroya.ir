"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceItemCard from "./InvoiceItemCard";
import AddInvoiceItem from "./AddInvoiceItem";
import { useParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { GetAllContacts } from "../Contact/contactsServerActions";
import { v4 as uuidv4 } from 'uuid';
import SubmitInvoiceModal from "./SubmitInvoiceModal";
import Link from "next/link";
import { INVOICE_TYPES } from "./invoiceTypes"; // وارد کردن انواع فاکتورها
import getProductPrice from "./getProductPrice";

function AddInvoice({ invoiceType }) {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isOpenAddInvoiceItem, setIsOpenAddInvoiceItem] = useState(false);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const params = useParams();
  const { ShopId } = params;
  const [contactsOptions, setContactsOptions] = useState([]);
  const [selectedContact, setSelectedContact] = useState(""); // نام عمومی‌تر
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

    fetchContacts();
  }, [ShopId]);

  // استفاده از useEffect برای بروز رسانی قیمت‌ها هنگام تغییر مخاطب
  useEffect(() => {
    const updatePrices = async () => {
      if (!selectedContact || invoiceItems.length === 0) return;
  
      // فقط برای فاکتورهای فروش بروز رسانی قیمت‌ها
      if (invoiceType !== INVOICE_TYPES.SALE) return;
  
      try {
        const updatedItems = await Promise.all(invoiceItems.map(async (item) => {
          const newPrice = await getProductPrice(item.productId, selectedContact);
          return {
            ...item,
            unitPrice: newPrice,
            totalPrice: (parseInt(item.quantity, 10) || 0) * (parseFloat(newPrice) || 0),
          };
        }));
        setInvoiceItems(updatedItems);
        toast.success("قیمت‌ها با موفقیت به‌روزرسانی شدند.");
      } catch (error) {
        console.error("خطا در بروز رسانی قیمت‌ها:", error);
        toast.error("خطا در بروز رسانی قیمت‌ها.");
      }
    };
  
    updatePrices();
  }, [selectedContact, invoiceItems.length, invoiceType]); // اضافه کردن invoiceType به وابستگی‌ها
  
  const handleAddNewInvoiceItem = useCallback(async (newInvoiceItem) => {
    if (!selectedContact) 
      {
      toast.error("لطفاً مشتری را انتخاب کنید قبل از افزودن کالا.");
      return;
    }
  
    try {
      let unitPrice = 0;
      if (invoiceType === INVOICE_TYPES.SALE) {
        // فقط برای فاکتور فروش قیمت را از سرور دریافت کنید
        const fetchedPrice = await getProductPrice(newInvoiceItem.productId, selectedContact);
        unitPrice = fetchedPrice;
      } 
  
      const itemWithUniqueKey = {
        ...newInvoiceItem,
        uniqueKey: uuidv4(),
        unitPrice: unitPrice,
        totalPrice: (parseInt(newInvoiceItem.quantity, 10) || 0) * (parseFloat(unitPrice) || 0),
      };
      setInvoiceItems((prevInvoiceItems) => [...prevInvoiceItems, itemWithUniqueKey]);
      toast.success("کالا با موفقیت افزوده شد.");
      setIsOpenAddInvoiceItem(false);
    } catch (error) {
      console.error("خطا در دریافت قیمت کالا:", error);
      toast.error("خطا در دریافت قیمت کالا.");
    }
  }, [selectedContact, invoiceType]);

  const handleUpdateInvoiceItem = useCallback((updatedItem) => {
    const updatedItemWithTotalPrice = {
      ...updatedItem,
      totalPrice: (parseInt(updatedItem.quantity, 10) || 0) * (parseFloat(updatedItem.unitPrice) || 0),
    };
    setInvoiceItems((prevInvoiceItems) =>
      prevInvoiceItems.map(item => item.uniqueKey === updatedItemWithTotalPrice.uniqueKey ? updatedItemWithTotalPrice : item)
    );
  }, []);

  const handleOpenSubmitModal = () => {
    if (!selectedContact) {
      toast.error(`لطفاً ${getContactLabel()} را انتخاب کنید.`);
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error("لطفاً حداقل یک آیتم به فاکتور اضافه کنید.");
      return;
    }
    setIsOpenSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setIsOpenSubmitModal(false);
  };

  const onSubmit = (data) => {
    // پردازش نهایی داده‌های فرم
  };
  const description = watch('description');

  const invoiceData = {
    contact: contactsOptions.find(c => c._id === selectedContact) || "",
    totalItems,
    totalPrice,
    totalRows,
    type: invoiceType,
    description,
    ShopId
  };

  useEffect(() => {
    const subscription = watch((value) => {
      invoiceData.description = value.description || "";
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleDeleteInvoiceItem = useCallback((invoiceItemId) => {
    setInvoiceItems((prevInvoiceItems) =>
      prevInvoiceItems.filter((item) => item.uniqueKey !== invoiceItemId)
    );
    toast.success("کالا با موفقیت از لیست حذف شد.");
  }, []);

  const handleAddInvoiceItemClick = useCallback(() => {
    setIsOpenAddInvoiceItem(true);
    setSelectedInvoiceItem(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpenAddInvoiceItem(false);
    setSelectedInvoiceItem(null);
  }, []);

  const getContactLabel = () => {
    switch (invoiceType) {
      case INVOICE_TYPES.PURCHASE:
      case INVOICE_TYPES.PURCHASE_RETURN:
      case INVOICE_TYPES.WASTE:
        return "تامین‌کننده";
      case INVOICE_TYPES.SALE:
      case INVOICE_TYPES.SALE_RETURN:
        return "مشتری";
      default:
        return "مشتری/تامین‌کننده";
    }
  };

  const getPageTitle = () => {
    switch (invoiceType) {
      case INVOICE_TYPES.PURCHASE:
        return "فاکتور خرید";
      case INVOICE_TYPES.SALE:
        return "فاکتور فروش";
      case INVOICE_TYPES.PURCHASE_RETURN:
        return "برگشت از خرید";
      case INVOICE_TYPES.SALE_RETURN:
        return "برگشت از فروش";
      case INVOICE_TYPES.WASTE:
        return "فاکتور ضایعات";
      default:
        return "فاکتور";
    }
  };

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
              onUpdate={handleUpdateInvoiceItem}
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
        invoiceType={invoiceType}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">{getPageTitle()}</h1>
          <button
            type="button"
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add invoiceItem"
            onClick={handleAddInvoiceItemClick}
          >
            افزودن کالا
          </button>
        </div>
        <div className="flex gap-4 px-2">
          {/* فیلد مشتری/تامین‌کننده */}
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="contact" className="mb-2">{getContactLabel()}:</label>
            <select
              className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.contact ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              id="contact"
              {...register("contact", { required: `${getContactLabel()} الزامی است` })}
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
            >
              <option value="">انتخاب {getContactLabel()}</option>
              {contactsOptions.map((contact) => (
                <option key={contact._id} value={contact.uniqueKey || contact._id}>
                  {contact.name}
                </option>
              ))}
            </select>
            {errors.contact && <span className="text-red-500">{errors.contact.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {invoiceItems.length > 0 ? (
            invoiceItems.map((invoiceItem) => (
              <InvoiceItemCard
                key={invoiceItem.uniqueKey}
                invoiceItem={invoiceItem}
                editFunction={() => handleEditClick(invoiceItem)} // اطمینان از تعریف handleEditClick
                onDelete={() => handleDeleteInvoiceItem(invoiceItem.uniqueKey)} // استفاده از uniqueKey
                onUpdate={handleUpdateInvoiceItem}
                invoiceType={invoiceType} // اگر نیاز به تنظیمات خاص برای نوع فاکتور دارید
              />
            ))
          ) : (
            <div className="col-span-full border border-gray-300 rounded p-8 text-center text-gray-500">
              هنوز کالایی انتخاب نشده است.
            </div>
          )}
        </div>

        {/* فیلد توضیحات */}
        <div className="flex flex-col md:items-center md:flex-row m-2 md:col-span-2">
          <label htmlFor="description" className="mb-2">توضیحات:</label>
          <textarea
            className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.description ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            id="description"
            {...register("description")}
            placeholder={`توضیحات ${getPageTitle()} را وارد کنید...`}
          ></textarea>
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

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

export default AddInvoice;
