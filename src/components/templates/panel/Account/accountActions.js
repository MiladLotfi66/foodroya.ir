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
   
    const newAccountData = new Account({
      accountType,
      title,
      accountCode,
      accountStatus,
      parentAccount: parentAccount,
      accountNature:parent.accountNature,
      store:shopId.ShopID,
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
          console.log("4.54545454545");

          newAccountData.posConected = posConected;
          newAccountData.bankAcountNumber = bankAcountNumber;
          newAccountData.bankCardNumber = bankCardNumber;
        }
        // else{
        //         delete newAccountData.currency;
        // }
        console.log("newAccountData",newAccountData);

    await newAccountData.save();
    console.log("555555");

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
// export async function updateAccount(id, data) {
//     await connectDB();
  
//     try {
//       const userData = await authenticateUser();
  
//       if (!userData) {
//         return { success: false, message: "داده‌های کاربر یافت نشد." };
//       }
  
//       let parent = "";
  
//       const existingAccount = await Account.findById(id).lean();
//       if (!existingAccount) {
//         return { success: false, message: "حساب یافت نشد." };
//       }
  
//       if (existingAccount.isSystem) {
//         return {
//           success: false,
//           message: "امکان ویرایش حساب‌های سیستمی وجود ندارد.",
//         };
//       }
  
//       // اعتبارسنجی و تبدیل فیلد store در صورت وجود
//       if (data.store) {
//         if (new mongoose.Types.ObjectId.isValid(data.store)) {
//           data.store = new mongoose.Types.ObjectId(data.store);
//         } else {
//           return { success: false, message: "شناسه فروشگاه نامعتبر است." };
//         }
//       }
  
//       // اگر parentAccount تغییر کرده باشد، باید کدینگ حساب را نیز به‌روزرسانی کنیم
//       if (
//         data.parentAccount &&
//         data.parentAccount !== existingAccount.parentAccount?.toString()
//       ) {
//         parent = await Account.findById(data.parentAccount).lean();
//         if (!parent) {
//           return { success: false, message: "حساب والد جدید پیدا نشد." };
//         }
  
//         // تولید کدینگ جدید بر اساس حساب والد جدید
//         const siblingAccounts = await Account.find({
//           parentAccount: data.parentAccount,
//         })
//           .sort({ accountCode: 1 })
//           .lean();
//         let newAccountCode = "";
//         if (siblingAccounts.length > 0) {
//           const lastSiblingCode =
//             siblingAccounts[siblingAccounts.length - 1].accountCode;
//           const lastNumber = parseInt(lastSiblingCode.split("-").pop()) || 0;
//           newAccountCode = `${parent.accountCode}-${lastNumber + 1}`;
//         } else {
//           newAccountCode = `${parent.accountCode}-1`;
//         }
  
//         data.accountCode = newAccountCode;
//         //   data.parentAccount= parentAccount;
//         data.accountNature = parent.accountNature;
//         data.updatedBy = userData.id;
//       }
  
//       const updatedAccount = await Account.findByIdAndUpdate(id, data, {
//         new: true,
//         runValidators: true,
//       }).lean(); // استفاده از .lean()
  
//       revalidatePath("/accounts");
//       return { success: true };
//     } catch (error) {
//       console.error("Error updating account:", error);
//       if (error.code === 11000) {
//         return {
//           success: false,
//           message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است.",
//         };
//       }
//       return {
//         success: false,
//         message: error.message || "خطایی در ویرایش حساب رخ داده است.",
//       };
//     }
//   }
  
// export async function updateAccount(id, data) {
//   await connectDB();

//   try {
//     const userData = await authenticateUser();

//     if (!userData) {
//       return { success: false, message: "داده‌های کاربر یافت نشد." };
//     }

//     const existingAccount = await Account.findById(id).lean();
//     if (!existingAccount) {
//       return { success: false, message: "حساب یافت نشد." };
//     }

//     if (existingAccount.isSystem) {
//       return {
//         success: false,
//         message: "امکان ویرایش حساب‌های سیستمی وجود ندارد.",
//       };
//     }

//     if (data.store && new mongoose.Types.ObjectId.isValid(data.store)) {
//       data.store = new mongoose.Types.ObjectId(data.store);
//     } else {
//       delete data.store;
//     }

//     if (data.parentAccount && data.parentAccount !== existingAccount.parentAccount?.toString()) {
//       const parent = await Account.findById(data.parentAccount).lean();
//       if (!parent) {
//         return { success: false, message: "حساب والد جدید پیدا نشد." };
//       }
//       data.accountCode = `${parent.accountCode}-${new Date().getTime()}`;
//       data.accountNature = parent.accountNature;
//       data.updatedBy = userData.id;
//     }

//     if (data.accountType === "اشخاص حقیقی" || data.accountType === "اشخاص حقوقی") {
//       if (!data.contact) {
//         return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب مخاطب الزامیست" };
//       }
//       if (data.currency && new mongoose.Types.ObjectId.isValid(data.currency)) {
//         data.currency = mongoose.Types.ObjectId(data.currency);
//       } else {
//         return { success: false, message: "برای حساب اشخاص حقیقی و حقوقی انتخاب ارز الزامیست" };
//       }
//     } else if (data.accountType === "حساب بانکی") {
//       data.posConected = data.posConected || null;
//       data.bankAcountNumber = data.bankAcountNumber || null;
//       data.bankCardNumber = data.bankCardNumber || null;
//     } else {
//       delete data.currency;
//       delete data.creditLimit;
//       delete data.contact;
//     }

//     console.log("data", data);

//     const updatedAccount = await Account.findByIdAndUpdate(id, data, {
//       new: true,
//       runValidators: true,
//     }).lean();

//     revalidatePath("/accounts");
//     return { success: true };
//   } catch (error) {
//     console.error("Error updating account:", error);
//     if (error.code === 11000) {
//       return {
//         success: false,
//         message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است.",
//       };
//     }
//     return {
//       success: false,
//       message: error.message || "خطایی در ویرایش حساب رخ داده است.",
//     };
//   }
// }

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
  