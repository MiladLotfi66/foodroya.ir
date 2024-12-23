import AddInvoice from "@/templates/panel/factors/AddInvoice";
import { INVOICE_TYPES } from "@/templates/panel/factors/invoiceTypes";

function Page() {
  return (
    <div>
  {/* فاکتور فروش */}
  <AddInvoice invoiceType={INVOICE_TYPES.SALE} />

    
    </div>
  );
}
export default Page

  // {/* برگشت از خرید */}
  // <AddInvoice invoiceType={INVOICE_TYPES.PURCHASE_RETURN} />

  // {/* برگشت از فروش */}
  // <AddInvoice invoiceType={INVOICE_TYPES.SALE_RETURN} />

  // {/* ضایعات */}
  // <AddInvoice invoiceType={INVOICE_TYPES.WASTE} />