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

      const invoiceId = invoice._id;

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
      const ledgerId = await createFinancialDocumentsForSalesReturn(
        invoice._id,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        totalCostOfGoods,
        totalSales,
        session
      );
      invoice.Ledger = ledgerId;
      await invoice.save({ session });
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
  invoiceId,
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
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  const generalLedgers = [];
  const bulkAccountOperations = {};

  // تخصیصات حساب‌ها
  for (const allocation of accountAllocations) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: allocation.accountId,
      debit: 0,
      credit: allocation.amount, // برای دریافتی بستانکار می‌شود
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    generalLedgers.push(generalLedger);
    
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
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });
  
  generalLedgers.push(salesReturnLedger);
  
  // بستانکاری بهای تمام شده کالای فروخته شده
  const costOfGoodsSoldLedger = new GeneralLedger({
    ledger: ledger._id,
    account: costOfGoodsAccount.accountId,
    debit: 0,
    credit: totalCostOfGoods,
    referenceId:  invoiceId ,
    type: "invoice",
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });
  
  generalLedgers.push(costOfGoodsSoldLedger);
  
  // ثبت بدهکاری برای حساب‌های مرتبط با کالا
  for (const [accountId, amount] of Object.entries(accountIdMap)) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: amount,      // اصلاح: بدهکار کردن حساب کالا
      credit: 0,
      referenceId:  invoiceId ,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });
    
    generalLedgers.push(generalLedger);
    
    if (!bulkAccountOperations[accountId.toString()]) {
      bulkAccountOperations[accountId.toString()] = { accountId: accountId, debit: amount };
    } else {
      bulkAccountOperations[accountId.toString()].debit += amount;
    }
  }
  
  // به‌روزرسانی مانده حساب‌ها به صورت فردی
  // await generalLedger.save({ session });
  // await salesReturnLedger.save({ session });
  // await costOfGoodsSoldLedger.save({ session });
  // await generalLedger.save({ session });
  
  const savedGeneralLedgers = await GeneralLedger.insertMany(generalLedgers, {
      session,
    });
  
  await updateAccountsBalanceIndividually(bulkAccountOperations, session);

  ledger.transactions = savedGeneralLedgers.map((gl) => gl._id);
  await ledger.save({ session });

  return ledger._id;
}

// کدهای ثابت حسابداری
const ACCOUNT_CODES = {
  EXPENSE: '5000-1',
  COST_OF_GOODS_SOLD: '5000-1',
  SALES_RETURN: '5000-2',
  DISCOUNTS: '5000-3',
  WASTE: '5000-4',
  SALES: '4000-1'
};

export async function deleteInvoiceAction(invoiceId) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // ۱. دریافت فاکتور
    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) {
      throw new Error('فاکتور مورد نظر یافت نشد.');
    }

    // ۲. دریافت اقلام فاکتور
    const invoiceItems = await InvoiceItem.find({ invoice: invoiceId }).session(session);
    const productIds = invoiceItems.map(item => item.product);

    // ۳. دریافت تراکنش‌های GeneralLedger مرتبط
    const generalLedgers = await GeneralLedger.find({ referenceId: invoiceId }).session(session);
    const accountIds = [...new Set(generalLedgers.map(gl => gl.account))]; // لیست یکتای حساب‌ها

    // ۴. دریافت سند مالی Ledger مرتبط
    // const ledger = await Ledger.findOne({ referenceId: invoiceId }).session(session);

    // ۵. حذف اقلام فاکتور و به‌روزرسانی موجودی محصولات
    for (const item of invoiceItems) {
      await InvoiceItem.deleteOne({ _id: item._id }, { session });
      // به‌روز رسانی موجودی محصول
      const newStock = await calculateProductStock(item.product, session);
      await Product.updateOne({ _id: item.product }, { stock: newStock }).session(session);
    }
    // ۶. حذف تراکنش‌های GeneralLedger
    await GeneralLedger.deleteMany({ referenceId: invoiceId }).session(session);
    await Ledger.deleteOne({ referenceId: invoiceId }).session(session);
    // ۸. حذف فاکتور
    await Invoice.deleteOne({ _id: invoiceId }).session(session);
    // ۹. به‌روزرسانی مانده حساب‌ها
    const updatedAccounts = [];
    for (const accountId of accountIds) {
      const newBalance = await getAccountBalance(accountId, session);
      await Account.updateOne({ _id: accountId }, { balance: newBalance }).session(session);
      updatedAccounts.push(accountId);
    }

    // ۱۰. ایجاد یک تراکنش GeneralLedger برای حذف فاکتور
    // await GeneralLedger.create([{
    //   account: invoice.account,
    //   amount: -invoice.totalAmount,
    //   description: 'حذف فاکتور',
    //   date: new Date(),
    //   referenceId: invoiceId,
    // }], { session });

    // ۱۱. به‌روزرسانی مانده حساب اصلی فاکتور
    // await getAccountBalance(invoice.account, session).then(newBalance => {
    //   return Account.updateOne({ _id: invoice.account }, { balance: newBalance }).session(session);
    // });

    await session.commitTransaction();
    session.endSession();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting invoice:', error);
    return { success: false, message: error.message };
  }
}



export async function getAccountBalance(accountId, session) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('شناسه حساب معتبر نیست.');
  }

  await connectDB();

  const account = await Account.findById(accountId).session(session);

  if (!account) {
    throw new Error('حساب یافت نشد.');
  }

  const aggregationResult = await GeneralLedger.aggregate([
    { $match: { account: new mongoose.Types.ObjectId(accountId) } },
    {
      $group: {
        _id: '$account',
        totalDebit: { $sum: '$debit' },
        totalCredit: { $sum: '$credit' },
      },
    },
  ]).session(session);

  let balance = 0;

  if (aggregationResult.length > 0) {
    const { totalDebit, totalCredit } = aggregationResult[0];
    balance = totalDebit - totalCredit;
  }

  return balance || 0; // اصلاح بازگشت مقدار

}



export async function calculateProductStock(productId, session) {
  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('شناسه محصول نامعتبر است');
  }

  const aggregationResult = await InvoiceItem.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $lookup: {
        from: 'invoices',
        localField: 'invoice',
        foreignField: '_id',
        as: 'invoice',
      },
    },
    { $unwind: '$invoice' },
    {
      $group: {
        _id: '$invoice.type',
        totalQuantity: { $sum: '$quantity' },
      },
    },
  ]).session(session);

  let stock = 0;

  aggregationResult.forEach(group => {
    const { _id: type, totalQuantity } = group;
    switch (type) { // فرض بر این است که نوع فاکتور به حروف کوچک است
      case 'Purchase':
        
        stock += totalQuantity;
        break;
      case 'Sale':
        stock -= totalQuantity;
        break;
      case 'PurchaseReturn':
        stock -= totalQuantity;
        break;
      case 'SalesReturn':
        stock += totalQuantity;
        break;
      case 'Waste':
        stock -= totalQuantity;
        break;
      default:
        break;
    }
  });

  return stock || 0; // اصلاح بازگشت مقدار
}

