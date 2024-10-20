// app/actions/accountActions.js

"use server";
import mongoose from "mongoose";
import connectDB from "@/utils/connectToDB";
import Account from "@/models/Account";
import { revalidatePath } from "next/cache";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";

// ایجاد حساب جدید
export async function createAccount(data) {
  await connectDB();

  try {
    const userData = await authenticateUser();

    if (!userData) {
      return { success: false, message: "داده‌های کاربر یافت نشد." };
    }

    const { title, accountType, accountStatus, parentAccount, store } = data;

    const shopId = await GetShopIdByShopUniqueName(store);

    if (!shopId.ShopID) {
      return { success: false, message: "فروشگاه پیدا نشد." };
    }

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
    //   else {
    //     // اگر حساب والد ندارد، کدینگ را از صفر شروع می‌کنیم یا به نحوی دیگر تعیین می‌کنیم
    //     const topAccounts = await Account.find({ parentAccount: null }).sort({ accountCode: 1 }).lean();
    //     if (topAccounts.length > 0) {
    //       const lastTopCode = topAccounts[topAccounts.length - 1].accountCode;
    //       const lastNumber = parseInt(lastTopCode) || 0;
    //       accountCode = `${lastNumber + 1}`;
    //     } else {
    //       accountCode = '1';
    //     }
    //   }

    const newAccount = new Account({
      accountCode,
      title,
      accountType,
      accountStatus,
      parentAccount: parentAccount,
      accountNature:parent.accountNature,
      store:shopId.ShopID,
      createdBy: userData.id, // فرض بر این است که شناسه کاربر از درخواست دریافت شده است
      isSystem: false, // به صورت پیش‌فرض غیر فعال است
    });

    await newAccount.save();

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

// ویرایش حساب
export async function updateAccount(id, data) {
    await connectDB();
  
    try {
      const userData = await authenticateUser();
  
      if (!userData) {
        return { success: false, message: "داده‌های کاربر یافت نشد." };
      }
  
      let parent = "";
  
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
  
      // اعتبارسنجی و تبدیل فیلد store در صورت وجود
      if (data.store) {
        if (mongoose.Types.ObjectId.isValid(data.store)) {
          data.store = mongoose.Types.ObjectId(data.store);
        } else {
          return { success: false, message: "شناسه فروشگاه نامعتبر است." };
        }
      }
  
      // اگر parentAccount تغییر کرده باشد، باید کدینگ حساب را نیز به‌روزرسانی کنیم
      if (
        data.parentAccount &&
        data.parentAccount !== existingAccount.parentAccount?.toString()
      ) {
        parent = await Account.findById(data.parentAccount).lean();
        if (!parent) {
          return { success: false, message: "حساب والد جدید پیدا نشد." };
        }
  
        // تولید کدینگ جدید بر اساس حساب والد جدید
        const siblingAccounts = await Account.find({
          parentAccount: data.parentAccount,
        })
          .sort({ accountCode: 1 })
          .lean();
        let newAccountCode = "";
        if (siblingAccounts.length > 0) {
          const lastSiblingCode =
            siblingAccounts[siblingAccounts.length - 1].accountCode;
          const lastNumber = parseInt(lastSiblingCode.split("-").pop()) || 0;
          newAccountCode = `${parent.accountCode}-${lastNumber + 1}`;
        } else {
          newAccountCode = `${parent.accountCode}-1`;
        }
  
        data.accountCode = newAccountCode;
        //   data.parentAccount= parentAccount;
        data.accountNature = parent.accountNature;
        data.updatedBy = userData.id;
      }
  
      const updatedAccount = await Account.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean(); // استفاده از .lean()
  
      revalidatePath("/accounts");
      return { success: true };
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

// فعال‌سازی حساب
// فعال‌سازی حساب
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
  

// غیر فعال‌سازی حساب

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
  
    const accounts = await Account.find(filter).sort({ accountCode: 1 }).lean(); // افزودن .lean() اینجا
  
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
  