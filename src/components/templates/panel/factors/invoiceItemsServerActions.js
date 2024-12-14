"use server";
// utils/invoiceItemActions.js
import connectDB from "@/utils/connectToDB";
import InvoiceItem from "./InvoiceItem";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
/**
 * تبدیل مستندات Mongoose به اشیاء ساده
 * @param {Array} docs - آرایه‌ای از مستندات
 * @returns {Array} - آرایه‌ای از اشیاء ساده
 */
function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}

/**
 * دریافت تمام ارزها
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - شامل وضعیت و آرایه‌ای از ارزها
 */
export async function GetAllCurrencies(shopId) {
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
    const currencies = await InvoiceItem.find({ shop: shopId }).select('-__v')
      .populate('shop')
      .lean(); // استفاده از lean() برای دریافت اشیاء ساده  
    return { status: 200, currencies: convertToPlainObjects(currencies) };
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return { status: 500, message: 'خطایی در دریافت ارزها رخ داد.' };
  }
}
/**
 * افزودن ارز جدید
 * @param {FormData} formData - داده‌های فرم
 * @returns {Object} - نتیجه عملیات
 */
export async function AddInvoiceItemAction(formData) {
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
  const { title, shortName, exchangeRate, decimalPlaces, status, ShopId } = Object.fromEntries(formData.entries());

  // بررسی یکتایی shortName
  const existingInvoiceItem = await InvoiceItem.findOne({ shortName ,shop:ShopId }).lean();
  
  if (existingInvoiceItem) {
    return { status: 400, message: 'نام اختصاری ارز باید منحصر به فرد باشد.' };
  } 
  const existingTitleInvoiceItem = await InvoiceItem.findOne({ title ,shop:ShopId }).lean();
  
  if (existingTitleInvoiceItem) {
    return { status: 400, message: 'نام  ارز باید منحصر به فرد باشد.' };
  }
  // ایجاد ارز جدید
  const newInvoiceItem = new InvoiceItem({
    title,
    shortName,
    exchangeRate: parseFloat(exchangeRate),
    decimalPlaces: parseInt(decimalPlaces),
    status,
    shop: ShopId,
    createdBy: user.id, // استفاده از _id به جای id
    updatedBy: user.id, // استفاده از _id به جای id
  });
  try {
    const savedInvoiceItem = await newInvoiceItem.save();
    const plainInvoiceItem = JSON.parse(JSON.stringify(savedInvoiceItem));
    return { status: 201, invoiceItem: plainInvoiceItem };
  } catch (error) {
    console.error("Error adding invoiceItem:", error);
    return { status: 500, message: 'خطایی در ایجاد ارز رخ داد.' };
  }
}

/**
 * ویرایش ارز
 * @param {FormData} formData - داده‌های فرم
 * @param {string} ShopId - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditInvoiceItemAction(formData, ShopId) {
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

  const { id, title, shortName, exchangeRate, decimalPlaces, status } = Object.fromEntries(formData.entries());

  const invoiceItem = await InvoiceItem.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
  if (!invoiceItem) {
    return { status: 404, message: 'ارز پیدا نشد.' };
  }

  // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
  if (shortName && shortName !== invoiceItem.shortName) {
    const existingInvoiceItem = await InvoiceItem.findOne({ shortName }).lean();
    if (existingInvoiceItem) {
      return { status: 400, message: 'نام اختصاری ارز باید منحصر به فرد باشد.' };
    }
  }

  // ساخت آبجکت برای به‌روزرسانی
  const updateData = {};
  if (title) updateData.title = title;
  if (shortName) updateData.shortName = shortName;
  if (exchangeRate !== undefined) updateData.exchangeRate = parseFloat(exchangeRate);
  if (decimalPlaces !== undefined) updateData.decimalPlaces = parseInt(decimalPlaces);
  if (status) updateData.status = status;

  if (ShopId) {

    updateData.shop = ShopId;
  }

  updateData.updatedBy = user.id; // بروزرسانی اطلاعات کاربر

  try {
    const updatedInvoiceItem = await InvoiceItem.findByIdAndUpdate(id, updateData, { new: true })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();
    const plainInvoiceItem = JSON.parse(JSON.stringify(updatedInvoiceItem));
    return { status: 200, invoiceItem: plainInvoiceItem };
  } catch (error) {
    console.error("Error editing invoiceItem:", error);
    return { status: 500, message: 'خطایی در ویرایش ارز رخ داد.' };
  }
}

/**
 * حذف ارز
 * @param {string} invoiceItemId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteCurrencies(invoiceItemId) {
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
    const deletedInvoiceItem = await InvoiceItem.findByIdAndDelete(invoiceItemId).lean();
    if (!deletedInvoiceItem) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }
    return { status: 200, message: 'ارز با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error deleting invoiceItem:", error);
    return { status: 500, message: 'خطایی در حذف ارز رخ داد.' };
  }
}

/**
 * فعال‌سازی ارز
 * @param {string} invoiceItemId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function EnableInvoiceItemAction(invoiceItemId) {
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
    const updatedInvoiceItem = await InvoiceItem.findByIdAndUpdate(
      invoiceItemId,
      { status: 'فعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedInvoiceItem) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }

    const plainInvoiceItem = JSON.parse(JSON.stringify(updatedInvoiceItem));
    return { status: 200, message: 'ارز فعال شد.', invoiceItem: plainInvoiceItem };
  } catch (error) {
    console.error("Error enabling invoiceItem:", error);
    return { status: 500, message: 'خطایی در فعال‌سازی ارز رخ داد.' };
  }
}

/**
 * غیرفعال‌سازی ارز
 * @param {string} invoiceItemId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function DisableInvoiceItemAction(invoiceItemId) {
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
    const updatedInvoiceItem = await InvoiceItem.findByIdAndUpdate(
      invoiceItemId,
      { status: 'غیرفعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedInvoiceItem) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }

    const plainInvoiceItem = JSON.parse(JSON.stringify(updatedInvoiceItem));
    return { status: 200, message: 'ارز غیرفعال شد.', invoiceItem: plainInvoiceItem };
  } catch (error) {
    console.error("Error disabling invoiceItem:", error);
    return { status: 500, message: 'خطایی در غیرفعال‌سازی ارز رخ داد.' };
  }
}
