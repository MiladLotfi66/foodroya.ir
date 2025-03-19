"use server";
// utils/financialDocumentActions.js
import mongoose from 'mongoose';
import connectDB from "@/utils/connectToDB";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Ledger from "./Ledger";
import GeneralLedger from "./GeneralLedger";
import Account from '../Account/Account';
import { ledgerValidationSchema } from "./FinancialDocumentSchema";
import { CheckUserPermissionInShop } from '../rols/RolesPermissionActions';
import shops from '@/templates/Shop/shops';
import Contact from '../Contact/Contact';
import Invoice from '../factors/Invoice';

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
  const hasAccess=await CheckUserPermissionInShop(data.ShopId,"financialDocumentsPermissions","add")
    if (!hasAccess.hasPermission) {
       return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
  const hasAccess=await CheckUserPermissionInShop(shopId,"financialDocumentsPermissions","edit")
    if (!hasAccess.hasPermission) {
       return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
  const hasAccess=await CheckUserPermissionInShop(shopId,"financialDocumentsPermissions","delete")
    if (!hasAccess.hasPermission) {
       return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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




/////////////////////////
// FinancialDocumentsServerActions.js - توابع اصلاح شده

export async function getUserAccountsAndDocuments() {
  await connectDB();
  
  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'لطفا وارد حساب کاربری خود شوید' };
    }

    // ابتدا مخاطب‌های مرتبط با کاربر را پیدا می‌کنیم
    const userContacts = await Contact.find({ 
      userAccount: user.id 
    }).select('_id shop').lean();

    if (!userContacts || userContacts.length === 0) {
      return { 
        status: 200, 
        accounts: [],
        documents: [],
        message: 'هیچ حساب یا سند مالی یافت نشد'
      };
    }

    const contactIds = userContacts.map(contact => contact._id);
    const shopIds = [...new Set(userContacts.map(contact => contact.shop.toString()))];

    // دریافت اطلاعات فروشگاه‌ها به صورت یکجا
    const stores = await shops.find({ _id: { $in: shopIds } })
      .select('_id ShopName LogoUrl')
      .lean();

    // ایجاد نقشه برای دسترسی آسان به اطلاعات فروشگاه
    const storeMap = {};
    stores.forEach(store => {
      storeMap[store._id.toString()] = {
        name: store.ShopName,
        logo: store.LogoUrl
      };
    });

    // حساب‌های مرتبط با مخاطب‌های کاربر را پیدا می‌کنیم
    const accounts = await Account.find({ 
      contact: { $in: contactIds },
      accountStatus: 'فعال'
    })
    .select('_id title accountType accountCode store accountNature balance contact')
    .lean();

    // تبدیل داده‌های حساب به فرمت مناسب
    const formattedAccounts = accounts.map(account => {
      const storeId = account.store.toString();
      return {
        id: account._id.toString(),
        title: account.title,
        type: account.accountType,
        code: account.accountCode,
        nature: account.accountNature,
        balance: account.balance || 0,
        storeId: storeId,
        storeName: storeMap[storeId] ? storeMap[storeId].name : 'نامشخص',
        storeLogo: storeMap[storeId] ? storeMap[storeId].logo : null,
        contactId: account.contact.toString()
      };
    });

    // دریافت اسناد مالی مرتبط با حساب‌های کاربر
    const accountIds = accounts.map(account => account._id);
    
    // ابتدا تراکنش‌های مرتبط با حساب‌های کاربر را پیدا می‌کنیم
    const transactions = await GeneralLedger.find({
      account: { $in: accountIds }
    })
    .populate({
      path: 'shop',
      select: 'ShopName LogoUrl'
    })
    .populate({
      path: 'referenceId',
      select: 'type description totalPrice totalItems '
    }) 
    .select('ledger account debit credit referenceId createdAt updatedAt')
    .lean();
    
    // شناسه‌های دفتر کل را استخراج می‌کنیم
    const ledgerIds = [...new Set(transactions.map(tx => tx.ledger))];
    
    // دفتر کل‌های مرتبط را دریافت می‌کنیم
    const ledgers = await Ledger.find({
      _id: { $in: ledgerIds }
    })
    
    .select('description type shop ')
    .lean();
    
    // تبدیل داده‌های اسناد مالی به فرمت مناسب
    const formattedDocuments = ledgers.map(ledger => {
      // یافتن تراکنش‌های مرتبط با این دفتر کل
      const ledgerTransactions = transactions.filter(tx => 
        tx.ledger.toString() === ledger._id.toString()
      );
      
      // استخراج اطلاعات از اولین تراکنش برای دسترسی به shop و referenceId
      const firstTransaction = ledgerTransactions[0] || {};
      console.log("ledger--->",ledger);
      
      return {
        id: ledger._id.toString(),
        title: ledger.description || firstTransaction.referenceId?.description || 'سند مالی',
        date: firstTransaction.createdAt ? new Date(firstTransaction.createdAt).toLocaleDateString('fa-IR') : '',
        type: firstTransaction.referenceId?.type || ledger.type || 'سند مالی',
        shopId: firstTransaction.shop?._id.toString(),
        shopName: firstTransaction.shop?.ShopName || 'فروشگاه',
        shopLogo: firstTransaction.shop?.LogoUrl || '/images/default-shop.jpg',
        lastUpdated: firstTransaction.updatedAt,
        relatedAccounts: ledgerTransactions.map(tx => ({
          accountId: tx.account.toString(),
          accountTitle: formattedAccounts.find(acc => acc.id === tx.account.toString())?.title || 'حساب',
          debit: tx.debit || 0,
          credit: tx.credit || 0
        }))
      };
    });
    
    return { 
      status: 200, 
      accounts: formattedAccounts,
      documents: formattedDocuments
    };

  } catch (error) {
    console.error('خطا در دریافت حساب‌ها و اسناد مالی کاربر:', error);
    return { 
      status: 500, 
      message: 'خطا در دریافت اطلاعات مالی' 
    };
  }
}

