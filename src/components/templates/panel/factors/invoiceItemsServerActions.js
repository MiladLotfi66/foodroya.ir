"use server";
import mongoose from 'mongoose';
import Invoice from './Invoice';
import InvoiceItem from './InvoiceItem';
import Ledger from '../FinancialDocument/Ledger';
import GeneralLedger from '../FinancialDocument/GeneralLedger';
import connectDB from '@/utils/connectToDB';
import { authenticateUser } from '@/templates/Shop/ShopServerActions';
import Product from '../Product/Product';
import Account from '../Account/Account';

// توابع کمکی مشترک

/**
 * احراز هویت کاربر
 */
async function getAuthenticatedUser() {
  try {
    const user = await authenticateUser();
    return user;
  } catch (authError) {
    console.log("Authentication failed:", authError);
    return null;
  }
}

/**
 * اعتبارسنجی داده‌های فاکتور
 * @param {Object} invoiceData 
 * @param {Array} requiredFields 
 */
function validateInvoiceData(invoiceData, requiredFields) {
  for (const field of requiredFields) {
    if (!invoiceData[field]) {
      throw new Error(`لطفاً فیلد ${field} را پر کنید.`);
    }
  }
}

/**
 * ایجاد و ذخیره اقلام فاکتور
 * @param {Array} invoiceItems 
 * @param {String} invoiceId 
 * @param {mongoose.ClientSession} session 
 * @returns {Array} invoiceItemIds
 */
async function createInvoiceItems(invoiceItems, invoiceId, session) {
  const invoiceItemIds = [];
  const accountIdMap = {};
  const bulkProductOperations = {};

  for (const item of invoiceItems) {
    const requiredItemFields = ['productId', 'title', 'quantity', 'unitPrice', 'totalPrice'];
    for (const field of requiredItemFields) {
      if (!item[field]) {
        throw new Error(`لطفاً فیلد ${field} در اقلام فاکتور را پر کنید.`);
      }
    }

    const product = await Product.findById(item.productId).session(session);
    if (!product || !product.accountId) {
      throw new Error(`محصول با شناسه ${item.productId} معتبر نیست یا حساب موجودی ندارد.`);
    }

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
      invoice: invoiceId,
      description: item.description || '',
      Features: item.Features || [],
    });

    await invoiceItem.save({ session });
    invoiceItemIds.push(invoiceItem._id);

    if (bulkProductOperations[item.productId]) {
      bulkProductOperations[item.productId].quantity += item.quantity;
    } else {
      bulkProductOperations[item.productId] = { productId: item.productId, quantity: item.quantity };
    }
  }

  return { invoiceItemIds, accountIdMap, bulkProductOperations };
}

/**
 * به‌روزرسانی موجودی محصولات
 * @param {Object} bulkProductOperations 
 * @param {Boolean} isPurchase 
 * @param {mongoose.ClientSession} session 
 */
async function updateProductStock(bulkProductOperations, isPurchase, session) {
  const bulkProductOpsArray = Object.values(bulkProductOperations).map(op => ({
    updateOne: {
      filter: { _id: op.productId },
      update: { $inc: { stock: isPurchase ? op.quantity : -op.quantity } },
    }
  }));

  if (bulkProductOpsArray.length > 0) {
    const bulkWriteProductResult = await Product.bulkWrite(bulkProductOpsArray, { session });
    const modifiedCount = bulkWriteProductResult.nModified || bulkWriteProductResult.modifiedCount;
    if (modifiedCount !== bulkProductOpsArray.length) {
      throw new Error('بعضی از به‌روزرسانی‌های موجودی محصول موفقیت‌آمیز نبودند.');
    }
  }
}

/**
 * ایجاد Ledger و GeneralLedger
 * @param {String} description 
 * @param {String} shopId 
 * @param {String} userId 
 * @param {Array} accountAllocations 
 * @param {Object} accountIdMap 
 * @param {Boolean} isPurchase 
 * @param {mongoose.ClientSession} session 
 * @returns {String} ledgerId
 */
