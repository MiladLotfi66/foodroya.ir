// app/actions/accountActions.js
"use server";
import mongoose from "mongoose";
import connectDB from "@/utils/connectToDB";
import Account from "@/templates/panel/Account/Account";
import Tag from "../Product/Tag";
import Contact from "../Contact/Contact";
import PriceTemplate from "../PriceTemplate/PriceTemplate";
import Product from "../Product/Product";
import Feature from "../Product/Feature";
import FeatureKey from "../Product/FeatureKey";
// import Currency from "../Currency/Currency";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import { copyImage } from "@/utils/ImageUploader";
import { CheckUserPermissionInShop } from "../rols/RolesPermissionActions";

//FinancialDocumentsServerActions.js


// ایجاد حساب جدید
export async function createAccount(data, session = null) {
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
    
    const { _id, title, accountType, accountStatus, parentAccount, store, contact, creditLimit, posConected, bankAcountNumber, bankCardNumber, productId} = data;
    const hasAccess=await CheckUserPermissionInShop(store,"accountsPermissions","add")
if (!hasAccess.hasPermission) {
  return { status: 401, message: 'شما دسترسی لازم را ندارید' };

}    
    let accountCode = "";
    let parent = "";
    if (parentAccount) {
      parent = await Account.findById(parentAccount).lean();

      if (!parent) {
        return { success: false, message: "حساب والد پیدا نشد." };
      }

      const siblingAccounts = await Account.find({
        parentAccount: parentAccount,
      }).lean();
      
      if (siblingAccounts.length > 0) {
        const lastNumber = siblingAccounts.reduce((max, account) => {
          const codeParts = account.accountCode.split("-");
          const num = parseInt(codeParts[codeParts.length - 1], 10);
          return num > max ? num : max;
        }, 0);
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
    
      newAccountData.creditLimit = creditLimit || 0;
      newAccountData.contact = contact;
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
    
    const hasAccess=await CheckUserPermissionInShop(existingAccount.store,"accountsPermissions","edit")
  if (!hasAccess.hasPermission) {
     return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
        unsetFields.creditLimit = "";
        break;

      case "اشخاص حقیقی":
      case "اشخاص حقوقی":
        updateFields.accountType = data.accountType;
        if (!data.contact) {
          return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب مخاطب الزامیست" };
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
        updateFields.title = data.title;

        unsetFields.bankAcountNumber = "";
        unsetFields.bankCardNumber = "";
        unsetFields.posConected = "";
        unsetFields.contact = "";
        unsetFields.creditLimit = "";
        updateFields.accountType = data.accountType;
    }

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


export async function updateAccountBySession(accountId, accountData, session) {
  
  try {
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { $set: accountData },
      { new: true, session }
    );

    if (!updatedAccount) {
      return { success: false, message: 'حساب یافت نشد.' };
    }

    return { success: true, account: updatedAccount };
  } catch (error) {
    console.error("Error updating account:", error);
    return { success: false, message: error.message };
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
    const hasAccess=await CheckUserPermissionInShop(existingAccount.store,"accountsPermissions","delete")
    if (!hasAccess.hasPermission) {
       return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
      const hasAccess=await CheckUserPermissionInShop(existingAccount.store,"accountsPermissions","edit")
  if (!hasAccess.hasPermission) {
     return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
    const hasAccess=await CheckUserPermissionInShop(existingAccount.store,"accountsPermissions","edit")
  if (!hasAccess.hasPermission) {
     return { status: 401, message: 'شما دسترسی لازم را ندارید' };
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
  
  // const hasAccess=await CheckUserPermissionInShop(storeId,"accountsPermissions","veiw")
  // if (!hasAccess.hasPermission) {
  //    return { status: 401, message: 'شما دسترسی لازم را ندارید' };
  //  } 

  const filter = { store: storeId };
  if (parentId) {
    filter.parentAccount = parentId;
  } else {
    filter.parentAccount = null; // حساب‌های ریشه
  }

  try {
    const accounts = await Account.find(filter)
      .sort({ accountCode: 1 })
      .populate("contact")
      .populate("createdBy", "name userUniqName userImage") // فقط فیلدهای title و userimage از createdBy
      .populate("productId", "images") // فقط فیلدهای title و userimage از createdBy
      .lean(); // افزودن .lean() برای دریافت اشیاء ساده

    // استفاده از تابع simplifyObject برای ساده‌سازی هر حساب
    const simplifiedAccounts = accounts.map((account) => simplifyObject(account));

    return { Accounts: simplifiedAccounts, status: 200 };
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw new Error('مشکلی در دریافت حساب‌ها رخ داده است.');
  }
}

// دریافت حساب‌ها بر اساس شروع یک کاراکتر خاص
export async function GetAccountsByStartingCharacter(storeId, startingChar = "", field = 'title', accountType = "") {
  
  await connectDB();

  try {
    // اعتبارسنجی storeId
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      throw new Error('شناسه فروشگاه نامعتبر یا موجود نیست.');
    }

    const sanitizedChar = typeof startingChar === 'string' ? startingChar.trim() : "";
    let sanitizedAccountType = accountType;

    // تعیین فیلدی که باید فیلتر شود
    const validFields = ['title', 'accountCode'];
    if (!validFields.includes(field)) {
      throw new Error(`فیلد نامعتبر است. باید یکی از موارد زیر باشد: ${validFields.join(', ')}`);
    }

    // تعریف نوع‌های حساب مجاز (به عنوان مثال)
    const validAccountTypes = ["صندوق","حساب عادی","گروه حساب","حساب بانکی","اشخاص حقیقی","اشخاص حقوقی","حساب انتظامی"];

    // اعتبارسنجی نوع حساب
    if (Array.isArray(sanitizedAccountType)) {
      // اگر accountType یک آرایه است، بررسی کنید که همه عناصر آرایه معتبر باشند
      const invalidTypes = sanitizedAccountType.filter(type => !validAccountTypes.includes(type));
      if (invalidTypes.length > 0) {
        throw new Error(`نوع حساب نامعتبر است: ${invalidTypes.join(', ')}. باید یکی از موارد زیر باشد: ${validAccountTypes.join(', ')}`);
      }
    } else if (typeof sanitizedAccountType === 'string') {
      sanitizedAccountType = sanitizedAccountType.trim();
      if (sanitizedAccountType !== "" && !validAccountTypes.includes(sanitizedAccountType)) {
        throw new Error(`نوع حساب نامعتبر است. باید یکی از موارد زیر باشد: ${validAccountTypes.join(', ')}`);
      }
    } else {
      throw new Error('نوع حساب باید رشته یا آرایه‌ای از رشته‌ها باشد.');
    }

    // ساخت فیلتر اولیه با storeId و وضعیت حساب
    const filter = {
      store: storeId,
      accountStatus: 'فعال',
    };

    // اضافه کردن فیلتر بر اساس startingChar در صورت ارائه شدن
    if (sanitizedChar !== "") {
      filter[field] = { $regex: `^${sanitizedChar}`, $options: 'i' }; // 'i' برای حساسیت به حروف کوچک و بزرگ
    }

    // اضافه کردن فیلتر بر اساس accountType در صورت ارائه شدن
    if (sanitizedAccountType !== "") {
      if (Array.isArray(sanitizedAccountType)) {
        filter.accountType = { $in: sanitizedAccountType };
      } else {
        filter.accountType = sanitizedAccountType;
      }
    }

    const accounts = await Account.find(filter)
      .sort({ accountCode: 1 })
      .populate('contact')
      .lean();

    if (!accounts || accounts.length === 0) {
      return {
        success: true,
        message: 'هیچ حسابی مطابق با معیارهای جستجو پیدا نشد.',
        Accounts: []
      };
    }

    const plainAccounts = accounts.map(account => ({
      ...account,
      _id: account._id.toString(),
      accountCode: account.accountCode.toString(),
      title: account.title.toString(),
      store: account.store.toString(),
      parentAccount: account.parentAccount ? account.parentAccount.toString() : null,
      accountType: account.accountType.toString(),
      accountNature: account.accountNature ? account.accountNature.toString() : null,
      accountStatus: account.accountStatus.toString(),
      isSystem: account.isSystem,
      createdAt: account.createdAt.toISOString(),
      updatedBy: account.updatedBy ? account.updatedBy.toString() : null,
      updatedAt: account.updatedAt ? account.updatedAt.toISOString() : null,
      createdBy: account.createdBy.toString(),
    }));

    return { 
      success: true, 
      Accounts: plainAccounts, 
      status: 200 
    };
  } catch (error) {
    console.error('خطا در GetAccountsByStartingCharacter:', error);
    return {
      success: false,
      message: error.message || 'خطایی در استخراج حساب‌ها رخ داده است.',
      status: 500
    };
  }
}

function simplifyObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => simplifyObject(item));
  } else if (obj && typeof obj === 'object') {
    // اگر شیء یک Buffer است، آن را به رشته base64 تبدیل کنید
    if (Buffer.isBuffer(obj)) {
      return obj.toString('base64');
    }

    // اگر شیء یک Date است، آن را به رشته ISO تبدیل کنید
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // اگر شیء یک ObjectId است، آن را به رشته تبدیل کنید
    if (obj instanceof mongoose.Types.ObjectId) {
      return obj.toString();
    }

    // اگر شیء دارای toJSON است و غیر از Buffer و ObjectId آن را نادیده بگیردیم
    if (typeof obj.toJSON === 'function' && !(obj instanceof Buffer)) {
      obj = obj.toJSON();
    }

    const simplified = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        // نادیده گرفتن توابع
        if (typeof value === 'function') {
          continue;
        }

        // تبدیل Buffer
        if (Buffer.isBuffer(value)) {
          simplified[key] = value.toString('base64');
        }
        // تبدیل Date
        else if (value instanceof Date) {
          simplified[key] = value.toISOString();
        }
        // تبدیل ObjectId
        else if (value instanceof mongoose.Types.ObjectId) {
          simplified[key] = value.toString();
        }
        // تبدیل بازگشتی
        else if (Array.isArray(value) || (value && typeof value === 'object')) {
          simplified[key] = simplifyObject(value);
        }
        // سایر انواع داده‌ها
        else {
          simplified[key] = value;
        }
      }
    }
    return simplified;
  }
  return obj;
}

export async function GetAllAccountsByOptions(storeId, parentId = null, options = {}) {
  await connectDB();

  if (!storeId) {
    throw new Error("فروشگاه مشخص نشده است.");
  }

  const {
    fields = null,
    populateFields = [],
    limit = 0,
    page = 1,
    sort = { accountType: 1 },
    additionalFilters = {}
  } = options;

  // ساختار فیلتر اولیه با storeId
  let filter = { store: storeId };

  // اعمال فیلتر parentAccount تنها در صورتی که parentId ارائه شده باشد
  if (parentId !== null && parentId !== undefined) {
    filter.parentAccount = parentId;
  }

  // اعمال فیلترهای اضافی
  if (additionalFilters && typeof additionalFilters === 'object') {
    filter = { ...filter, ...additionalFilters };
  }


  // محاسبه تعداد کل آیتم‌ها مطابق فیلتر
  const total = await Account.countDocuments(filter);

  // محاسبه مجموع صفحات
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
  // محاسبه skip
  const skip = limit > 0 ? (page - 1) * limit : 0;

  // شروع ساخت کوئری
  let query = Account.find(filter);

  // انتخاب فیلدها اگر مشخص شده باشد
  if (fields && Array.isArray(fields) && fields.length > 0) {
    query = query.select(fields.join(' '));
  }

  // پاپیولیت کردن فیلدها اگر مشخص شده باشد
  if (populateFields && Array.isArray(populateFields) && populateFields.length > 0) {
    populateFields.forEach(field => {
      query = query.populate(field);
    });
  }

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


  // ساده‌سازی تمام فیلدها شامل پاپیولیت شده‌ها
  const plainAccounts = accounts?.map(account => simplifyObject(account));

  return { 
    Accounts: plainAccounts, 
    total, 
    totalPages, 
    currentPage: page, 
    status: 200 
  };
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
  
      return {
        success: true,
        accountId: account._id.toString(),

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
      
export async function pasteAccounts(accountIds, parentAccountId, storeId, actionType) {
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // اعتبارسنجی کاربر
    const userData = await authenticateUser(session);
    if (!userData) {
      await session.abortTransaction();
      session.endSession();
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    // دریافت حساب والد
    const parentAccount = await Account.findById(parentAccountId).session(session).lean();
    if (!parentAccount) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "حساب والد پیدا نشد." };
    }

    // جلوگیری از انتقال حساب والد به خودش در حالت برش
    if (accountIds.includes(parentAccountId.toString()) && actionType === "cut") {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "امکان انتقال حساب به خود حساب وجود ندارد." };
    }

    // استخراج بخش اول کدینگ حساب والد
    const parentRootCode = parentAccount.accountCode.split("-")[0];

    // دریافت حساب‌های مورد نظر
    const accounts = await Account.find({ _id: { $in: accountIds } }).session(session).lean();
    if (accounts.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "حسابی برای چسباندن پیدا نشد." };
    }

    // بررسی حساب‌های تداخل‌دار
    const conflictingAccounts = accounts.filter(account => {
      const isSameCode = account.accountCode === parentAccount.accountCode;
      const startsWithParentCode = parentAccount.accountCode.startsWith(`${account.accountCode}-`);
      return isSameCode || startsWithParentCode;
    });

    if (conflictingAccounts.length > 0 && actionType === "cut") {
      await session.abortTransaction();
      session.endSession();
      return { 
        success: false, 
        message: "امکان انتقال حساب به درون خودش یا حساب‌های زیرمجموعه‌ی خودش وجود ندارد." 
      };
    }

    // بررسی سازگاری بخش اول کدینگ
    const incompatibleAccounts = accounts.filter(account => {
      const accountRootCode = account.accountCode.split("-")[0];
      return accountRootCode !== parentRootCode;
    });

    if (incompatibleAccounts.length > 0 ) {
      await session.abortTransaction();
      session.endSession();
      return { 
        success: false, 
        message: "نمی‌توان حساب‌هایی را که از یک سرشاخه متفاوت هستند به سرشاخه مورد نظر انتقال داد." 
      };
    }

    // دریافت حساب‌های فرزند فعلی حساب والد برای تعیین شماره‌ی جدید
    const siblingAccounts = await Account.find({
      parentAccount: parentAccountId
    }).session(session).lean();

    // محاسبه بالاترین شماره موجود در کد حساب‌های فرزند
    let currentMax = 0;
    if (siblingAccounts.length > 0) {
      currentMax = siblingAccounts.reduce((max, account) => {
        const codeParts = account.accountCode.split("-");
        const num = parseInt(codeParts[codeParts.length - 1], 10);
        return num > max ? num : max;
      }, 0);
    }

    if (actionType === 'copy') {
      // در حالت کپی — هر سند جدید علاوه بر داشتن accountCode یکتا، نام آن نیز با پسوند "-کپی" نشان داده می‌شود.
      let current = currentMax;      
      const newAccounts = [];

      for (const account of accounts) {
        current++;
        // تولید کد حساب جدید به صورت ترتیبی
        const newAccountCode = `${parentAccount.accountCode}-${current}`;
        // برای نمایش عنوان به عنوان کپی، پسوند "-کپی" به نام حساب اضافه می‌شود.
        const duplicate = siblingAccounts.find(sibling => sibling.title === account.title);
    
        // **تعیین نام جدید بر اساس وجود تکرار**
        const newTitle = duplicate ? `${account.title}-کپی` : account.title;
    
        // ساخت داده‌های جدید حساب
        const newAcountId=new mongoose.Types.ObjectId()
        const newProductId=new mongoose.Types.ObjectId()
        const newAccountData = new Account({
          ...account,
          _id: newAcountId, // شناسه جدید
          title: newTitle,                     // تغییر عنوان به همراه پسوند "کپی"
          accountCode: newAccountCode,         // کد حساب جدید
          parentAccount: parentAccountId,      // حساب والد جدید
          createdBy: userData.id,
          updatedBy: userData.id,
          balance: 0,
        });
        if (account.accountType === 'کالا') { 
          newAccountData.productId=newProductId
        }
        const savedAccount = await newAccountData.save({ session });

        // بررسی نوع حساب و کپی اطلاعات کالا در صورت نیاز
        if (account.accountType === 'کالا') {
          const originalProduct = await Product.findOne({ accountId: account._id })
            .populate('Features')
            .session(session)
            .lean();

          if (originalProduct) {
            // کپی ویژگی‌ها (Features) مشابه قبلی
            const newFeatureIds = [];
            const originalFeatures = await Feature.find({ productId: originalProduct._id }).session(session).lean();

            for (const feature of originalFeatures) {
              const newFeatureId = new mongoose.Types.ObjectId();
              const newFeature = new Feature({
                ...feature,
                _id: newFeatureId,
                productId: newProductId,
                LastEditedBy: userData.id,
                CreatedBy: userData.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              delete newFeature.__v;
              await newFeature.save({ session });
              newFeatureIds.push(newFeatureId);
            }
            const uploadDir = `Uploads/Shop/images/${account.store}/Products`;

            // کپی تصاویر
            const newImages = originalProduct.images.length > 0 

              ? await copyImage(originalProduct.images, uploadDir) // جایگزین 'new-upload-directory' با دایرکتوری مناسب
              : [];

            // ایجاد محصول جدید با تصاویر جدید
            const newProductData = {
              ...originalProduct,
              _id: newProductId,
              accountId: newAcountId,
              title: newTitle,
              stock: 0,
              lastPurchasePrice: 0,
              parentAccount: parentAccountId,
              Features: newFeatureIds,
              images: newImages, // استفاده از تصاویر کپی شده
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: userData.id,
              updatedBy: userData.id,
            };
            delete newProductData.__v;

            const newProduct = new Product(newProductData);
            await newProduct.save({ session });
          }
        }

        newAccounts.push(savedAccount);
      }

      await session.commitTransaction();
      session.endSession();

      return { success: true };
    }
    else if (actionType === 'cut') {
      // در حالت کات (برش)، انتقال حساب به حساب والد جدید انجام می‌شود.
      // توجه: در این حالت عنوان حساب دست‌نخورده باقی می‌ماند.
      // در صورت بروز مشکل به دلیل تکراری بودن نام در پوشه مقصد، می‌توانید منطق تغییر عنوان مشابه کپی را اعمال کنید.
      let current = currentMax;
      
      const updatedAccounts = [];

      for (const account of accounts) {
        current++;
        const newAccountCode = `${parentAccount.accountCode}-${current}`;
        // به‌روزرسانی حساب با کد حساب جدید و والد جدید
        const updatedAccount = await Account.findByIdAndUpdate(
          account._id,
          {
            $set: {
              parentAccount: parentAccountId,
              accountCode: newAccountCode,
              updatedBy: userData.id,
            }
          },
          { new: true, session }
        );
        // اگر حساب از نوع کالا باشد و نیاز به آپدیت اطلاعات کالا دارید، می‌توانید اینجا منطق مربوطه را اضافه کنید.
        updatedAccounts.push(updatedAccount);
      }

      await session.commitTransaction();
      session.endSession();

      return { success: true};
    } 
    else {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "نوع عملیات معتبر نیست." };
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error pasting accounts:", error);
    return {
      success: false,
      message: error.message || "خطایی در چسباندن حساب‌ها رخ داده است.",
    };
  }
} 



export async function getUserAccounts() {
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
    }).select('_id');
