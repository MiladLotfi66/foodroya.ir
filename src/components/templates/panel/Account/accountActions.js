// app/actions/accountActions.js

"use server";
import mongoose from "mongoose";
import connectDB from "@/utils/connectToDB";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";

// ایجاد حساب جدید

export async function createAccount(data, session = null) {
  console.log("data", data);

  await connectDB();

  try {
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

    if (!userData) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    const { _id, title, accountType, accountStatus, parentAccount, store, currency, contact, creditLimit, posConected, bankAcountNumber, bankCardNumber, productId} = data;

    let accountCode = "";
    let parent = "";

    if (parentAccount) {
      parent = await Account.findById(parentAccount).lean();

      if (!parent) {
        return { success: false, message: "حساب والد پیدا نشد." };
      }

      const siblingAccounts = await Account.find({
        parentAccount: parentAccount,
      })
        .sort({ accountCode: 1 })
        .lean();

      if (siblingAccounts.length > 0) {
        const lastSiblingCode =
          siblingAccounts[siblingAccounts.length - 1].accountCode;
        const lastNumber = parseInt(lastSiblingCode.split("-").pop()) || 0;
        accountCode = `${parent.accountCode}-${lastNumber + 1}`;
      } else {
        accountCode = `${parent.accountCode}-1`;
      }
    }

    const newAccountData = new Account({
      _id: _id || new mongoose.Types.ObjectId(),
      accountType,
      title,
      accountCode,
      accountStatus,
      parentAccount: parentAccount,
      accountNature: parent?.accountNature,
      store,
      createdBy: userData.id,
      updatedBy: userData.id,
      isSystem: false,
    });

    if (accountType === "اشخاص حقیقی" || accountType === "اشخاص حقوقی") {
      if (!contact) {
        return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب مخاطب الزامیست" };
      }
      if (!currency) {
        return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب ارز الزامیست" };
      }
      newAccountData.creditLimit = creditLimit || 0;
      newAccountData.contact = contact;
      newAccountData.currency = currency;
    }
    else if (accountType === "حساب بانکی") {
      newAccountData.posConected = posConected;
      newAccountData.bankAcountNumber = bankAcountNumber;
      newAccountData.bankCardNumber = bankCardNumber;
    }
 else if (accountType === "کالا") {
      newAccountData.productId = productId;
     
    }

    if (session) {
      await newAccountData.save({ session });
    } else {
      await newAccountData.save();
    }

    revalidatePath("/accounts");

    return { success: true };
  } catch (error) {
    console.error("Error creating account:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است.",
      };
    }
    return {
      success: false,
      message: error.message || "خطایی در ایجاد حساب رخ داده است.",
    };
  }
}



export async function updateAccount(id, data) {
  await connectDB();

  try {
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

    const existingAccount = await Account.findById(id).lean();
    if (!existingAccount) {
      return { success: false, message: "حساب یافت نشد." };
    }

    if (existingAccount.isSystem) {
      return {
        success: false,
        message: "امکان ویرایش حساب‌های سیستمی وجود ندارد.",
      };
    }

    // ایجاد آبجکت برای $set و $unset
    const updateFields = {};
    const unsetFields = {};

    // تعیین نوع حساب و تنظیم فیلدها
    switch (data.accountType) {
      case "حساب بانکی":
        updateFields.accountType = data.accountType;
        updateFields.posConected = data.posConected;
        updateFields.bankAcountNumber = data.bankAcountNumber;
        updateFields.bankCardNumber = data.bankCardNumber;
        // حفظ فقط فیلدهای مرتبط با حساب بانکی
        unsetFields.contact = "";
        unsetFields.currency = "";
        unsetFields.creditLimit = "";
        break;

      case "اشخاص حقیقی":
      case "اشخاص حقوقی":
        updateFields.accountType = data.accountType;

        if (!data.contact) {
          return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب مخاطب الزامیست" };
        }

        if (data.currency && mongoose.Types.ObjectId.isValid(data.currency)) {
          updateFields.currency = new mongoose.Types.ObjectId(data.currency);
        } else {
          return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب ارز الزامیست" };
        }

        updateFields.contact = data.contact;
        updateFields.creditLimit = data.creditLimit;

        // حفظ فقط فیلدهای مرتبط با اشخاص حقیقی و حقوقی
        unsetFields.bankAcountNumber = "";
        unsetFields.bankCardNumber = "";
        unsetFields.posConected = "";
        break;

      default:
        // حذف تمامی فیلدهای غیرضروری برای سایر حساب‌ها
        unsetFields.bankAcountNumber = "";
        unsetFields.bankCardNumber = "";
        unsetFields.posConected = "";
        unsetFields.contact = "";
        unsetFields.currency = "";
        unsetFields.creditLimit = "";
        updateFields.accountType = data.accountType;
    }

    // // مدیریت فیلدهای store
    // if (data.store && mongoose.Types.ObjectId.isValid(data.store)) {
    //   updateFields.store = new mongoose.Types.ObjectId(data.store);
    // } else {
    //   unsetFields.store = "";
    // }

    // مدیریت parentAccount
    if (data.parentAccount && data.parentAccount !== existingAccount.parentAccount?.toString()) {
      const parent = await Account.findById(data.parentAccount).lean();
      if (!parent) {
        return { success: false, message: "حساب والد جدید پیدا نشد." };
      }
      updateFields.accountCode = `${parent.accountCode}-${new Date().getTime()}`;
      updateFields.accountNature = parent.accountNature;
      updateFields.updatedBy = userData.id;
    }

    // ایجاد آبجکت آپدیت نهایی
    const updateQuery = {};
    if (Object.keys(updateFields).length > 0) {
      updateQuery.$set = updateFields;
    }
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    console.log("Update Query:", updateQuery);

    // انجام آپدیت
    const updatedAccount = await Account.findByIdAndUpdate(id, updateQuery, {
      new: true,
      runValidators: true,
    }).lean();

    revalidatePath("/accounts");
    return { success: true, data: updatedAccount };
  } catch (error) {
    console.error("Error updating account:", error);
    if (error.code === 11000) {
      return {
        success: false,
        message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است.",
      };
    }
    return {
      success: false,
      message: error.message || "خطایی در ویرایش حساب رخ داده است.",
    };
  }
}

