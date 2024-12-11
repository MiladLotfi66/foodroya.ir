"use server";
// utils/financialDocumentActions.js
import connectDB from "@/utils/connectToDB";
import FinancialDocument from "./Ledger";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Ledger from "./Ledger";
import Currency from "../Currency/Currency";
import GeneralLedger from "./GeneralLedger";
import { ledgerValidationSchema } from "./FinancialDocumentSchema";
import mongoose from 'mongoose'; // اطمینان حاصل کنید که mongoose ایمپورت شده باشد

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
    const Ledgers = await Ledger.find({ shop: shopId }).select('-__v').populate(
[      {
      path: 'transactions',
      populate: [
        {
          path: 'account',
          select: 'title accountType' // فیلدهای مورد نیاز از مدل Account
        },
        {
          path: 'currency',
          select: 'title' // فیلدهای مورد نیاز از مدل Currency
        },
       
      ]

    }, {
      path: 'createdBy',
      select: 'name userImage email userUniqName phone' 
    }, {
      path: 'updatedBy',
      select: 'name userImage email userUniqName phone' 
    }
  ])
    .lean(); // استفاده از lean() برای دریافت اشیاء ساده  

      
    return { status: 200, Ledgers: convertToPlainObjects(Ledgers) };
  } catch (error) {
    console.error("Error fetching Ledgers:", error);
    return { status: 500, message: 'خطایی در دریافت اسناد مالی رخ داد.' };
  }
}
/**
 * افزودن سند مالی جدید
 * @param {FormData} formData - داده‌های فرم
 * @returns {Object} - نتیجه عملیات
 */




export async function AddFinancialDocumentAction(data) {
  await connectDB();
  let user;

  try {
    user = await authenticateUser();
  } catch (authError) {
    return {
      status: 401,
      message: 'خطا در احراز هویت کاربر'
    };
  }

  if (!user) {
    return {
      status: 401,
      message: 'کاربر وارد نشده است'
    };
  }

  // ایجا‌ه جلسه
  const session = await mongoose.startSession();

  try {
    // بررسی داده‌های ورودی
    if (!data || !data.debtors || !data.creditors) {
      return {
        status: 400,
        message: 'اطلاعات بدهکار و بستانکار الزامی است'
      };
    }

    // محاسبه جمع بدهکار و بستانکار
    const totalDebit = data.debtors.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalCredit = data.creditors.reduce((sum, item) => sum + (item.amount || 0), 0);

    // بررسی تراز بودن سند
    if (totalDebit !== totalCredit) {
      return {
        status: 400,
        message: 'مجموع بدهکار و بستانکار برابر نیست'
      };
    }

    const userId = user.id;

    // شروع تراکنش
    session.startTransaction();

    // ایجاد دفتر کل درون تراکنش
    const ledger = new Ledger({
      description: data.description,
      transactions: [], // ابتدا خالی
      createdBy: userId,
      updatedBy: userId,
      shop: data.ShopId,
    });

    await ledger.save({ session });

    // تبدیل بدهکاران و بستانکاران به تراکنش‌ها
    const transactions = [
      // تراکنش‌های بدهکار
      ...data.debtors.map(debtor => ({
        ledger: ledger._id,
        account: debtor.account,
        debit: debtor.amount,
        credit: 0,
        currency: data.currency,
        description: data.description,
        type: data.type,
        shop: data.ShopId,
        createdBy: userId,
        updatedBy: userId,
      })),
      // تراکنش‌های بستانکار
      ...data.creditors.map(creditor => ({
        ledger: ledger._id,
        account: creditor.account,
        debit: 0,
        credit: creditor.amount,
        currency: data.currency,
        description: data.description,
        type: data.type,
        shop: data.ShopId,
        createdBy: userId,
        updatedBy: userId,
      }))
    ];

    // ذخیره تراکنش‌ها درون تراکنش
    const createdTransactions = await GeneralLedger.insertMany(transactions, { session });

    // به‌روزرسانی دفتر کل با تراکنش‌ها درون تراکنش
    ledger.transactions = createdTransactions.map(tx => tx._id);
    await ledger.save({ session });

    // تعهد تراکنش
    await session.commitTransaction();
    session.endSession();

    return {
      status: 200,
      message: 'سند حسابداری با موفقیت ثبت شد',
      data: {
        ledger: ledger._id,
        transactionCount: createdTransactions.length,
        totalAmount: totalDebit,
        currency: data.currency,
        shop: data.ShopId
      }
    };

  } catch (error) {
    // ابطال تراکنش در صورت بروز خطا
    await session.abortTransaction();
    session.endSession();

    return {
      status: 500,
      message: error.message || 'خطا در ایجاد سند حسابداری'
    };
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