// export async function getUserAccountsAndDocuments() {
//   await connectDB();
  
//   try {
//     // احراز هویت کاربر
//     const user = await authenticateUser();
//     if (!user) {
//       return { status: 401, message: 'لطفا وارد حساب کاربری خود شوید' };
//     }

//     // دریافت اسناد مالی کاربر
//     const ledgers = await Ledger.find({ createdBy: user.id })
//       .select('-__v')
//       .populate([
//         {
//           path: 'transactions',
//           populate: [
//             {
//               path: 'account',
//               select: 'title accountType'
//             },
//             {
//               path: 'referenceId',
//               select: 'type description totalPrice totalItems'
//             }
//           ]
//         },
//         {
//           path: 'shop',
//           select: 'ShopName LogoUrl'
//         }
//       ])
//       .sort({ createdAt: -1 })
//       .lean();

//     // تبدیل داده‌های اسناد مالی به فرمت مناسب
//     const formattedDocuments = ledgers.map(ledger => {
//       // یافتن تراکنش‌های مرتبط با این دفتر کل
//       const transactions = ledger.transactions || [];
      
//       // استخراج اطلاعات از اولین تراکنش برای دسترسی به referenceId
//       const firstTransaction = transactions[0] || {};
      
//       // محاسبه مجموع مبلغ سند
//       const totalAmount = transactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
      
//       return {
//         id: ledger._id.toString(),
//         title: ledger.description || firstTransaction.referenceId?.description || 'سند مالی',
//         date: ledger.createdAt ? new Date(ledger.createdAt).toLocaleDateString('fa-IR') : '',
//         type: firstTransaction.referenceId?.type || ledger.type || 'other',
//         amount: totalAmount,
//         shopId: ledger.shop?._id?.toString(),
//         shopName: ledger.shop?.ShopName || 'فروشگاه',
//         shopLogo: ledger.shop?.LogoUrl || '/images/default-shop.jpg',
//         lastUpdated: ledger.updatedAt ? new Date(ledger.updatedAt).toISOString() : '',
//         relatedAccounts: transactions.map(tx => ({
//           accountId: tx.account?._id?.toString(),
//           accountTitle: tx.account?.title || 'حساب',
//           debit: tx.debit || 0,
//           credit: tx.credit || 0
//         }))
//       };
//     });

