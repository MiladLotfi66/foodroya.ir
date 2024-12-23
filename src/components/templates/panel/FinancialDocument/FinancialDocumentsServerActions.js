"use server";
// utils/financialDocumentActions.js
import mongoose from 'mongoose';
import connectDB from "@/utils/connectToDB";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Ledger from "./Ledger";
import GeneralLedger from "./GeneralLedger";
import Account from '../Account/Account';
import { ledgerValidationSchema } from "./FinancialDocumentSchema";

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
    const Ledgers = await Ledger.find({ shop: shopId })
      .select('-__v')
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'account',
              select: 'title accountType' // فیلدهای مورد نیاز از مدل Account
            },
       
          ]
        },
        {
          path: 'createdBy',
          select: 'name userImage email userUniqName phone'
        },
        {
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
 * @param {Object} data - داده‌های مورد نیاز برای ایجاد سند مالی
 * @returns {Object} - نتیجه عملیات
 */

export async function AddFinancialDocumentAction(data) {
  // اتصال به پایگاه داده
  await connectDB();
  let user;

  // احراز هویت کاربر
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

  // شروع جلسه تراکنش
  const session = await mongoose.startSession();
  let result; // متغیری برای ذخیره نتیجه تراکنش

  try {
    await session.withTransaction(async () => {
      // بررسی داده‌های ورودی با استفاده از اسکیمای اعتبارسنجی
      const { error } = ledgerValidationSchema.validate(data);
      if (error) {
        throw { status: 400, message: error.details[0].message };
      }

      // محاسبه جمع بدهکار و بستانکار
      const totalDebit = data.debtors.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalCredit = data.creditors.reduce((sum, item) => sum + (item.amount || 0), 0);

      // بررسی تراز بودن سند
      if (totalDebit !== totalCredit) {
        throw { status: 400, message: 'مجموع بدهکار و بستانکار برابر نیست' };
      }

      const userId = user.id;

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

      // تهیه عملیات به‌روزرسانی مانده حساب‌ها
      const bulkOperations = [];

      // به‌روزرسانی بدهکاران (افزایش مانده)
      data.debtors.forEach(debtor => {
        bulkOperations.push({
          updateOne: {
            filter: { _id: debtor.account },
            update: { $inc: { balance: debtor.amount } }
          }
        });
      });

      // به‌روزرسانی بستانکاران (کاهش مانده)
      data.creditors.forEach(creditor => {
        bulkOperations.push({
          updateOne: {
            filter: { _id: creditor.account },
            update: { $inc: { balance: -creditor.amount } }
          }
        });
      });

      // اجرای به‌روزرسانی‌ها به صورت دسته‌ای
      if (bulkOperations.length > 0) {
        await Account.bulkWrite(bulkOperations, { session });
      }

      // تنظیم نتیجه تراکنش برای بازگرداندن خارج از بلاک تراکنش
      result = {
        status: 200,
        message: 'سند حسابداری با موفقیت ثبت شد',
        data: {
          ledger: ledger._id,
          transactionCount: createdTransactions.length,
          totalAmount: totalDebit,
          shop: data.ShopId
        }
      };
    });

    // برگرداندن نتیجه تعیین شده درون تراکنش
    return result;

  } catch (error) {
    // مدیریت خطاها
    if (error.status && error.message) {
      return { status: error.status, message: error.message };
    }
    return {
      status: 500,
      message: error.message || 'خطا در ایجاد سند حسابداری'
    };
  } finally {
    // پایان دادن به جلسه تراکنش
    session.endSession();
  }
}



/**
 * ویرایش سند مالی
 * @param {Object} data - داده‌های مورد نیاز برای ویرایش سند مالی
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditFinancialDocumentAction(data, shopId) {
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

  const session = await mongoose.startSession();

  try {
    // بررسی داده‌های ورودی با استفاده از اسکیمای اعتبارسنجی
    const { error } = ledgerValidationSchema.validate(data);
    if (error) {
      return {
        status: 400,
        message: error.details[0].message
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

    // پیدا کردن دفتر کل مورد نظر
    const ledger = await Ledger.findOne({ _id: data.id, shop: shopId }).session(session);
    if (!ledger) {
      await session.abortTransaction();
      session.endSession();
      return {
        status: 404,
        message: 'سند مالی مورد نظر پیدا نشد'
      };
    }

    // استخراج تراکنش‌های قدیمی
    const oldTransactions = await GeneralLedger.find({ ledger: ledger._id }).session(session);

    // آماده‌سازی عملیات بازگرداندن تأثیر تراکنش‌های قدیمی
    const reverseBulkOperations = [];

    oldTransactions.forEach(tx => {
      if (tx.debit > 0) {
        reverseBulkOperations.push({
          updateOne: {
            filter: { _id: tx.account },
            update: { $inc: { balance: -tx.debit } }
          }
        });
      }
      if (tx.credit > 0) {
        reverseBulkOperations.push({
          updateOne: {
            filter: { _id: tx.account },
            update: { $inc: { balance: tx.credit } }
          }
        });
      }
    });

    // اجرای عملیات بازگرداندن تأثیر تراکنش‌های قدیمی
    if (reverseBulkOperations.length > 0) {
      await Account.bulkWrite(reverseBulkOperations, { session });
    }

    // حذف تراکنش‌های قدیمی
    await GeneralLedger.deleteMany({ ledger: ledger._id }).session(session);

    // ایجاد تراکنش‌های جدید
    const newTransactions = [
      // تراکنش‌های بدهکار
      ...data.debtors.map(debtor => ({
        ledger: ledger._id,
        account: debtor.account,
        debit: debtor.amount,
        credit: 0,
        description: data.description,
        type: data.type,
        shop: shopId,
        createdBy: userId,
        updatedBy: userId,
      })),
      // تراکنش‌های بستانکار
      ...data.creditors.map(creditor => ({
        ledger: ledger._id,
        account: creditor.account,
        debit: 0,
        credit: creditor.amount,
        description: data.description,
        type: data.type,
        shop: shopId,
        createdBy: userId,
        updatedBy: userId,
      }))
    ];

    // ذخیره تراکنش‌های جدید
    const createdTransactions = await GeneralLedger.insertMany(newTransactions, { session });

    // به‌روزرسانی دفتر کل
    ledger.description = data.description;
    ledger.type = data.type;
    ledger.updatedBy = userId;
    ledger.transactions = createdTransactions.map(tx => tx._id);

    await ledger.save({ session });

    // تهیه عملیات به‌روزرسانی مانده حساب‌ها بر اساس تراکنش‌های جدید
    const newBulkOperations = [];

    // به‌روزرسانی بدهکاران (افزایش مانده)
    data.debtors.forEach(debtor => {
      newBulkOperations.push({
        updateOne: {
          filter: { _id: debtor.account },
          update: { $inc: { balance: debtor.amount } }
        }
      });
    });

    // به‌روزرسانی بستانکاران (کاهش مانده)
    data.creditors.forEach(creditor => {
      newBulkOperations.push({
        updateOne: {
          filter: { _id: creditor.account },
          update: { $inc: { balance: -creditor.amount } }
        }
      });
    });

    // اجرای به‌روزرسانی‌ها به صورت دسته‌ای
    if (newBulkOperations.length > 0) {
      await Account.bulkWrite(newBulkOperations, { session });
    }

    // تعهد تراکنش
    await session.commitTransaction();
    session.endSession();

    return {
      status: 200,
      message: 'سند مالی با موفقیت ویرایش شد',
      data: {
        ledger: ledger._id,
        transactionCount: createdTransactions.length,
        totalAmount: totalDebit,
        shop: shopId
      }
    };

  } catch (error) {
    // ابطال تراکنش در صورت بروز خطا
    await session.abortTransaction();
    session.endSession();

    console.error("Error editing financial document:", error);

    return {
      status: 500,
      message: error.message || 'خطا در ویرایش سند مالی'
    };
  }
}

/**
 * حذف سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteFinancialDocuments(financialDocumentId, shopId) {
  
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // پیدا کردن و حذف سند مالی (Ledger)
    const deletedLedger = await Ledger.findOneAndDelete({ _id: financialDocumentId, shop: shopId }).session(session);
    
    if (!deletedLedger) {
      await session.abortTransaction();
      session.endSession();
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }

    // استخراج تراکنش‌های مرتبط (GeneralLedger)
    const relatedTransactions = await GeneralLedger.find({ ledger: financialDocumentId }).session(session);

    // آماده‌سازی عملیات بازگرداندن تأثیر تراکنش‌ها
    const reverseBulkOperations = [];

    relatedTransactions.forEach(tx => {
      if (tx.debit > 0) {
        reverseBulkOperations.push({
          updateOne: {
            filter: { _id: tx.account },
            update: { $inc: { balance: -tx.debit } }
          }
        });
      }
      if (tx.credit > 0) {
        reverseBulkOperations.push({
          updateOne: {
            filter: { _id: tx.account },
            update: { $inc: { balance: tx.credit } }
          }
        });
      }
    });

    // اجرای عملیات بازگرداندن تأثیر تراکنش‌ها
    if (reverseBulkOperations.length > 0) {
      await Account.bulkWrite(reverseBulkOperations, { session });
    }

    // حذف تراکنش‌های مرتبط
    await GeneralLedger.deleteMany({ ledger: financialDocumentId }).session(session);

    // تعهد تراکنش
    await session.commitTransaction();
    session.endSession();

    return { status: 200, message: 'سند مالی با موفقیت حذف شد و تأثیر آن بر مانده حساب‌ها بازگردانده شد.' };
    
  } catch (error) {
    // ابطال تراکنش در صورت بروز خطا
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting financialDocument:", error);
    return { status: 500, message: 'خطایی در حذف سند مالی رخ داد.' };
  }
}
