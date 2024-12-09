"use server";
// utils/financialDocumentActions.js
import connectDB from "@/utils/connectToDB";
import FinancialDocument from "./Ledger";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Ledger from "./Ledger";
import GeneralLedger from "./GeneralLedger";
import { ledgerValidationSchema } from "./FinancialDocumentSchema";
// import { getSession } from 'next-auth/react'; // فرض بر این که از next-auth استفاده می‌کنید

/**
 * تبدیل مستندات Mongoose به اشیاء ساده
 * @param {Array} docs - آرایه‌ای از مستندات
 * @returns {Array} - آرایه‌ای از اشیاء ساده
 */
function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}

/**
 * دریافت تمام اسناد مالی
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - شامل وضعیت و آرایه‌ای از اسناد مالی
 */
export async function GetAllFinancialDocuments(shopId) {
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
  try {
    const financialDocuments = await FinancialDocument.find({ shop: shopId }).select('-__v')
      .populate('shop')
      .lean(); // استفاده از lean() برای دریافت اشیاء ساده  
    return { status: 200, financialDocuments: convertToPlainObjects(financialDocuments) };
  } catch (error) {
    console.error("Error fetching financialDocuments:", error);
    return { status: 500, message: 'خطایی در دریافت اسناد مالی رخ داد.' };
  }
}
/**
 * افزودن سند مالی جدید
 * @param {FormData} formData - داده‌های فرم
 * @returns {Object} - نتیجه عملیات
 */



export async function AddFinancialDocumentAction(data) {
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
  // اعتبارسنجی داده‌ها
  try {
    const validData = await ledgerValidationSchema.validate(data, { abortEarly: false });
    


    const userId = user.id;

    // ایجاد دفتر کل جدید
    const ledger = new Ledger({
      description: validData.description,
      transactions: [], // ابتدا خالی
      createdBy: userId,
      updatedBy: userId,
    });

    await ledger.save();

    // ایجاد تراکنش‌های GeneralLedger
    const generalLedgerEntries = validData.transactions.map(tx => ({
      ledger: ledger._id,
      account: tx.account,
      debit: tx.debit,
      credit: tx.credit,
      currency: tx.currency,
      description: tx.description,
      type: tx.type,
      shop: tx.shop,
      createdBy: userId,
      updatedBy: userId,
    }));

    const createdTransactions = await GeneralLedger.insertMany(generalLedgerEntries);

    // افزودن تراکنش‌ها به دفتر کل
    ledger.transactions = createdTransactions.map(tx => tx._id);
    await ledger.save();

    return {status:200, message: 'دفتر کل با موفقیت ایجاد شد', data: ledger };
  } catch (error) {
    if (error.name === 'ValidationError') {
      // جمع‌آوری تمام خطاهای اعتبارسنجی
      const errors = error.errors;
      throw new Error(errors.join('; '));
    }
    throw new Error(error.message || 'خطا در ایجاد دفتر کل');
  }
}

/**
 * ویرایش سند مالی
 * @param {FormData} formData - داده‌های فرم
 * @param {string} ShopId - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditFinancialDocumentAction(formData, ShopId) {
 
}

/**
 * حذف سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteFinancialDocuments(financialDocumentId) {
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

  try {
    const deletedFinancialDocument = await FinancialDocument.findByIdAndDelete(financialDocumentId).lean();
    if (!deletedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }
    return { status: 200, message: 'سند مالی با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error deleting financialDocument:", error);
    return { status: 500, message: 'خطایی در حذف سند مالی رخ داد.' };
  }
}

/**
 * فعال‌سازی سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function EnableFinancialDocumentAction(financialDocumentId) {
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

  try {
    const updatedFinancialDocument = await FinancialDocument.findByIdAndUpdate(
      financialDocumentId,
      { status: 'فعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }

    const plainFinancialDocument = JSON.parse(JSON.stringify(updatedFinancialDocument));
    return { status: 200, message: 'سند مالی فعال شد.', financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error enabling financialDocument:", error);
    return { status: 500, message: 'خطایی در فعال‌سازی سند مالی رخ داد.' };
  }
}

/**
 * غیرفعال‌سازی سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function DisableFinancialDocumentAction(financialDocumentId) {
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
  try {
    const updatedFinancialDocument = await FinancialDocument.findByIdAndUpdate(
      financialDocumentId,
      { status: 'غیرفعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }

    const plainFinancialDocument = JSON.parse(JSON.stringify(updatedFinancialDocument));
    return { status: 200, message: 'سند مالی غیرفعال شد.', financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error disabling financialDocument:", error);
    return { status: 500, message: 'خطایی در غیرفعال‌سازی سند مالی رخ داد.' };
  }
}