// حذف حساب
export async function deleteAccount(id) {
  await connectDB();

  try {
    const existingAccount = await Account.findById(id);
    if (!existingAccount) {
      return { success: false, message: "حساب یافت نشد." };
    }

    if (existingAccount.isSystem) {
      return {
        success: false,
        message: "امکان حذف حساب‌های سیستمی وجود ندارد.",
      };
    }

    // بررسی وجود زیرحساب‌ها قبل از حذف (اختیاری)
    const childAccounts = await Account.find({ parentAccount: id });
    if (childAccounts.length > 0) {
      return {
        success: false,
        message: "امکان حذف حسابی که زیرحساب دارد وجود ندارد.",
      };
    }

    await Account.findByIdAndDelete(id);
    revalidatePath("/accounts");
    return { success: true, message: "حساب با موفقیت حذف شد." };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      message: error.message || "خطایی در حذف حساب رخ داده است.",
    };
  }
}

export async function activateAccount(id) {
    await connectDB();
  
    try {
      const existingAccount = await Account.findById(id);
      if (!existingAccount) {
        return { success: false, message: "حساب یافت نشد." };
      }
  
      if (existingAccount.isSystem) {
        return {
          success: false,
          message: "امکان تغییر وضعیت حساب‌های سیستمی وجود ندارد.",
        };
      }
  
      existingAccount.accountStatus = "فعال";
      await existingAccount.save();
  
      revalidatePath("/accounts");
  
      // تبدیل داده‌های حساب به نوع‌های ساده
      const simplifiedAccount = {
        _id: existingAccount._id.toString(),
        accountCode: existingAccount.accountCode.toString(),
        title: existingAccount.title,
        accountType: existingAccount.accountType,
        accountNature: existingAccount.accountNature,
        accountStatus: existingAccount.accountStatus,
        isSystem: existingAccount.isSystem,
        parentAccount: existingAccount.parentAccount
          ? existingAccount.parentAccount.toString()
          : null,
        store: existingAccount.store.toString(),
        createdBy: existingAccount.createdBy.toString(),
        updatedBy: existingAccount.updatedBy ? existingAccount.updatedBy.toString() : null,
        createdAt: existingAccount.createdAt.toISOString(),
        updatedAt: existingAccount.updatedAt ? existingAccount.updatedAt.toISOString() : null,
      };
  
      return { success: true, data: simplifiedAccount };
    } catch (error) {
      console.error("Error activating account:", error);
      return {
        success: false,
        message: error.message || "خطایی در فعال‌سازی حساب رخ داده است.",
      };
    }
  }


