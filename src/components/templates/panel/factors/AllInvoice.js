// InvoiceManage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import { useParams } from "next/navigation";
import InvoiceCard from "./InvoiceCard";
import EditSvg from "@/module/svgs/EditSvg";
import DeleteSvg from "@/module/svgs/DeleteSvg";
import { GetShopInvocesByShopId } from "./InvoicesActions";
import { deleteInvoiceAction } from "./invoiceItemsServerActions2";

function InvoiceManage() {
  const [selectedInvioce, setSelectedInvoice] = useState(null);
  const params = useParams();
  const { ShopId } = params;
  const [invoices, setInvoices] = useState([]);
  
  const refreshInvioces = useCallback(async () => {
    try {
      const response = await GetShopInvocesByShopId(ShopId);
      
      setInvoices(response.Invoices);
      // فرض می‌کنیم هر فاکتور دارای یک فیلد contacts که آرایه‌ای از مخاطبان است
     
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    refreshInvioces();
  }, [refreshInvioces]);





/////////////////////////////////////////////



  const handleDeleteInvoice = useCallback(async (InvoiceID) => {
    let res = await deleteInvoiceAction(InvoiceID,ShopId);
    console.log("res",res);
    
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddInvoice(false);
      setSelectedInvoice(null);
      setIsOpenContactsList(false);
      setSelectedContacts([]);
      setUserListButtonName("");
    }
  };

  const handleCloseModal = () => {
    setIsOpenAddInvoice(false);
    setSelectedInvoice(null);
  };


  const handleSubmit = async (formData) => {
    await refreshInvoices();
  };

  return (
    <FormTemplate>
         <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="hidden">
          <EditSvg />
          <DeleteSvg />
        </div>
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت فاکتور ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
          >
            افزودن فاکتور
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-2 p-4 pb-16 justify-items-center">
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
