"use server";
// utils/financialDocumentActions.js
import mongoose from 'mongoose';
import connectDB from "@/utils/connectToDB";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Ledger from "./Ledger";
import GeneralLedger from "./GeneralLedger";
import Account from '../Account/Account';
import { ledgerValidationSchema } from "./FinancialDocumentSchema";

function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}

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

      // به‌روزرسانی مانده حساب‌ها به صورت فردی
      // به‌روزرسانی بدهکاران (افزایش مانده)
      for (const debtor of data.debtors) {
        await Account.updateOne(
          { _id: debtor.account },
          { $inc: { balance: debtor.amount } },
          { session, runValidators: true }
        );
      }

      // به‌روزرسانی بستانکاران (کاهش مانده)
      for (const creditor of data.creditors) {
        await Account.updateOne(
          { _id: creditor.account },
          { $inc: { balance: -creditor.amount } },
          { session, runValidators: true }
        );
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

    // بازگرداندن تأثیر تراکنش‌های قدیمی به صورت فردی
    for (const tx of oldTransactions) {
      if (tx.debit > 0) {
        await Account.updateOne(
          { _id: tx.account },
          { $inc: { balance: -tx.debit } },
          { session, runValidators: true }
        );
      }
      if (tx.credit > 0) {
        await Account.updateOne(
          { _id: tx.account },
          { $inc: { balance: tx.credit } },
          { session, runValidators: true }
        );
      }
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

    // به‌روزرسانی مانده حساب‌ها بر اساس تراکنش‌های جدید به صورت فردی
    // به‌روزرسانی بدهکاران (افزایش مانده)
    for (const debtor of data.debtors) {
      await Account.updateOne(
        { _id: debtor.account },
        { $inc: { balance: debtor.amount } },
        { session, runValidators: true }
      );
    }

    // به‌روزرسانی بستانکاران (کاهش مانده)
    for (const creditor of data.creditors) {
      await Account.updateOne(
        { _id: creditor.account },
        { $inc: { balance: -creditor.amount } },
        { session, runValidators: true }
      );
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

    // بازگرداندن تأثیر تراکنش‌ها به صورت فردی
    for (const tx of relatedTransactions) {
      if (tx.debit > 0) {
        await Account.updateOne(
          { _id: tx.account },
          { $inc: { balance: -tx.debit } },
          { session, runValidators: true }
        );
      }
      if (tx.credit > 0) {
        await Account.updateOne(
          { _id: tx.account },
          { $inc: { balance: tx.credit } },
          { session, runValidators: true }
        );
      }
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

export async function getAccountTransactions(accountId) {

  // احراز هویت کاربر
  const user = await authenticateUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // اتصال به پایگاه داده
  await connectDB();

  if (!accountId) {
    throw new Error('Account ID is required');
  }

  // بررسی وجود حساب
  const account = await Account.findById(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // دریافت تراکنش‌ها مربوط به حساب
  const transactions = await GeneralLedger.find({ account: accountId })
    .sort({ date: -1 })
    .lean(); // استفاده از lean() برای دریافت اشیاء ساده

  // ساده‌سازی و تبدیل به اشیاء ساده جاوااسکریپت
  const simplifiedTransactions = transactions.map(transaction => {
    return {
      _id: transaction._id?.toString(),  // اضافه کردن _id اصلی تراکنش

      ledger: {
        id: transaction.ledger?._id?.toString(),
        // اضافه کردن سایر فیلدهای مورد نیاز ledger
      },
      account: {
        id: transaction.account?._id?.toString(),
        // اضافه کردن سایر فیلدهای مورد نیاز account
      },
      debit: Number(transaction.debit) || 0,
      credit: Number(transaction.credit) || 0,
      description: transaction.description,
      type: transaction.type,
      shop: transaction.shop ? {
        id: transaction.shop?._id?.toString(),
        name: transaction.shop?.name,
        // اضافه کردن سایر فیلدهای مورد نیاز shop
      } : null,
      createdBy: transaction.createdBy ? {
        id: transaction.createdBy?._id?.toString(),
        name: transaction.createdBy?.name,
        // اضافه کردن سایر فیلدهای مورد نیاز user
      } : null,
      updatedBy: transaction.updatedBy ? {
        id: transaction.updatedBy?._id?.toString(),
        name: transaction.updatedBy?.name,
        // اضافه کردن سایر فیلدهای مورد نیاز user
      } : null,
      createdAt: transaction.createdAt?.toISOString(),
      updatedAt: transaction.updatedAt?.toISOString(),
    };
  });

  return simplifiedTransactions;
}