async function createFinancialDocuments(description, shopId, userId, accountAllocations, accountIdMap, isPurchase, session) {
  const ledger = new Ledger({
    description,
    shop: shopId,
    createdBy: userId,
    updatedBy: userId,
  });

  await ledger.save({ session });

  const generalLedgers = [];
  const bulkAccountOperations = {};

  // ایجاد GeneralLedger برای حساب‌های تخصیص داده شده
  for (const allocation of accountAllocations) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: allocation.accountId,
      debit: isPurchase ? 0 : allocation.amount,
      credit: isPurchase ? allocation.amount : 0,
      description: `تراکنش مربوط به ${description}`,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await generalLedger.save({ session });
    generalLedgers.push(generalLedger._id);

    if (isPurchase) {
      if (bulkAccountOperations[allocation.accountId.toString()]) {
        bulkAccountOperations[allocation.accountId.toString()].credit += allocation.amount;
      } else {
        bulkAccountOperations[allocation.accountId.toString()] = { accountId: allocation.accountId, credit: allocation.amount };
      }
    } else {
      if (bulkAccountOperations[allocation.accountId.toString()]) {
        bulkAccountOperations[allocation.accountId.toString()].debit += allocation.amount;
      } else {
        bulkAccountOperations[allocation.accountId.toString()] = { accountId: allocation.accountId, debit: allocation.amount };
      }
    }
  }

  // ایجاد GeneralLedger برای حساب‌های موجودی
  for (const [accountId, amount] of Object.entries(accountIdMap)) {
    const generalLedger = new GeneralLedger({
      ledger: ledger._id,
      account: accountId,
      debit: isPurchase ? amount : 0,
      credit: isPurchase ? 0 : amount,
      description: `تراکنش مربوط به ${description}`,
      type: "invoice",
      shop: shopId,
      createdBy: userId,
      updatedBy: userId,
    });

    await generalLedger.save({ session });
    generalLedgers.push(generalLedger._id);

    if (isPurchase) {
      if (bulkAccountOperations[accountId.toString()]) {
        bulkAccountOperations[accountId.toString()].debit += amount;
      } else {
        bulkAccountOperations[accountId.toString()] = { accountId: accountId, debit: amount };
      }
    } else {
      if (bulkAccountOperations[accountId.toString()]) {
        bulkAccountOperations[accountId.toString()].credit += amount;
      } else {
        bulkAccountOperations[accountId.toString()] = { accountId: accountId, credit: amount };
      }
    }
  }

  // به‌روزرسانی حساب‌ها
  await updateAccountsBalance(bulkAccountOperations, session);

  ledger.transactions = generalLedgers;
  await ledger.save({ session });

  return ledger._id;
}

/**
 * به‌روزرسانی مانده حساب‌ها
 * @param {Object} bulkAccountOperations 
 * @param {mongoose.ClientSession} session 
 */
