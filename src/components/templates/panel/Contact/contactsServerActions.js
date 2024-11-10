"use server";
// utils/contactActions.js
import connectDB from "@/utils/connectToDB";
import Contact from "./Contact";
import Account from "@/models/Account";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";

import mongoose from "mongoose";
import { p2e } from "@/utils/ReplaceNumber";
/**
 * تبدیل مستندات Mongoose به اشیاء ساده
 * @param {Array} docs - آرایه‌ای از مستندات
 * @returns {Array} - آرایه‌ای از اشیاء ساده
 */
function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}

/**
 * دریافت تمام مخاطبها
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - شامل وضعیت و آرایه‌ای از مخاطبها
 */
export async function GetAllContacts(shopId) {
  
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
    const contacts = await Contact.find({ shop: shopId })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('userAccount')
      .lean(); // استفاده از lean() برای دریافت اشیاء ساده

    return { status: 200, contacts: convertToPlainObjects(contacts) };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { status: 500, message: 'خطایی در دریافت مخاطبها رخ داد.' };
  }
}

/**
 * افزودن مخاطب جدید
 * @param {FormData} formData - داده‌های فرم
 * @returns {Object} - نتیجه عملیات
 */
export async function AddContactAction(formData) {
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


  let { 
    name,
    address,
    phoneNumber,
    email,
    nationalId,
    economicCode,
    userAccount,
    ShopId 
  } = Object.fromEntries(formData.entries());

  // اعتبارسنجی فیلدهای الزامی
  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
    return { status: 400, message: 'شماره تماس الزامی است و باید بین 10 تا 15 رقم باشد.' };
  }

  // اعتبارسنجی فیلدهای اختیاری
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, message: 'ایمیل باید معتبر باشد.' };
  }

  if (nationalId) {
    nationalId = p2e(nationalId);
    if (!/^\d{10}$/.test(nationalId)) {
      return { status: 400, message: 'شماره ملی باید 10 رقم باشد.' };
    }
  }
  console.log("111111");
  
  if (economicCode) {
    economicCode = p2e(economicCode);
    if (!/^\d{10}$/.test(economicCode)) {
      return { status: 400, message: 'کد اقتصادی باید 10 رقم باشد.' };
    }
  }

  // اعتبارسنجی userAccount در صورت نیاز
  if (userAccount && !mongoose.Types.ObjectId.isValid(userAccount)) {
    return { status: 400, message: 'حساب کاربری نامعتبر است.' };
  }


  const createdBy = user.id;
  const updatedBy = user.id;

  // پاک‌سازی فیلدهای خالی
  const contactData = {
    name,
    address: address || undefined,
    phone: phoneNumber,
    email: email || undefined,
    nationalId: nationalId || undefined,
    economicCode: economicCode || undefined,
    userAccount: userAccount || undefined,
    createdBy,
    updatedBy,
  };
  console.log("۲۲۲۲۲");


  // بررسی یکتایی نام مخاطب
  const existingContact = await Contact.findOne({ name  , shop : ShopId}).lean();
  if (existingContact) {
    return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
  }

  // اضافه کردن shopId به داده‌های مخاطب
  contactData.shop = ShopId;

  try {
    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();

    const plainContact = JSON.parse(JSON.stringify(savedContact));
    return { status: 201, contact: plainContact };
  } catch (error) {
    console.error("Error adding contact:", error);
    return { status: 500, message: 'خطایی در ایجاد مخاطب رخ داد.' };
  }
}