//     return { 
//       status: 200,
//       documents: formattedDocuments
//     };

//   } catch (error) {
//     console.error('خطا در دریافت اسناد مالی کاربر:', error);
//     return { 
//       status: 500, 
//       message: 'خطا در دریافت اطلاعات مالی' 
//     };
//   }
// }


// دریافت جزئیات یک سند مالی
export async function getFinancialDocumentDetails(documentId) {
  await connectDB();
  
  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'لطفا وارد حساب کاربری خود شوید' };
    }

    // ابتدا مخاطب‌های مرتبط با کاربر را پیدا می‌کنیم
    const userContacts = await Contact.find({ 
      userAccount: user.id 
    }).select('_id').lean();
    
    if (!userContacts || userContacts.length === 0) {
      return { status: 403, message: 'شما دسترسی به این سند مالی ندارید' };
    }

    const contactIds = userContacts.map(contact => contact._id);

    // حساب‌های مرتبط با مخاطب‌های کاربر را پیدا می‌کنیم
    const userAccounts = await Account.find({ 
      contact: { $in: contactIds }
    }).select('_id').lean();
    
    const accountIds = userAccounts.map(account => account._id);

    // بررسی می‌کنیم آیا سند مالی مورد نظر با حساب‌های کاربر مرتبط است
    const transactions = await GeneralLedger.find({
      ledger: documentId,
      account: { $in: accountIds }
    }).select('_id').lean();

    if (!transactions || transactions.length === 0) {
      return { status: 403, message: 'شما دسترسی به این سند مالی ندارید' };
    }

    // دریافت جزئیات سند مالی
    const ledger = await Ledger.findById(documentId)
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'account',
              select: 'title accountType accountNature'
            }
          ]
        },
        {
          path: 'shop',
          select: 'ShopName LogoUrl ShopAddress ShopPhone'
        },
        {
          path: 'createdBy',
          select: 'name email phone'
        }
      ])
      .lean();

    if (!ledger) {
      return { status: 404, message: 'سند مالی یافت نشد' };
    }

    // تبدیل به فرمت مناسب برای نمایش
    const documentDetails = {
      id: ledger._id.toString(),
      title: ledger.description || 'سند مالی',
      date: new Date(ledger.createdAt).toLocaleDateString('fa-IR'),
      type: ledger.type || 'other',
      shop: {
        id: ledger.shop?._id.toString(),
        name: ledger.shop?.ShopName || 'فروشگاه',
        logo: ledger.shop?.LogoUrl || '/images/default-shop.jpg',
        address: ledger.shop?.ShopAddress || '',
        phone: ledger.shop?.ShopPhone || ''
      },
      creator: {
        name: ledger.createdBy?.name || '',
        email: ledger.createdBy?.email || '',
        phone: ledger.createdBy?.phone || ''
      },
      items: ledger.transactions.map(tx => ({
        id: tx._id.toString(),
        account: {
          id: tx.account?._id.toString(),
          title: tx.account?.title || 'حساب',
          type: tx.account?.accountType || '',
          nature: tx.account?.accountNature || ''
        },
        debit: tx.debit || 0,
        credit: tx.credit || 0,
        description: tx.description || ''
      })),
      totalAmount: ledger.transactions.reduce((sum, tx) => sum + (tx.debit || 0), 0)
    };

    return { status: 200, document: documentDetails };
  } catch (error) {
    console.error('خطا در دریافت جزئیات سند مالی:', error);
    return { status: 500, message: 'خطا در دریافت جزئیات سند مالی' };
  }
}