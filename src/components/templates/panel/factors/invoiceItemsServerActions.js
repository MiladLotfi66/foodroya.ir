"use server";
import mongoose from 'mongoose';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Ledger from '../FinancialDocument/Ledger';
import GeneralLedger from '../FinancialDocument/GeneralLedger';
import connectDB from '@/utils/connectToDB';
import { authenticateUser } from '@/templates/Shop/ShopServerActions';
import Product from '../Product/Product';
import Account from '../Account/Account'; // اطمینان از وارد کردن مدل Account

/**
 * تابع AddPurchaseInvoiceAction برای ثبت فاکتور خرید همراه با اقلام و اسناد مالی
 * @param {Object} invoiceData - داده‌های فاکتور خرید
 * @returns {Object} - نتیجه عملیات
 */
export async function AddPurchaseInvoiceAction(invoiceData) {
  
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
        totalPrice: invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      // ذخیره فاکتور
      await invoice.save({ session });

      // ایجاد و ذخیره اقلام فاکتور
      const invoiceItemIds = [];
      const accountIdMap = {}; // نقشه برای جمع‌آوری مبلغ هر حساب موجودی
      const bulkProductOperations = {}; // برای به‌روزرسانی دسته‌ای موجودی محصولات
      const bulkAccountOperations = {}; // برای به‌روزرسانی دسته‌ای مانده حساب‌ها

      for (const item of invoiceData.invoiceItems) {
        // اعتبارسنجی اقلام فاکتور
        const requiredItemFields = ['productId', 'title', 'quantity', 'unitPrice', 'totalPrice'];
        for (const field of requiredItemFields) {
          if (!item[field]) {
            throw new Error(`لطفاً فیلد ${field} در اقلام فاکتور را پر کنید.`);
          }
        }

        // دریافت حساب موجودی محصول
        const product = await Product.findById(item.productId).session(session);
        if (!product || !product.accountId) {
          throw new Error(`محصول با شناسه ${item.productId} معتبر نیست یا حساب موجودی ندارد.`);
        }

        // جمع‌آوری مبلغ برای حساب موجودی
        const amount = item.totalPrice;
        if (accountIdMap[product.accountId.toString()]) {
          accountIdMap[product.accountId.toString()] += amount;
        } else {
          accountIdMap[product.accountId.toString()] = amount;
        }

        const invoiceItem = new InvoiceItem({
          product: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          invoice: invoice._id,
          description: item.description || '',
          Features: item.Features || [],
        });

        await invoiceItem.save({ session });
        invoiceItemIds.push(invoiceItem._id);

        // جمع‌آوری عملیات به‌روزرسانی برای محصولات
        if (bulkProductOperations[item.productId]) {
          bulkProductOperations[item.productId].quantity += item.quantity;
        } else {
          bulkProductOperations[item.productId] = { productId: item.productId, quantity: item.quantity };
        }
      }

      // اجرای Bulk Update برای به‌روزرسانی موجودی محصولات
      const bulkProductOpsArray = Object.values(bulkProductOperations).map(op => ({
        updateOne: {
          filter: { _id: op.productId },
          update: { $inc: { stock: op.quantity } },
        }
      }));

      if (bulkProductOpsArray.length > 0) {
        const bulkWriteProductResult = await Product.bulkWrite(bulkProductOpsArray, { session });
        // بررسی نتیجه Bulk Write
        const modifiedCount = bulkWriteProductResult.nModified || bulkWriteProductResult.modifiedCount;
        if (modifiedCount !== bulkProductOpsArray.length) {
          throw new Error('بعضی از به‌روزرسانی‌های موجودی محصول موفقیت‌آمیز نبودند.');
        }
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

      // ایجاد GeneralLedger بر اساس accountAllocations (بستانکار)
      const generalLedgers = [];

      for (const allocation of invoiceData.accountAllocations) {
        const generalLedger = new GeneralLedger({
          ledger: ledger._id,
          account: allocation.accountId,
          debit: 0,
          credit: allocation.amount, // بستانکار
          description: `تراکنش مربوط به فاکتور ${invoice._id}`,
          type: "invoice",
          shop: invoice.shop,
          createdBy: user.id,
          updatedBy: user.id,
        });

        await generalLedger.save({ session });
        generalLedgers.push(generalLedger._id);

        // جمع‌آوری عملیات به‌روزرسانی مانده حساب‌ها (بستانکار کردن)
        if (bulkAccountOperations[allocation.accountId.toString()]) {
          bulkAccountOperations[allocation.accountId.toString()].credit += allocation.amount;
        } else {
          bulkAccountOperations[allocation.accountId.toString()] = { accountId: allocation.accountId, credit: allocation.amount };
        }
      }

      // ایجاد GeneralLedger برای بدهکار کردن حساب‌های موجودی
      for (const [accountId, amount] of Object.entries(accountIdMap)) {
        const generalLedger = new GeneralLedger({
          ledger: ledger._id,
          account: accountId,
          debit: amount, // بدهکار
          credit: 0,
          description: `بدهکار کردن حساب موجودی برای فاکتور ${invoice._id}`,
          type: "invoice",
          shop: invoice.shop,
          createdBy: user.id,
          updatedBy: user.id,
        });

        await generalLedger.save({ session });
        generalLedgers.push(generalLedger._id);

        // جمع‌آوری عملیات به‌روزرسانی مانده حساب‌ها (بدهکار کردن)
        if (bulkAccountOperations[accountId.toString()]) {
          bulkAccountOperations[accountId.toString()].debit += amount;
        } else {
          bulkAccountOperations[accountId.toString()] = { accountId: accountId, debit: amount };
        }
      }

      // اجرای Bulk Update برای به‌روزرسانی مانده حساب‌ها
      const bulkAccountOpsArray = Object.values(bulkAccountOperations).map(op => {
        // بر اساس ماهیت حساب، خرج یا دریافت مبلغ
        // فرض بر این است که "بستانکار" به معنای افزایش در بستانکار حساب و "بدهی" کاهش در بدهی حساب
        // و بالعکس برای "بدهکار" و "بستاکار"
        // این منطق بسته به نیاز شما ممکن است متفاوت باشد
        const updateFields = {};
        // نیاز به تعیین دقیق نحوه به‌روزرسانی بر اساس ماهیت حساب دارد
        // به عنوان مثال:
        // اگر حساب بستانکار است:
        //   - بستانکار: $inc: { balance: credit }
        //   - بدهکار: $inc: { balance: -debit }
        // اگر حساب بدهکار است:
        //   - بستانکار: $inc: { balance: -credit }
        //   - بدهکار: $inc: { balance: debit }
        
        // ابتدا باید ماهیت حساب را بیابیم
        // برای بهینه‌سازی، می‌توانند از $lookup یا دیگر روش‌ها استفاده کرد،
        // اما برای سادگی در اینجا فرض می‌کنیم که اطلاعات ماهیت حساب در این نقطه در دسترس است
        // لذا نیاز به استخراج این اطلاعات قبل از اجرای bulkWrite داریم

        // برای مثال:
        // const account = await Account.findById(op.accountId).session(session);
        // if (account.accountNature === "بستانکار") { ... }

        // با توجه به محدودیت‌های فعلی، ممکن است نیاز به پردازش جداگانه داشته باشید
        // ولی برای بهینه‌سازی بهتر، می‌توان از aggregation استفاده کرد

        // در این نمونه، فرض می‌کنیم که تمامی حساب‌ها بستانکار هستند
        // و فقط مبالغ به صورت ساده $inc می‌شوند
        // لطفاً منطق دقیق بر اساس ماهیت حساب‌های شما تنظیم شود

        // به طور ساده:
        if (op.debit && op.credit) {
          updateFields.balance = op.debit - op.credit;
        } else if (op.debit) {
          updateFields.balance = op.debit;
        } else if (op.credit) {
          updateFields.balance = -op.credit;
        }

        return {
          updateOne: {
            filter: { _id: op.accountId },
            update: { $inc: { balance: updateFields.balance } },
          }
        };
      });

      if (bulkAccountOpsArray.length > 0) {
        const bulkWriteAccountResult = await Account.bulkWrite(bulkAccountOpsArray, { session });
        // بررسی نتیجه Bulk Write
        const modifiedCount = bulkWriteAccountResult.nModified || bulkWriteAccountResult.modifiedCount;
        if (modifiedCount !== bulkAccountOpsArray.length) {
          throw new Error('بعضی از به‌روزرسانی‌های مانده حساب‌ها موفقیت‌آمیز نبودند.');
        }
      }

      // به‌روزرسانی فیلد transactions در Ledger
      ledger.transactions = generalLedgers;
      await ledger.save({ session });

      // بازگرداندن فاکتور ثبت شده
      return invoice;
    });

    // پایان ترنسکشن موفقیت‌آمیز
    return { success: true, message: 'فاکتور با موفقیت ثبت شد.' };
  } catch (error) {
    // در صورت بروز خطا، ترنسکشن ابورت می‌شود و تغییرات لغو می‌شوند
    console.error('خطا در AddPurchaseInvoiceAction:', error);
    return { success: false, message: `ثبت فاکتور با مشکل مواجه شد: ${error.message}` };
  } finally {
    // پایان Session
    session.endSession();
  }
}
