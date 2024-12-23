import AddInvoice from "@/templates/panel/factors/AddInvoice";
import { INVOICE_TYPES } from "@/templates/panel/factors/invoiceTypes";

function Page() {
  return (
    <div>

 {/* ضایعات */}
 <AddInvoice invoiceType={INVOICE_TYPES.WASTE} />
    </div>
  );
}
export default Page



