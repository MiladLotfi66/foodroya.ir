"use server";
// utils/invoiceItemActions.js
import connectDB from "@/utils/connectToDB";
import InvoiceItem from "./InvoiceItem";
import Invoice from "./Invoice";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import GeneralLedger from "../FinancialDocument/GeneralLedger";
import Ledger from "../FinancialDocument/Ledger";

export async function AddPurchaseInvoiceAction(invoiceData) {
  console.log("invoiceData",invoiceData);
  
  await connectDB();
  // اعتبارسنجی داده‌ها (می‌توانید از کتابخانه‌ای مانند Joi نیز استفاده کنید)
  if (!invoiceData.description || !invoiceData.type || !invoiceData.totalAmount || !invoiceData.items) {
    throw new Error('لطفاً تمام فیلدها را پر کنید.');
}
const invoice = new Invoice({
  description: invoiceData.description,
  type: invoiceData.type,
  totalAmount: invoiceData.totalAmount,
  items: invoiceData.items,
  // سایر فیلدها
});

await invoice.save();

return invoice;


}