async function updateAccountsBalance(bulkAccountOperations, session) {
  const bulkAccountOpsArray = Object.values(bulkAccountOperations).map(op => {
    const updateFields = {};

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
    const modifiedCount = bulkWriteAccountResult.nModified || bulkWriteAccountResult.modifiedCount;
    if (modifiedCount !== bulkAccountOpsArray.length) {
      throw new Error('بعضی از به‌روزرسانی‌های مانده حساب‌ها موفقیت‌آمیز نبودند.');
    }
  }
}

// اکشن‌های اصلی

/**
 * تابع AddPurchaseInvoiceAction برای ثبت فاکتور خرید همراه با اقلام و اسناد مالی
 * @param {Object} invoiceData - داده‌های فاکتور خرید
 * @returns {Object} - نتیجه عملیات
 */
export async function AddPurchaseInvoiceAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // اعتبارسنجی داده‌ها
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      validateInvoiceData(invoiceData, requiredFields);

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

      await invoice.save({ session });

      // ایجاد اقلام فاکتور
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, invoice._id, session);

      // به‌روزرسانی موجودی محصولات (افزایش برای خرید)
      await updateProductStock(bulkProductOperations, true, session);

      // به‌روزرسانی فیلد InvoiceItems در فاکتور
      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session });

      // ایجاد اسناد مالی
      await createFinancialDocuments(
        `ثبت فاکتور خرید ${invoice._id}`,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        true,
        session
      );

      return invoice;
    });

    return { success: true, message: 'فاکتور با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddPurchaseInvoiceAction:', error);
    return { success: false, message: `ثبت فاکتور با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

/**
 * تابع AddSalesInvoiceAction برای ثبت فاکتور فروش همراه با اقلام و اسناد مالی
 * @param {Object} invoiceData - داده‌های فاکتور فروش
 * @returns {Object} - نتیجه عملیات
 */
export async function AddSalesInvoiceAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // اعتبارسنجی داده‌ها
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      validateInvoiceData(invoiceData, requiredFields);

      // محاسبه totalItems
      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);

      // ایجاد فاکتور
      const invoice = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type, // باید نوع فاکتور فروش باشد
        totalPrice: invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      await invoice.save({ session });

      // ایجاد اقلام فاکتور
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, invoice._id, session);

      // بررسی موجودی و به‌روزرسانی موجودی محصولات (کاهش برای فروش)
      for (const item of invoiceData.invoiceItems) {
        const product = await Product.findById(item.productId).session(session);
        if (product.stock < item.quantity) {
          throw new Error(`موجودی محصول ${product.title} کافی نیست. موجودی فعلی: ${product.stock}`);
        }
      }
      await updateProductStock(bulkProductOperations, false, session);

      // به‌روزرسانی فیلد InvoiceItems در فاکتور
      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session });

      // ایجاد اسناد مالی
      await createFinancialDocuments(
        `ثبت فاکتور فروش ${invoice._id}`,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        false,
        session
      );

      return invoice;
    });

    return { success: true, message: 'فاکتور با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddSalesInvoiceAction:', error);
    return { success: false, message: `ثبت فاکتور با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

/**
 * تابع AddPurchaseReturnAction برای ثبت برگشت از خرید
 * @param {Object} invoiceData - داده‌های برگشت از خرید
 * @returns {Object} - نتیجه عملیات
 */
export async function AddPurchaseReturnAction(invoiceData) {
  console.log("invoiceData",invoiceData);
  
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // اعتبارسنجی داده‌ها
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      validateInvoiceData(invoiceData, requiredFields);

      // محاسبه totalItems
      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);

      // ایجاد برگشت خرید به عنوان فاکتور منفی
      const invoice = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type, // باید نوع برگشت خرید باشد
        totalPrice: -invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      await invoice.save({ session });

      // ایجاد اقلام برگشت خرید
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, invoice._id, session);

      // به‌روزرسانی موجودی محصولات (کاهش برگشت خرید یعنی کاهش بدهی موجودی)
      await updateProductStock(bulkProductOperations, false, session);

      // به‌روزرسانی فیلد InvoiceItems در فاکتور
      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session });

      // ایجاد اسناد مالی
      await createFinancialDocuments(
        `ثبت برگشت خرید ${invoice._id}`,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        true, // بازگشت از خرید مانند خرید است
        session
      );

      return invoice;
    });

    return { success: true, message: 'بازگشت خرید با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddPurchaseReturnAction:', error);
    return { success: false, message: `ثبت بازگشت خرید با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

/**
 * تابع AddSalesReturnAction برای ثبت برگشت از فروش
 * @param {Object} invoiceData - داده‌های برگشت از فروش
 * @returns {Object} - نتیجه عملیات
 */
export async function AddSalesReturnAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // اعتبارسنجی داده‌ها
      const requiredFields = ['type', 'totalAmount', 'invoiceItems', 'storeId', 'customerId', 'accountAllocations'];
      validateInvoiceData(invoiceData, requiredFields);

      // محاسبه totalItems
      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);

      // ایجاد برگشت فروش به عنوان فاکتور منفی
      const invoice = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type, // باید نوع برگشت فروش باشد
        totalPrice: -invoiceData.totalAmount,
        totalItems: totalItems,
        contact: invoiceData.customerId,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
      });

      await invoice.save({ session });

      // ایجاد اقلام برگشت فروش
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, invoice._id, session);

      // بررسی موجودی و به‌روزرسانی موجودی محصولات (افزایش برگشت فروش یعنی افزایش موجودی)
      for (const item of invoiceData.invoiceItems) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`محصول با شناسه ${item.productId} معتبر نیست.`);
        }
      }
      await updateProductStock(bulkProductOperations, true, session); // افزایش موجودی

      // به‌روزرسانی فیلد InvoiceItems در فاکتور
      invoice.InvoiceItems = invoiceItemIds;
      await invoice.save({ session });

      // ایجاد اسناد مالی
      await createFinancialDocuments(
        `ثبت برگشت فروش ${invoice._id}`,
        invoice.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        false, // برگشت فروش
        session
      );

      return invoice;
    });

    return { success: true, message: 'بازگشت فروش با موفقیت ثبت شد.' };
  } catch (error) {
    console.error('خطا در AddSalesReturnAction:', error);
    return { success: false, message: `ثبت بازگشت فروش با مشکل مواجه شد: ${error.message}` };
  } finally {
    session.endSession();
  }
}

/**
 * تابع AddWasteAction برای مدیریت ضایعات
 * @param {Object} invoiceData - داده‌های ضایعات
 * @returns {Object} - نتیجه عملیات
 */
export async function AddWasteAction(invoiceData) {
  await connectDB();
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      // اعتبارسنجی داده‌ها
      const requiredFields = ['type', 'invoiceItems', 'storeId', 'accountAllocations','customerId'];
      validateInvoiceData(invoiceData, requiredFields);

      // محاسبه totalItems و totalAmount
      const totalItems = invoiceData.invoiceItems.reduce((acc, item) => acc + item.quantity, 0);
      const totalAmount = invoiceData.invoiceItems.reduce((acc, item) => acc + item.totalPrice, 0);

      // ایجاد سند ضایعات
      const waste = new Invoice({
        description: invoiceData.description || '',
        type: invoiceData.type, // باید نوع ضایعات باشد
        totalPrice: totalAmount,
        totalItems: totalItems,
        shop: invoiceData.storeId,
        createdBy: user.id,
        updatedBy: user.id,
        contact: invoiceData.customerId,

      });

      await waste.save({ session });

      // ایجاد اقلام ضایعات
      const { invoiceItemIds, accountIdMap, bulkProductOperations } = await createInvoiceItems(invoiceData.invoiceItems, waste._id, session);

      // به‌روزرسانی موجودی محصولات (کاهش ضایعات)
      await updateProductStock(bulkProductOperations, false, session);

      // به‌روزرسانی فیلد InvoiceItems در سند ضایعات
      waste.InvoiceItems = invoiceItemIds;
      await waste.save({ session });

      // ایجاد اسناد مالی برای ضایعات
      await createFinancialDocuments(
        `ثبت ضایعات ${waste._id}`,
        waste.shop,
        user.id,
        invoiceData.accountAllocations,
        accountIdMap,
        false, // ضایعات ممکن است به طور خاص نیاز به منطق متفاوت داشته باشند
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