export async function deactivateAccount(id) {
  await connectDB();

  try {
    const existingAccount = await Account.findById(id);
    if (!existingAccount) {
      return { success: false, message: "حساب یافت نشد." };
    }

    if (existingAccount.isSystem) {
      return {
        success: false,
        message: "امکان تغییر وضعیت حساب‌های سیستمی وجود ندارد.",
      };
    }

    existingAccount.accountStatus = "غیر فعال";
    await existingAccount.save();

    revalidatePath("/accounts");


      // تبدیل داده‌های حساب به نوع‌های ساده
      const simplifiedAccount = {
        _id: existingAccount._id.toString(),
        accountCode: existingAccount.accountCode.toString(),
        title: existingAccount.title,
        accountType: existingAccount.accountType,
        accountNature: existingAccount.accountNature,
        accountStatus: existingAccount.accountStatus,
        isSystem: existingAccount.isSystem,
        parentAccount: existingAccount.parentAccount
          ? existingAccount.parentAccount.toString()
          : null,
        store: existingAccount.store.toString(),
        createdBy: existingAccount.createdBy.toString(),
        updatedBy: existingAccount.updatedBy ? existingAccount.updatedBy.toString() : null,
        createdAt: existingAccount.createdAt.toISOString(),
        updatedAt: existingAccount.updatedAt ? existingAccount.updatedAt.toISOString() : null,
      };
  
      return { success: true, data: simplifiedAccount };
  } catch (error) {
    console.error("Error deactivating account:", error);
    return {
      success: false,
      message: error.message || "خطایی در غیر فعال‌سازی حساب رخ داده است.",
    };
  }
}
// دریافت تمام حساب‌ها
export async function GetAllAccounts(storeId, parentId = null) {
  
    await connectDB();
  
    if (!storeId) {
      throw new Error("فروشگاه مشخص نشده است.");
    }

    const filter = { store: storeId };
    if (parentId) {
      filter.parentAccount = parentId;
    } else {
      filter.parentAccount = null; // حساب‌های ریشه
    }

    const accounts = await Account.find(filter).sort({ accountCode: 1 }).populate("contact").populate('currency')
    .lean(); // افزودن .lean() اینجا

    const plainAccounts = accounts?.map((account) => {
      return {
        ...account,
        _id: account._id?.toString() || null, // تبدیل ObjectId به string
        accountCode: account.accountCode?.toString() || null,
        title: account.title?.toString() || null,
        store: account.store?.toString() || null,
        parentAccount: account.parentAccount?.toString() || null,
        accountType: account.accountType?.toString() || null,
        accountNature: account.accountNature?.toString() || null,
        accountStatus: account.accountStatus?.toString() || null,
        isSystem: account.isSystem, // حفظ نوع بولین
        createdAt: account.createdAt?.toISOString() || null, // تبدیل تاریخ به ISO string
        updatedBy: account.updatedBy?.toString() || null,
        updatedAt: account.updatedAt?.toISOString() || null,
        createdBy: account.createdBy?.toString() || null,
      };
    });

    return { Accounts: plainAccounts, status: 200 };
  }
// export async function GetAllAccountsByOptions(storeId, parentId = null, options = {}) {
//     await connectDB();
  
//     if (!storeId) {
//       throw new Error("فروشگاه مشخص نشده است.");
//     }
  
//     const {
//       fields = null,
//       populateFields = [],
//       limit = 0,
//       skip = 0,
//       sort = { accountCode: 1 },
//       additionalFilters = {}
//     } = options;
  
//     // ساختار فیلتر اولیه با storeId
//     const filter = { store: storeId };
  
//     // اعمال پدر حساب (parentAccount) به صورت جداگانه
//     if (parentId !== null) {
//       filter.parentAccount = parentId;
//     } else {
//       filter.parentAccount = null; // حساب‌های ریشه
//     }
  
//     // اعمال فیلترهای اضافی
//     if (additionalFilters && typeof additionalFilters === 'object') {
//       Object.assign(filter, additionalFilters);
//     }
  
//     // شروع ساخت کوئری
//     let query = Account.find(filter);
  
//     // انتخاب فیلدها اگر مشخص شده باشد
//     if (fields && Array.isArray(fields) && fields.length > 0) {
//       query = query.select(fields.join(' '));
//     }
  
//     // پاپیولیت کردن فیلدها اگر مشخص شده باشد
//     if (populateFields && Array.isArray(populateFields) && populateFields.length > 0) {
//       populateFields.forEach(field => {
//         query = query.populate(field);
//       });
//     }
  
//     // اعمال مرتب‌سازی
//     if (sort && typeof sort === 'object') {
//       query = query.sort(sort);
//     }
  
//     // اعمال صفحه‌بندی
//     if (limit > 0) {
//       query = query.limit(limit);
//     }
  
//     if (skip > 0) {
//       query = query.skip(skip);
//     }
  
//     // اجرای کوئری با lean برای بهینه‌سازی
//     const accounts = await query.lean();
  
