// app/actions/accountActions.js

"use server";
import mongoose from "mongoose";
import connectDB from "@/utils/connectToDB";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";

// ایجاد حساب جدید
export async function createAccount(data) {
  console.log("data",data);
  
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
  

    const { title, accountType, accountStatus, parentAccount, store, currency ,contact,creditLimit,posConected,bankAcountNumber ,bankCardNumber} = data;

    // const shopId = store

    // if (!shopId) {
    //   return { success: false, message: "فروشگاه پیدا نشد." };
    // }

    let accountCode = "";
    let parent ="";

    if (parentAccount) {
      parent = await Account.findById(parentAccount).lean();

      if (!parent) {
        return { success: false, message: "حساب والد پیدا نشد." };
      }

      // پیدا کردن آخرین حساب برادر برای تولید کدینگ جدید
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
      accountType,
      title,
      accountCode,
      accountStatus,
      parentAccount: parentAccount,
      accountNature:parent.accountNature,
      store,
      createdBy: userData.id, // فرض بر این است که شناسه کاربر از درخواست دریافت شده است
      isSystem: false, // به صورت پیش‌فرض غیر فعال است
      // contact,
      // currency,
      // creditLimit,
    });
        // شرط برای ذخیره فیلدهای اضافی بر اساس نوع حساب
        if (accountType === "اشخاص حقیقی" || accountType === "اشخاص حقوقی") {
          if (!contact) {
            return { success: false, message: "برای حساب اشخاص حقیقی و حقیقی انتخاب مخاطب الزامیست" };
          }
          if (!currency) {
            return { success: false, message: "برای حساب اشخاص حقیقی و حقیقی انتخاب ارز الزامیست" };
          }

       // تنظیم مقدار creditLimit
          newAccountData.creditLimit = creditLimit || 0;
          newAccountData.contact = contact;
          newAccountData.currency = currency;
        }
        else if (accountType === "حساب بانکی") {

          newAccountData.posConected = posConected;
          newAccountData.bankAcountNumber = bankAcountNumber;
          newAccountData.bankCardNumber = bankCardNumber;
        }
        // else{
        //         delete newAccountData.currency;
        // }

    await newAccountData.save();

    // در صورت نیاز به به‌روزرسانی کش‌ها
    revalidatePath("/accounts"); // مسیر مربوطه
    return { success: true }; // تبدیل به شیء ساده
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
    
 