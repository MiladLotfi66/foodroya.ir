"use server";
// utils/contactActions.js
import connectDB from "@/utils/connectToDB";
import Contact from "@/models/Contact";
import { GetShopIdByShopUniqueName, authenticateUser } from "@/components/signinAndLogin/Actions/RolesPermissionActions";

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
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  try {
    const contacts = await Contact.find({ shop: shopId })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
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
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const { 
    name,
    address,
    phoneNumber,
    email,
    nationalId,
    economicCode,
    userAccount,
    shopUniqName 
  } = Object.fromEntries(formData.entries());

  // اعتبارسنجی فیلدهای الزامی
  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
    return { status: 400, message: 'شماره تماس الزامی است و باید بین 10 تا 15 رقم باشد.' };
  }

  // اعتبارسنجی فیلدهای اختیاری
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, message: 'ایمیل باید معتبر باشد.' };
  }

  if (nationalId && !/^\d{10}$/.test(nationalId)) {
    return { status: 400, message: 'شماره ملی باید 10 رقم باشد.' };
  }

  if (economicCode && !/^\d{10}$/.test(economicCode)) {
    return { status: 400, message: 'کد اقتصادی باید 10 رقم باشد.' };
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

  // بررسی یکتایی نام مخاطب
  const existingContact = await Contact.findOne({ name }).lean();
  if (existingContact) {
    return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
  }

  // دریافت shopId از shopUniqueName
  const shopId = await GetShopIdByShopUniqueName(shopUniqName);
  if (!shopId || !shopId.ShopID) {
    return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
  }

  // اضافه کردن shopId به داده‌های مخاطب
  contactData.shop = shopId.ShopID;

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
 * @param {string} shopUniqName - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditContactAction(formData, shopUniqName) {
  await connectDB();
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const { id, title, shortName, exchangeRate, decimalPlaces, status } = Object.fromEntries(formData.entries());

  const contact = await Contact.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
  if (!contact) {
    return { status: 404, message: 'مخاطب پیدا نشد.' };
  }

  // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
  if (shortName && shortName !== contact.shortName) {
    const existingContact = await Contact.findOne({ shortName }).lean();
    if (existingContact) {
      return { status: 400, message: 'نام اختصاری مخاطب باید منحصر به فرد باشد.' };
    }
  }

  // ساخت آبجکت برای به‌روزرسانی
  const updateData = {};
  if (title) updateData.title = title;
  if (shortName) updateData.shortName = shortName;
  if (exchangeRate !== undefined) updateData.exchangeRate = parseFloat(exchangeRate);
  if (decimalPlaces !== undefined) updateData.decimalPlaces = parseInt(decimalPlaces);
  if (status) updateData.status = status;

  if (shopUniqName) {
    const shopId = await GetShopIdByShopUniqueName(shopUniqName);
    if (!shopId || !shopId.ShopID) {
      return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
    }
    updateData.shop = shopId.ShopID;
  }

  updateData.updatedBy = user.id; // بروزرسانی اطلاعات کاربر

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();
    const plainContact = JSON.parse(JSON.stringify(updatedContact));
    return { status: 200, contact: plainContact };
  } catch (error) {
    console.error("Error editing contact:", error);
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
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId).lean();
    if (!deletedContact) {
      return { status: 404, message: 'مخاطب پیدا نشد.' };
    }
    return { status: 200, message: 'مخاطب با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { status: 500, message: 'خطایی در حذف مخاطب رخ داد.' };
  }
}

/**
 * فعال‌سازی مخاطب
 * @param {string} contactId - شناسه مخاطب
 * @returns {Object} - نتیجه عملیات
 */
export async function EnableContactAction(contactId) {
  await connectDB();
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { status: 'فعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedContact) {
      return { status: 404, message: 'مخاطب پیدا نشد.' };
    }

    const plainContact = JSON.parse(JSON.stringify(updatedContact));
    return { status: 200, message: 'مخاطب فعال شد.', contact: plainContact };
  } catch (error) {
    console.error("Error enabling contact:", error);
    return { status: 500, message: 'خطایی در فعال‌سازی مخاطب رخ داد.' };
  }
}

/**
 * غیرفعال‌سازی مخاطب
 * @param {string} contactId - شناسه مخاطب
 * @returns {Object} - نتیجه عملیات
 */
export async function DisableContactAction(contactId) {
  await connectDB();
  const user = await authenticateUser();

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { status: 'غیرفعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedContact) {
      return { status: 404, message: 'مخاطب پیدا نشد.' };
    }

    const plainContact = JSON.parse(JSON.stringify(updatedContact));
    return { status: 200, message: 'مخاطب غیرفعال شد.', contact: plainContact };
  } catch (error) {
    console.error("Error disabling contact:", error);
    return { status: 500, message: 'خطایی در غیرفعال‌سازی مخاطب رخ داد.' };
  }
}
