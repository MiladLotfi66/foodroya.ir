"use client";
import { useState, useEffect, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import InvoiceCard from "./InvoiceCard";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { GetShopInvocesByShopId } from "./InvoicesActions";
import { deleteInvoiceAction } from "./invoiceItemsServerActions";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";

function InvoiceManage() {
  const [selectedInvioce, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const {
    currentShopId,
    shopPanelImage,
     } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
   const BGImage=shopPanelImage;
  
  const refreshInvioces = useCallback(async () => {
    try {
      const response = await GetShopInvocesByShopId(ShopId);
      setInvoices(response.Invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    refreshInvioces();
  }, [refreshInvioces]);

  const handleDeleteInvoice = useCallback(async (InvoiceID) => {
    const isConfirmed = window.confirm("آیا از حذف این فاکتور اطمینان دارید؟");
    if (!isConfirmed) return; // اگر کاربر لغو کند، ادامه نده
    let res = await deleteInvoiceAction(InvoiceID,ShopId);
    if (res.success) {
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== InvoiceID);
      setInvoices(updatedInvoices);    
    } else {
      console.error("Error deleting invoice:", res.status);
    }
  }, [invoices]);
  const handleEditClick = (invoice) => {
    setIsOpenAddInvoice(true);
    setSelectedInvoice(invoice);
  };
  // const handleOverlayClick = (e) => {
  //   if (e.target === e.currentTarget) {
  //     setIsOpenAddInvoice(false);
  //     setSelectedInvoice(null);
  //     setIsOpenContactsList(false);
  //     setSelectedContacts([]);
  //     setUserListButtonName("");
  //   }
  // };

  // const handleCloseModal = () => {
  //   setIsOpenAddInvoice(false);
  //   setSelectedInvoice(null);
  // };


  // const handleSubmit = async (formData) => {
  //   await refreshInvoices();
  // };

  return (
    <FormTemplate BGImage={BGImage}>
         <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="hidden">
          <EditSvg />
          <DeleteSvg />
        </div>
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت فاکتور ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
          >
            افزودن 
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-2 p-4 pb-16 max-h-[70vh] overflow-y-auto justify-items-center">
          {invoices?.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              handleDeleteInvoice={handleDeleteInvoice}
              handleEditClick={() => handleEditClick(invoice)}
              ShopId
            />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default InvoiceManage;