//     // تبدیل ObjectId و سایر فیلدهای مربوطه به رشته
//     const plainAccounts = accounts?.map((account) => {
//       return {
//         ...account,
//         _id: account._id?.toString() || null,
//         accountCode: account.accountCode?.toString() || null,
//         title: account.title?.toString() || null,
//         store: account.store?.toString() || null,
//         parentAccount: account.parentAccount?.toString() || null,
//         accountType: account.accountType?.toString() || null,
//         accountNature: account.accountNature?.toString() || null,
//         accountStatus: account.accountStatus?.toString() || null,
//         isSystem: account.isSystem, // حفظ نوع بولین
//         createdAt: account.createdAt?.toISOString() || null,
//         updatedBy: account.updatedBy?.toString() || null,
//         updatedAt: account.updatedAt?.toISOString() || null,
//         createdBy: account.createdBy?.toString() || null,
//       };
//     });
  
//     return { Accounts: plainAccounts, status: 200 };
//   }
// accountActions.js یا محل تعریف تابع شما

export async function GetAllAccountsByOptions(storeId, parentId = null, options = {}) {
  await connectDB();
console.log("options",options);

  if (!storeId) {
    throw new Error("فروشگاه مشخص نشده است.");
  }
console.log("11111111");

  const {
    fields = null,
    populateFields = [],
    limit = 0,
    skip = 0,
    sort = { accountCode: 1 },
    additionalFilters = {}
  } = options;
  console.log("222222");

  // ساختار فیلتر اولیه با storeId
  const filter = { store: storeId };

  // اعمال پدر حساب (parentAccount) به صورت جداگانه
  if (parentId !== null) {
    filter.parentAccount = parentId;
  } else {
    filter.parentAccount = null; // حساب‌های ریشه
  }
  console.log("3333333");

  // اعمال فیلترهای اضافی
  if (additionalFilters && typeof additionalFilters === 'object') {
    Object.assign(filter, additionalFilters);
  }

  // شروع ساخت کوئری
  let query = Account.find(filter);

  // انتخاب فیلدها اگر مشخص شده باشد
  if (fields && Array.isArray(fields) && fields.length > 0) {
    query = query.select(fields.join(' '));
  }
  console.log("444444");

  // پاپیولیت کردن فیلدها اگر مشخص شده باشد
  if (populateFields && Array.isArray(populateFields) && populateFields.length > 0) {
    populateFields.forEach(field => {
      query = query.populate(field);
    });
  }
  console.log("555555");
  console.log("populateFields",populateFields);

  // اعمال مرتب‌سازی
  if (sort && typeof sort === 'object') {
    query = query.sort(sort);
  }

  // اعمال صفحه‌بندی
  if (limit > 0) {
    query = query.limit(limit);
  }

  if (skip > 0) {
    query = query.skip(skip);
  }

  // اجرای کوئری با lean برای بهینه‌سازی
  const accounts = await query.lean();
  console.log("accounts",accounts);

  // تبدیل ObjectId و سایر فیلدهای مربوطه به رشته
  const plainAccounts = accounts?.map((account) => {
    return {
      ...account,
      _id: account._id?.toString() || null,
      accountCode: account.accountCode?.toString() || null,
      title: account.title?.toString() || null,
      store: account.store?.toString() || null,
      parentAccount: account.parentAccount?.toString() || null,
      accountType: account.accountType?.toString() || null,
      accountNature: account.accountNature?.toString() || null,
      accountStatus: account.accountStatus?.toString() || null,
      isSystem: account.isSystem, // حفظ نوع بولین
      createdAt: account.createdAt?.toISOString() || null,
      updatedBy: account.updatedBy?.toString() || null,
      updatedAt: account.updatedAt?.toISOString() || null,
      createdBy: account.createdBy?.toString() || null,
    };
  });

  return { Accounts: plainAccounts, status: 200 };
}


  export async function GetAccountIdBystoreIdAndAccountCode(storeId, accountCode) {

    try {
      if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
        throw new Error('شناسه فروشگاه نامعتبر یا موجود نیست.');
      }
      if (!accountCode || typeof accountCode !== 'string' || accountCode.trim() === '') {
        throw new Error('کد حساب نامعتبر یا موجود نیست.');
      }
      const account = await Account.findOne({
        store: storeId,
        accountCode: accountCode.trim(),
        accountStatus: 'فعال', // فرض بر این است که تنها حساب‌های فعال مد نظر هستند
      }).select('_id'); // انتخاب تنها فیلد _id برای بهینه‌سازی
  
      if (!account) {
        return {
          success: false,
          message: 'حساب با شناسه فروشگاه و کد حساب ارائه شده یافت نشد.',
        };
      }
  console.log("accountId", account._id);
  
      return {
        success: true,
        accountId: account._id,

      };
    } catch (error) {
      // ثبت خطا برای مقاصد دیباگینگ
      console.error('خطا در GetAccountIdBystoreIdAndAccountCode:', error);
  
      // بازگشت پیام خطای عمومی به کاربر
      return {
        success: false,
        message: 'در بازیابی شناسه حساب خطایی رخ داده است. لطفاً بعداً مجدداً تلاش کنید.',
      };
    }
  };
    
 