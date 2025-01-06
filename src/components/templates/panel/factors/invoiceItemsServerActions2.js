"use server";
import mongoose from 'mongoose';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Ledger from '../FinancialDocument/Ledger';
import GeneralLedger from '../FinancialDocument/GeneralLedger';
import connectDB from '@/utils/connectToDB';
import Product from '../Product/Product';
import Account from '../Account/Account';
import { GetAccountIdBystoreIdAndAccountCode } from '../Account/accountActions';
import { getLastPurchasedPrice } from './invoiceItemsServerActions';
import { 
  getAuthenticatedUser,
  validateInvoiceData,
  createInvoiceItems,
  updateProductStock,
  updateAccountsBalance // احتمالاً این تابع قبلاً هست و از bulk استفاده می‌کرد
} from './invoiceItemsServerActions';

// توابع کمکی
async function updateAccountsBalanceIndividually(bulkAccountOperations, session) {
  for (const op of Object.values(bulkAccountOperations)) {
    const updateFields = {};

    if (op.debit) {
      updateFields.balance = op.debit;
    } else if (op.credit) {
      updateFields.balance = -op.credit;
    }

    const result = await Account.updateOne(
      { _id: op.accountId },
      { $inc: { balance: updateFields.balance } },
      { runValidators: true, session }
    );

    if (result.nModified !== 1 && result.modifiedCount !== 1) {
      throw new Error(`به‌روزرسانی حساب با شناسه ${op.accountId} موفقیت‌آمیز نبود.`);
    }
  }
}

