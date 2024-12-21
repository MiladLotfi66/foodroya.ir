"use server";
import mongoose from 'mongoose';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Ledger from '../FinancialDocument/Ledger';
import GeneralLedger from '../FinancialDocument/GeneralLedger';
import connectDB from '@/utils/connectToDB';
import { authenticateUser } from '@/templates/Shop/ShopServerActions';

/**
 * تابع AddPurchaseInvoiceAction برای ثبت فاکتور خرید همراه با اقلام و اسناد مالی
 * @param {Object} invoiceData - داده‌های فاکتور خرید
 * @returns {Object} - فاکتور ثبت شده
 */
export async function AddPurchaseInvoiceAction(invoiceData) {
  console.log("invoiceData",invoiceData);
  
  // اتصال به پایگاه داده
  await connectDB();
  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.log("Authentication failed:", authError);
  }
    if (!user) {
  return { status: 401, message: 'کاربر وارد نشده است.' };
}
  // شروع یک Session برای ترنسکشن
  const session = await mongoose.startSession();

  try {
    // آغاز ترنسکشن
    await session.withTransaction(async () => {
      // اعتبارسنجی اولیه داده‌ها
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      for (const field of requiredFields) {
        if (!invoiceData[field]) {
          throw new Error(`لطفاً فیلد ${field} را پر کنید.`);
        }
      }

      // محاسبه totalItems
      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);

      // ایجاد فاکتور
      const invoice = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type,
        // totalCurrency: invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        // currency: invoiceData.currency,
        shop: invoiceData.storeId,
        createdBy: user.id, // فرض بر این است که createdBy در invoiceData موجود است
        updatedBy: user.id, // فرض بر این است که updatedBy در invoiceData موجود است
      });

      // ذخیره فاکتور
      await invoice.save({ session });

      // ایجاد و ذخیره اقلام فاکتور
      const invoiceItemIds = [];

      for (const item of invoiceData.invoiceItems) {
        // اعتبارسنجی اقلام فاکتور
        const requiredItemFields = ['productId', 'title', 'quantity', 'unitPrice', 'totalPrice'];
        for (const field of requiredItemFields) {
          if (!item[field]) {
            throw new Error(`لطفاً فیلد ${field} در اقلام فاکتور را پر کنید.`);
          }
        }

        const invoiceItem = new InvoiceItem({
          product: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          invoice: invoice._id,
          // currency: invoiceData.currency,
          description: item.description || '',
          Features: item.Features || [],
        });

        await invoiceItem.save({ session });
        invoiceItemIds.push(invoiceItem._id);
      }

      // به‌روزرسانی فیلد InvoiceItems در فاکتور
      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session }); // ذخیره مجدد با فیلد به‌روزرسانی شده

      // ایجاد Ledger
      const ledger = new Ledger({
        description: `ثبت فاکتور خرید ${invoice._id}`,
        shop: invoice.shop,
        createdBy: user.id,
        updatedBy: user.id,
      });

      await ledger.save({ session });

      // ایجاد GeneralLedger بر اساس accountAllocations
      const generalLedgers = [];

      for (const allocation of invoiceData.accountAllocations) {
        const generalLedger = new GeneralLedger({
          ledger: ledger._id,
          account: allocation.accountId,
          debit: allocation.amount, // فرض بر این است که debit است
          credit: 0,
          // currency: invoice.currency,
          description: `تراکنش مربوط به فاکتور ${invoice._id}`,
          type: "invoice",
          shop: invoice.shop,
          createdBy: user.id,
          updatedBy: user.id,
        });

        await generalLedger.save({ session });
        generalLedgers.push(generalLedger._id);
      }

      // به‌روزرسانی فیلد transactions در Ledger
      ledger.transactions = generalLedgers;
      await ledger.save({ session });

      // در صورت نیاز، می‌توانید اسناد مالی بیشتری ایجاد کنید

      // بازگرداندن فاکتور ثبت شده
      return invoice;
    });

    // پایان ترنسکشن موفقیت‌آمیز
    // می‌توانید فاکتور را بازگردانید یا پاسخ مناسبی ارسال کنید
    return { success: true, message: 'فاکتور با موفقیت ثبت شد.' };
  } catch (error) {
    // در صورت بروز خطا، ترنسکشن ابورت می‌شود و تغییرات لغو می‌شوند
    console.error('خطا در AddPurchaseInvoiceAction:', error);
    throw new Error(`ثبت فاکتور با مشکل مواجه شد: ${error.message}`);
  } finally {
    // پایان Session
    session.endSession();
  }
}
