"use client";
import { useEffect, useState, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceItemCard from "./InvoiceItemCard";
import AddInvoiceItem from "./AddInvoiceItem";
import { Toaster, toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { GetAllContacts } from "../Contact/contactsServerActions";
import { v4 as uuidv4 } from 'uuid';
import SubmitInvoiceModal from "./SubmitInvoiceModal";
import { INVOICE_TYPES } from "./invoiceTypes"; // وارد کردن انواع فاکتورها
import getProductPrice from "./getProductPrice";
import { calculateProductCost } from "./invoiceItemsServerActions";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
////////////////////accessibility//////////
import { useSession } from "next-auth/react";
import { getUserPermissionInShopAccessList } from "../rols/RolesPermissionActions";
import NotAuthenticated from "../rols/NotAuthenticated";
import PermissionLoading from "../rols/PermissionLoading";
import NoPermission from "../rols/NoPermission";
////////////////////////////////

function AddInvoice({ invoiceType }) {
 
  const { baseCurrency } = useShopInfoFromRedux();
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isOpenAddInvoiceItem, setIsOpenAddInvoiceItem] = useState(false);
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const [contactsOptions, setContactsOptions] = useState([]);
  const [selectedContact, setSelectedContact] = useState(""); // نام عمومی‌تر
  const [isOpenSubmitModal, setIsOpenSubmitModal] = useState(false);
  const [lastPath, setLastPath] = useState(['انبار']);
  const [lastParentAccountId, setLastParentAccountId] = useState(null);

  // استفاده از react-hook-form
  const { register, handleSubmit,reset, watch, formState: { errors } } = useForm();
  const totalItems = invoiceItems?.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalPrice = invoiceItems?.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const totalRows = invoiceItems?.length;
  const {
    currentShopId,
    shopPanelImage,
     } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
   const BGImage=shopPanelImage;
         ////////////////accessibility///////////////////
         const { data: session, status } = useSession();
         const isAuthenticated = status === "authenticated";
       
         const [hasViewPermission, setHasViewPermission] = useState(null);
         const [hasAddPermission, setHasAddPermission] = useState(null);
         const [hasEditPermission, setHasEditPermission] = useState(null);
         const [hasDeletePermission, setHasDeletePermission] = useState(null);
         const [permissionLoading, setPermissionLoading] = useState(true);
         const getPermissionKeyByInvoiceType = (invoiceType) => {
          switch (invoiceType) {
            case INVOICE_TYPES.PURCHASE:
              return "purchaseInvoicesPermissions";
            case INVOICE_TYPES.SALE:
              return "saleInvoicesPermissions";
            case INVOICE_TYPES.PURCHASE_RETURN:
              return "purchaseReturnInvoicesPermissions";
            case INVOICE_TYPES.SALE_RETURN:
              return "saleReturnInvoicesPermissions";
              case INVOICE_TYPES.WASTE:
                return "wasteInvoicesPermissions";
          }
        };
         const checkViewPermission = useCallback(async () => {
           if (!isAuthenticated) {
             setPermissionLoading(false);
             return;
           }
           if (!ShopId) {
             // اگر ShopId موجود نیست، منتظر بمانید تا مقداردهی شود
             return;
           }
           setPermissionLoading(true); // شروع بارگذاری مجدد
           try {
            const permissionKey = getPermissionKeyByInvoiceType(invoiceType);
            const response = await getUserPermissionInShopAccessList(ShopId, permissionKey);
             if (response.status === 200) {
               // بررسی اینکه آیا دسترسی view در آرایه hasPermission وجود دارد
              //  setHasViewPermission(response.hasPermission.includes("view"));
               setHasAddPermission(response.hasPermission.includes("add"));
              //  setHasEditPermission(response.hasPermission.includes("edit"));
              //  setHasDeletePermission(response.hasPermission.includes("delete"));
             } else {
               console.error("خطا در بررسی دسترسی:", response.message);
              //  setHasViewPermission(false);
               setHasAddPermission(false);
              //  setHasEditPermission(false);
              //  setHasDeletePermission(false);
             }
           } catch (error) {
             console.error("Error checking view permission:", error);
            //  setHasViewPermission(false);
             setHasAddPermission(false);
            //  setHasEditPermission(false);
            //  setHasDeletePermission(false);
             toast.error("خطا در بررسی دسترسی.");
           } finally {
             setPermissionLoading(false);
           }
         }, [ShopId, isAuthenticated]);
       
         useEffect(() => {
           if (isAuthenticated) {
             // بارگذاری دسترسی‌ها زمانی که احراز هویت انجام شده
             checkViewPermission();
           } else {
             // اگر احراز هویت نشده باشد، مطمئن شوید که وضعیت بارگذاری تنظیم شده است
             setPermissionLoading(false);
           }
         }, [checkViewPermission, isAuthenticated]);
       
       ///////////////////////////////
       
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchContacts = async () => {
      try {
        const response = await GetAllContacts(ShopId);
        setContactsOptions(response.contacts);
      } catch (error) {
        console.error("خطا در واکشی حساب‌ها:", error);
      }
    };

    fetchContacts();
  }, [ShopId,isAuthenticated]);

  // استفاده از useEffect برای بروز رسانی قیمت‌ها هنگام تغییر مخاطب
  useEffect(() => {
    if (!isAuthenticated) return;

    const updatePrices = async () => {
      if (!selectedContact || invoiceItems?.length === 0) return;
  
      // فقط برای فاکتورهای فروش بروز رسانی قیمت‌ها
      if (invoiceType === INVOICE_TYPES.SALE ) {

     
  
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
                // استخراج پیام خطا از سرور
        const errorMessage = error?.message || "خطا در بروز رسانی قیمت‌ها.";
        toast.error(errorMessage);

      }
    }
      else if  (invoiceType === INVOICE_TYPES.WASTE ) {
        try {
          const updatedItems = await Promise.all(invoiceItems.map(async (item) => {
            const newPrice = await calculateProductCost(item.productId);
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
                  // استخراج پیام خطا از سرور
          const errorMessage = error?.message || "خطا در بروز رسانی قیمت‌ها.";
          toast.error(errorMessage);
        

      }
    }
    };
  
    updatePrices();
  }, [isAuthenticated,selectedContact, invoiceItems?.length, invoiceType]);
    
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
    
      // استخراج پیام خطا از سرور
      const errorMessage = error?.message || "خطا در دریافت قیمت کالا.";
      toast.error(errorMessage);
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
  reset(); // ریست کردن فرم‌های مدیریت‌شده توسط react-hook-form
  setSelectedContact(""); // ریست کردن وضعیت محلی انتخاب مخاطب
  setInvoiceItems([]);
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
    ///////////////////////////////////////
    if (status === "loading" || permissionLoading) {
      return <PermissionLoading BGImage={BGImage} />;
    }
  
    if (!isAuthenticated) {
      return <NotAuthenticated />;
    }
  
    if (!hasAddPermission) {
      return <NoPermission />;
    }
  
    ///////////////////////////////////////////////
  return (
    <FormTemplate BGImage={BGImage}>
      {isOpenAddInvoiceItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 "
          onClick={handleCloseModal}
        >
          <div
            className="mt-2 mb-2 relative bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddInvoiceItem
              invoiceItem={selectedInvoiceItem}
              onClose={handleCloseModal}
              onAddNewInvoiceItem={handleAddNewInvoiceItem}
              onUpdate={handleUpdateInvoiceItem}
              invoiceType={invoiceType}
              initialPath={lastPath}
              initialParentAccountId={lastParentAccountId}
              onPathChange={setLastPath}
              onParentAccountIdChange={setLastParentAccountId}
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

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-6 ">
        <div className="flex justify-between p-2 md:p-5 mt-6">
          <h1 className="text-xl md:text-2xl font-MorabbaBold" >{getPageTitle()}</h1>
        </div>
        <div className="text-xs md:text-base  flex items-center text-center gap-2 md:gap-4 px-2 mb-2 md:mb-4">
          {/* فیلد مشتری/تامین‌کننده */}
          <div className="flex items-center gap-2 ">
            <label htmlFor="contact" >{getContactLabel()}:</label>
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
          <button
            type="button"
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white my-2 px-2 py-2"
            aria-label="add invoiceItem"
            onClick={handleAddInvoiceItemClick}
          >
            افزودن 
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 p-1 md:p-4 pb-4 md:pb-16 max-h-[60vh] overflow-y-auto">
          {invoiceItems?.length > 0 ? (
            invoiceItems?.map((invoiceItem) => (
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
        <div className="flex flex-col md:items-center md:flex-row m-2 md:col-span-2 text-xs md:text-base">
          <label htmlFor="description" className="mb-1  md:mb-2">توضیحات:</label>
          <textarea
            className={`w-full border bg-gray-300 dark:bg-zinc-600 ${errors.description ? "border-red-400" : "border-gray-300"} rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500`}
            id="description"
            {...register("description")}
            placeholder={`توضیحات ${getPageTitle()} را وارد کنید...`}
          ></textarea>
          {errors.description && <span className="text-red-500">{errors.description.message}</span>}
        </div>

        <div className="bg-gray-100 dark:bg-zinc-800 shadow-md rounded-lg p-2 md:p-4 mt-2 md:mt-6 text-xs md:text-lg">
          <div className="flex flex-row justify-between items-center">
            <div className="text-gray-800 dark:text-gray-200">
              <div>تعداد کل اقلام: <span className="font-bold">{totalItems}</span></div>
              <div>جمع کل فاکتور: <span className="font-bold">{totalPrice?.toLocaleString()} {baseCurrency.title}</span></div>
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