console.log("userContacts",userContacts);

    if (!userContacts || userContacts.length === 0) {
      return { 
        status: 200, 
        accounts: [],
        message: 'هیچ حسابی یافت نشد'
      };
    }

    const contactIds = userContacts.map(contact => contact._id);

    // حساب‌های مرتبط با مخاطب‌های کاربر را پیدا می‌کنیم
    const accounts = await Account.find({ 
      contact: { $in: contactIds },
      accountStatus: 'فعال'
    }).populate('store', 'name logo')  // اطلاعات فروشگاه
    .populate('contact', 'name')// نام مخاطب
    .select('_id title accountType accountCode store accountNature balance contact')
    .sort({ accountCode: 1 })
    .lean();

    if (!accounts || accounts.length === 0) {
      return { 
        status: 200, 
        accounts: [],
        message: 'هیچ حسابی یافت نشد'
      };
    }

    // تبدیل داده‌ها به فرمت مناسب
    const formattedAccounts = accounts.map(account => ({
      id: account._id.toString(),
      title: account.title,
      type: account.accountType,
      code: account.accountCode,
      nature: account.accountNature,
      balance: account.balance || 0,
      store: {
        id: account.store._id.toString(),
        name: account.store.name,
        logo: account.store.logo
      },
      contact: {
        id: account.contact._id.toString(),
        name: account.contact.name
      }
    }));

    return { 
      status: 200, 
      accounts: formattedAccounts 
    };

  } catch (error) {
    console.error('خطا در دریافت حساب‌های کاربر:', error);
    return { 
      status: 500, 
      message: 'خطا در دریافت حساب‌های کاربر' 
    };
  }
}
