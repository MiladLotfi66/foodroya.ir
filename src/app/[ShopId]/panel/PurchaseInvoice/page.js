import AddInvoice from "@/templates/panel/factors/AddInvoice";
import { INVOICE_TYPES } from "@/templates/panel/factors/invoiceTypes";

function Page() {
  return (
    <div>
      {/* فاکتور خرید */}
      <AddInvoice invoiceType={INVOICE_TYPES.PURCHASE} />

    
    </div>
  );
}
export default Page

  // {/* برگشت از فروش */}
  // <AddInvoice invoiceType={INVOICE_TYPES.SALE_RETURN} />

  // {/* ضایعات */}
  // <AddInvoice invoiceType={INVOICE_TYPES.WASTE} />