export async function AddWasteAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const requiredFields = ['type', 'invoiceItems', 'storeId','customerId'];

      validateInvoiceData(invoiceData, requiredFields);

      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalAmount = invoiceData.invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);

      const waste = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type,
        totalPrice: totalAmount,
        totalItems: totalItems,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
        contact: invoiceData.customerId,
      });

      await waste.save({ session });

      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, waste._id, session, false);

      // کاهش موجودی کالا
      await updateProductStock(bulkProductOperations, false, session);

      waste.InvoiceItems = invoiceItemIds;
      await waste.save({ session });

      // ثبت اسناد مالی برای ضایعات
      await createFinancialDocumentsForWaste(
        `ثبت ضایعات ${waste._id}`,
        waste.shop,
        user.id,
        // invoiceData.accountAllocations,
        accountIdMap,
        totalAmount,
        session
      );

      return waste;
    });

    return { success: true, message: 'ضایعات با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddWasteAction:', error);
    return { success: false, message: `ثبت ضایعات با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

async function createFinancialDocumentsForWaste(
  description,
  shopId,
  userId,
  accountIdMap,
  totalWasteAmount,
  session
) {
  // دریافت شماره حساب هزینه‌های ضایعات
  const wasteExpenseAccount = await GetAccountIdBystoreIdAndAccountCode(shopId, '5000-4'); // فرض بر کد حساب هزینه‌های ضایعات
  if (!wasteExpenseAccount.success) {
    throw new Error(wasteExpenseAccount.message); // خطا در دریافت حساب هزینه‌های ضایعات
  }


  // دریافت حساب‌های موجودی کالا از map
  const inventoryAccounts = Object.keys(accountIdMap);

  const ledger = new Ledger({
    description,
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await ledger.save({ session });

  const generalLedgers = [];
  const bulkAccountOperations = {};

  // ثبت تراکنش بدهکار برای هزینه‌های ضایعات
  const wasteLedger = new GeneralLedger({
    ledger: ledger._id,
    account: wasteExpenseAccount.accountId,
    debit: totalWasteAmount,
    credit: 0,
    description: `ثبت هزینه‌های ضایعات برای ${description}`,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await wasteLedger.save({ session });
  generalLedgers.push(wasteLedger._id);

  // ثبت تراکنش بستانکار برای حساب‌های موجودی کالا
  for (const accountId of inventoryAccounts) {
    const amount = accountIdMap[accountId];

    const inventoryLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: 0,
      credit: amount,
      description: `کاهش موجودی کالا به علت ضایعات برای ${description}`,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await inventoryLedger.save({ session });
    generalLedgers.push(inventoryLedger._id);

    // به‌روزرسانی عملیات حسابداری
    if (bulkAccountOperations[accountId.toString()]) {
      bulkAccountOperations[accountId.toString()].credit += amount;
    } else {
      bulkAccountOperations[accountId.toString()] = { accountId: accountId, credit: amount };
    }
  }

  // ثبت تراکنش بدهکار برای حساب هزینه‌های ضایعات
  if (bulkAccountOperations[wasteExpenseAccount.accountId.toString()]) {
    bulkAccountOperations[wasteExpenseAccount.accountId.toString()].debit += totalWasteAmount;
  } else {
    bulkAccountOperations[wasteExpenseAccount.accountId.toString()] = { accountId: wasteExpenseAccount.accountId, debit: totalWasteAmount };
  }

  // به‌روزرسانی مانده حساب‌ها به صورت فردی
  await updateAccountsBalanceIndividually(bulkAccountOperations, session);

  ledger.transactions = generalLedgers;
  await ledger.save({ session });

  return ledger._id;
}

export async function AddSalesReturnAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      validateInvoiceData(invoiceData, requiredFields);

      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);

      const invoice = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type,
        totalPrice: -invoiceData.totalAmount,  // فاکتور برگشتی کل مبلغ منفی است
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      await invoice.save({ session });

      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, invoice._id, session, false);

      let totalCostOfGoods = 0;
      let totalSales = invoiceData.totalAmount;

      for (const item of invoiceData.invoiceItems) {
        const product = await Product.findById(item.productId).populate('accountId').session(session);
        if (!product) {
          throw new Error(`محصول با شناسه ${item.productId} یافت نشد.`);
        }
        const costPerUnit = product.stock > 0 && product.accountId.balance > 0 ? product.accountId.balance / product.stock : await getLastPurchasedPrice(product._id);
        if (!costPerUnit) {
          throw new Error(`قیمت خرید اخیر برای محصول ${product.title} یافت نشد.`);
        }
        totalCostOfGoods += parseFloat(costPerUnit) * item.quantity;
      }

      // در برگشت کالا به موجودی اضافه می‌شود
      await updateProductStock(bulkProductOperations, true, session);

      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session });
      await createFinancialDocumentsForSalesReturn(
        `ثبت برگشت از فروش ${invoice._id}`,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        totalCostOfGoods,
        totalSales,
        session
      );
      return invoice;
    });
    return { success: true, message: 'فاکتور برگشت با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddSalesReturnAction:', error);
    return { success: false, message: `ثبت برگشت با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

async function createFinancialDocumentsForSalesReturn(
  description,
  shopId,
  userId,
  accountAllocations,
  accountIdMap,
  totalCostOfGoods,
  totalSales,
  session
) {
  // دریافت حساب‌های مرتبط
  const salesReturnsAccount = await GetAccountIdBystoreIdAndAccountCode(shopId, '5000-2'); // فرض بر کد حساب برگشت از فروش
  if (!salesReturnsAccount.success) {
    throw new Error(salesReturnsAccount.message); // خطا در دریافت حساب برگشت از فروش
  }

  const costOfGoodsAccount = await GetAccountIdBystoreIdAndAccountCode(shopId, '5000-1');
  if (!costOfGoodsAccount.success) {
    throw new Error(costOfGoodsAccount.message); // خطا در دریافت حساب بهای تمام‌شده کالا
  }

  const salesRevenueAccount = await GetAccountIdBystoreIdAndAccountCode(shopId, '4000-1');
  if (!salesRevenueAccount.success) {
    throw new Error(salesRevenueAccount.message); // خطا در دریافت حساب فروش کالا
  }

  const ledger = new Ledger({
    description,
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });
  await ledger.save({ session });

  const generalLedgers = [];
  const bulkAccountOperations = {};

  // تخصیصات حساب‌ها
  for (const allocation of accountAllocations) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: allocation.accountId,
      debit: 0,
      credit: allocation.amount, // برای دریافتی بستانکار می‌شود
      description: `تراکنش مربوط به ${description}`,
      type: 'invoice',
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await generalLedger.save({ session });
    generalLedgers.push(generalLedger._id);

    if (bulkAccountOperations[allocation.accountId.toString()]) {
      bulkAccountOperations[allocation.accountId.toString()].credit += allocation.amount;
    } else {
      bulkAccountOperations[allocation.accountId.toString()] = { accountId: allocation.accountId, credit: allocation.amount };
    }
  }

  // ثبت بدهکار در حساب برگشت از فروش
  const salesReturnLedger = new GeneralLedger({
    ledger: ledger._id,
    account: salesReturnsAccount.accountId,
    debit: totalSales,
    credit: 0,
    description: `برگشت از فروش ${description}`,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await salesReturnLedger.save({ session });
  generalLedgers.push(salesReturnLedger._id);

  // بستانکاری بهای تمام شده کالای فروخته شده
  const costOfGoodsSoldLedger = new GeneralLedger({
    ledger: ledger._id,
    account: costOfGoodsAccount.accountId,
    debit: 0,
    credit: totalCostOfGoods,
    description: `بهای تمام شده برگشت از فروش ${description}`,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await costOfGoodsSoldLedger.save({ session });
  generalLedgers.push(costOfGoodsSoldLedger._id);

  // ثبت بدهکاری برای حساب‌های مرتبط با کالا
  for (const [accountId, amount] of Object.entries(accountIdMap)) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: amount,      // اصلاح: بدهکار کردن حساب کالا
      credit: 0,
      description: `ثبت بدهکاری برای کالا در برگشت از فروش ${description}`,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await generalLedger.save({ session });
    generalLedgers.push(generalLedger._id);

    if (!bulkAccountOperations[accountId.toString()]) {
      bulkAccountOperations[accountId.toString()] = { accountId: accountId, debit: amount };
    } else {
      bulkAccountOperations[accountId.toString()].debit += amount;
    }
  }

  // به‌روزرسانی مانده حساب‌ها به صورت فردی
  await updateAccountsBalanceIndividually(bulkAccountOperations, session);

  ledger.transactions = generalLedgers;
  await ledger.save({ session });

  return ledger._id;
}

//////////////////////////
// کدهای ثابت حسابداری
const ACCOUNT_CODES = {
  EXPENSE: '5000-1',
  COST_OF_GOODS_SOLD: '5000-1',
  SALES_RETURN: '5000-2',
  DISCOUNTS: '5000-3',
  WASTE: '5000-4',
  SALES: '4000-1'
};

export async function deleteInvoiceAction(invoiceId, storeId) {
  let session;
  try {
      session = await mongoose.startSession();
      session.startTransaction();

      const user = await getAuthenticatedUser();
      if (!user) {
          throw new Error('دسترسی غیرمجاز');
      }

      const invoice = await Invoice.findOne({
          _id: invoiceId,
          shop: storeId
      }).populate('InvoiceItems').session(session);
console.log("invoice-------------------------------",invoice);

      if (!invoice) {
          throw new Error('فاکتور یافت نشد');
      }

      const totalAmount = invoice.totalPrice;

      // برگرداندن تغییرات موجودی و به‌روزرسانی مانده حساب‌ها
      for (const item of invoice.InvoiceItems) {
          const product = await Product.findById(item.product).session(session);
          if (!product) {
              throw new Error(`محصول ${item.productId} یافت نشد`);
          }

          switch (invoice.type) {
              case 'SALE':
                  product.stock += item.quantity;
                  const costOfGoodsSold = item.quantity * product.costPrice;
                  await updateAccountsBalanceIndividually([
                      {
                          accountId: await GetAccountIdBystoreIdAndAccountCode(storeId, ACCOUNT_CODES.SALES),
                          amount: -totalAmount
                      },
                      {
                          accountId: await GetAccountIdBystoreIdAndAccountCode(storeId, ACCOUNT_CODES.COST_OF_GOODS_SOLD),
                          amount: -costOfGoodsSold
                      }
                  ], session);
                  break;

              case 'WASTE':
                  product.stock += item.quantity;
                  await updateAccountsBalanceIndividually([
                      {
                          accountId: await GetAccountIdBystoreIdAndAccountCode(storeId, ACCOUNT_CODES.WASTE),
                          amount: -totalAmount
                      }
                  ], session);
                  break;

              case 'SALES_RETURN':
                  product.stock -= item.quantity;
                  await updateAccountsBalanceIndividually([
                      {
                          accountId: await GetAccountIdBystoreIdAndAccountCode(storeId, ACCOUNT_CODES.SALES_RETURN),
                          amount: -totalAmount
                      },
                      {
                          accountId: await GetAccountIdBystoreIdAndAccountCode(storeId, ACCOUNT_CODES.COST_OF_GOODS_SOLD),
                          amount: totalAmount
                      }
                  ], session);
                  break;

              // در صورت نیاز سایر موارد اضافه شود
          }

          await product.save({ session });
      }

      // حذف اسناد حسابداری مرتبط
      await Ledger.deleteMany({
          shop: storeId,
          'transactions.type': 'invoice',
          'transactions.referenceId': invoice._id
      }).session(session);

      await GeneralLedger.deleteMany({
          shop: storeId,
          type: 'invoice',
          referenceId: invoice._id
      }).session(session);

      // حذف آیتم‌های فاکتور
      await InvoiceItem.deleteMany({
          invoiceId: invoice._id
      }).session(session);

      // حذف فاکتور
      await Invoice.deleteOne({
          _id: invoice._id
      }).session(session);

      await session.commitTransaction();
      return { success: true, message: 'فاکتور با موفقیت حذف شد' };

  } catch (error) {
      if (session) {
          await session.abortTransaction();
      }
      throw error;
  } finally {
      if (session) {
          session.endSession();
      }
  }
}


// تابع ویرایش فاکتور
async function editInvoiceAction(invoiceId, storeId, userId, updatedData) {
  let session;
  try {
      session = await mongoose.startSession();
      session.startTransaction();

      // بررسی دسترسی کاربر
      const user = await getAuthenticatedUser();
      if (!user) {
          throw new Error('دسترسی غیرمجاز');
      }

      // اعتبارسنجی داده‌های جدید
      const requiredFields = ['type', 'invoiceItems', 'storeId'];
      validateInvoiceData(updatedData, requiredFields);

      // دریافت فاکتور اصلی
      const originalInvoice = await Invoice.findOne({
          _id: invoiceId,
          shop: storeId
      }).populate('InvoiceItems').session(session);

      if (!originalInvoice) {
          throw new Error('فاکتور یافت نشد');
      }

      // برگرداندن تغییرات موجودی قبلی
      for (const item of originalInvoice.InvoiceItems) {
          const product = await Product.findById(item.productId).session(session);
          if (!product) {
              throw new Error(`محصول ${item.productId} یافت نشد`);
          }

          // برگرداندن موجودی به حالت قبل
          switch (originalInvoice.type) {
              case 'PURCHASE':
                  product.stock -= item.quantity;
                  break;
              case 'SALE':
                  product.stock += item.quantity;
                  break;
              case 'WASTE':
                  product.stock += item.quantity;
                  break;
          }

          await product.save({ session });
      }

      // حذف اسناد حسابداری قبلی
      await Ledger.deleteMany({
          shop: storeId,
          'transactions.referenceId': originalInvoice._id
      }).session(session);

      await GeneralLedger.deleteMany({
          shop: storeId,
          referenceId: originalInvoice._id
      }).session(session);

      // حذف آیتم‌های قبلی فاکتور
      await InvoiceItem.deleteMany({
          invoiceId: originalInvoice._id
      }).session(session);

      // ایجاد آیتم‌های جدید فاکتور
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(
          updatedData.invoiceItems,
          originalInvoice._id,
          session,
          originalInvoice.type === 'PURCHASE'
      );

      // به‌روزرسانی موجودی برای آیتم‌های جدید
      await updateProductStock(
          bulkProductOperations,
          originalInvoice.type === 'SALES_RETURN' || originalInvoice.type === 'PURCHASE',
          session
      );

      // به‌روزرسانی فاکتور
      const totalItems = updatedData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalAmount = updatedData.invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);

      const updatedInvoice = await Invoice.findOneAndUpdate(
          { _id: invoiceId },
          {
              ...updatedData,
              InvoiceItems: invoiceItemIds,
              totalItems,
              totalPrice: totalAmount,
              updatedBy: userId,
              updatedAt: new Date()
          },
          { new: true, session }
      );

      // ایجاد اسناد مالی جدید
      switch (originalInvoice.type) {
          case 'WASTE':
              await createFinancialDocumentsForWaste(
                  `ویرایش ضایعات ${updatedInvoice._id}`,
                  storeId,
                  userId,
                  accountIdMap,
                  totalAmount,
                  session
              );
              break;
          case 'SALES_RETURN':
              await createFinancialDocumentsForSalesReturn(
                  `ویرایش برگشت از فروش ${updatedInvoice._id}`,
                  storeId,
                  userId,
                  updatedData.accountAllocations,
                  accountIdMap,
                  totalAmount, // بهای تمام شده
                  totalAmount, // مبلغ فروش
                  session
              );
              break;
          // سایر موارد را می‌توانید اضافه کنید
      }

      await session.commitTransaction();
      return { success: true, message: 'فاکتور با موفقیت به‌روزرسانی شد', invoice: updatedInvoice };

  } catch (error) {
      if (session) {
          await session.abortTransaction();
      }
      throw error;
  } finally {
      if (session) {
          session.endSession();
      }
  }
}