/**
 * ویرایش مخاطب
 * @param {FormData} formData - داده‌های فرم
 * @param {string} ShopId - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditContactAction(formData) {
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
  
  let { 
    id,
    name,
    address,
    phoneNumber,
    email,
    nationalId,
    economicCode,
    userAccount,
    ShopId 
  } = Object.fromEntries(formData.entries());

  // اعتبارسنجی فیلدهای الزامی
  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
    return { status: 400, message: 'شماره تماس الزامی است و باید بین 10 تا 15 رقم باشد.' };
  }

  // اعتبارسنجی فیلدهای اختیاری
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, message: 'ایمیل باید معتبر باشد.' };
  }

  if (nationalId) {
    nationalId = p2e(nationalId);
    if (!/^\d{10}$/.test(nationalId)) {
      return { status: 400, message: 'شماره ملی باید 10 رقم باشد.' };
    }
  }
  
  if (economicCode) {
    economicCode = p2e(economicCode);
    if (!/^\d{10}$/.test(economicCode)) {
      return { status: 400, message: 'کد اقتصادی باید 10 رقم باشد.' };
    }
  }

  // اعتبارسنجی userAccount در صورت نیاز
  if (userAccount && !mongoose.Types.ObjectId.isValid(userAccount)) {
    return { status: 400, message: 'حساب کاربری نامعتبر است.' };
  }

  // یافتن مخاطب موجود
  const existingContact = await Contact.findById(id);
  if (!existingContact) {
    return { status: 404, message: 'مخاطب پیدا نشد.' };
  }

  // بررسی یکتایی نام مخاطب اگر تغییر کرده باشد
  if (name && name !== existingContact.name) {
    const contactWithName = await Contact.findOne({ name }).lean();
    if (contactWithName) {
      return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
    }
  }

  // بررسی یکتایی nationalId اگر تغییر کرده باشد
  if (nationalId && nationalId !== existingContact.nationalId) {
    const contactWithNationalId = await Contact.findOne({ nationalId }).lean();
    if (contactWithNationalId) {
      return { status: 400, message: 'شماره ملی باید منحصر به فرد باشد.' };
    }
  }

  // دریافت shopId از shopUniqueName
  let shopId;
  if (ShopId) {
 
    shopId = ShopId;
  } else {
    shopId = existingContact.shop;
  }

  // آماده‌سازی داده‌های آپدیت
  const updateData = {
    name: name || existingContact.name,
    address: address || existingContact.address,
    phone: phoneNumber,
    email: email !== undefined ? email : existingContact.email,
    nationalId: nationalId !== undefined ? nationalId : existingContact.nationalId,
    economicCode: economicCode !== undefined ? economicCode : existingContact.economicCode,
    userAccount: userAccount !== undefined ? userAccount : existingContact.userAccount,
    shop: shopId,
    updatedBy: user.id,
  };

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('userAccount')
      .lean();

    const plainContact = convertToPlainObjects([updatedContact])[0];

    return { status: 200, contact: plainContact };

  } catch (error) {
    console.error("Error editing contact:", error);
    if (error.code === 11000) { // خطای Duplicate Key
      if (error.keyPattern.name) {
        return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
      }
      if (error.keyPattern.nationalId) {
        return { status: 400, message: 'شماره ملی باید منحصر به فرد باشد.' };
      }
    }
    return { status: 500, message: 'خطایی در ویرایش مخاطب رخ داد.' };
  }
}


/**
 * حذف مخاطب
 * @param {string} contactId - شناسه مخاطب
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteContacts(contactId) {
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

/////////////////////////////
const session = await mongoose.startSession();
session.startTransaction();
try {
  // بررسی وابستگی‌ها
  const linkedAccount = await Account.findOne({ contact: contactId }).session(session).exec();
  if (linkedAccount) {
    return { status: 500, message: 'این مخاطب در حساب‌ها استفاده شده است و قابل حذف نیست.' };
  }

  // حذف مخاطب
  const result = await Contact.findOneAndDelete({ _id: contactId }).session(session).exec();
  if (!result) {
    return { status: 404, message: 'مخاطب یافت نشد.' };
  }

  // تایید تراکنش
  await session.commitTransaction();
  session.endSession();
  return { status: 200, message: 'مخاطب با موفقیت حذف شد.' };
} catch (error) {
  // بازگرداندن تراکنش در صورت خطا
  await session.abortTransaction();
  session.endSession();
  console.error('خطا در حذف مخاطب:', error.message);
}
}


