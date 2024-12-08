"use server";
// utils/financialDocumentActions.js
import connectDB from "@/utils/connectToDB";
import FinancialDocument from "./Ledger";
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
 * دریافت تمام اسناد مالی
 * @param {string} shopId - شناسه فروشگاه
 * @returns {Object} - شامل وضعیت و آرایه‌ای از اسناد مالی
 */
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
    const financialDocuments = await FinancialDocument.find({ shop: shopId }).select('-__v')
      .populate('shop')
      .lean(); // استفاده از lean() برای دریافت اشیاء ساده  
    return { status: 200, financialDocuments: convertToPlainObjects(financialDocuments) };
  } catch (error) {
    console.error("Error fetching financialDocuments:", error);
    return { status: 500, message: 'خطایی در دریافت اسناد مالی رخ داد.' };
  }
}
/**
 * افزودن سند مالی جدید
 * @param {FormData} formData - داده‌های فرم
 * @returns {Object} - نتیجه عملیات
 */
export async function AddFinancialDocumentAction(formData) {
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
  const existingFinancialDocument = await FinancialDocument.findOne({ shortName ,shop:ShopId }).lean();
  if (existingFinancialDocument) {
    return { status: 400, message: 'نام اختصاری سند مالی باید منحصر به فرد باشد.' };
  } 
  const existingTitleFinancialDocument = await FinancialDocument.findOne({ title ,shop:ShopId }).lean();
  
  if (existingTitleFinancialDocument) {
    return { status: 400, message: 'نام  سند مالی باید منحصر به فرد باشد.' };
  }
  // ایجاد سند مالی جدید
  const newFinancialDocument = new FinancialDocument({
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
    const savedFinancialDocument = await newFinancialDocument.save();
    const plainFinancialDocument = JSON.parse(JSON.stringify(savedFinancialDocument));
    return { status: 201, financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error adding financialDocument:", error);
    return { status: 500, message: 'خطایی در ایجاد سند مالی رخ داد.' };
  }
}
/**
 * ویرایش سند مالی
 * @param {FormData} formData - داده‌های فرم
 * @param {string} ShopId - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditFinancialDocumentAction(formData, ShopId) {
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
  const financialDocument = await FinancialDocument.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
  if (!financialDocument) {
    return { status: 404, message: 'سند مالی پیدا نشد.' };
  }
  // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
  if (shortName && shortName !== financialDocument.shortName) {
    const existingFinancialDocument = await FinancialDocument.findOne({ shortName }).lean();
    if (existingFinancialDocument) {
      return { status: 400, message: 'نام اختصاری سند مالی باید منحصر به فرد باشد.' };
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
    const updatedFinancialDocument = await FinancialDocument.findByIdAndUpdate(id, updateData, { new: true })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();
    const plainFinancialDocument = JSON.parse(JSON.stringify(updatedFinancialDocument));
    return { status: 200, financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error editing financialDocument:", error);
    return { status: 500, message: 'خطایی در ویرایش سند مالی رخ داد.' };
  }
}

/**
 * حذف سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteFinancialDocuments(financialDocumentId) {
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
    const deletedFinancialDocument = await FinancialDocument.findByIdAndDelete(financialDocumentId).lean();
    if (!deletedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }
    return { status: 200, message: 'سند مالی با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error deleting financialDocument:", error);
    return { status: 500, message: 'خطایی در حذف سند مالی رخ داد.' };
  }
}

/**
 * فعال‌سازی سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function EnableFinancialDocumentAction(financialDocumentId) {
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
    const updatedFinancialDocument = await FinancialDocument.findByIdAndUpdate(
      financialDocumentId,
      { status: 'فعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }

    const plainFinancialDocument = JSON.parse(JSON.stringify(updatedFinancialDocument));
    return { status: 200, message: 'سند مالی فعال شد.', financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error enabling financialDocument:", error);
    return { status: 500, message: 'خطایی در فعال‌سازی سند مالی رخ داد.' };
  }
}

/**
 * غیرفعال‌سازی سند مالی
 * @param {string} financialDocumentId - شناسه سند مالی
 * @returns {Object} - نتیجه عملیات
 */
export async function DisableFinancialDocumentAction(financialDocumentId) {
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
    const updatedFinancialDocument = await FinancialDocument.findByIdAndUpdate(
      financialDocumentId,
      { status: 'غیرفعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedFinancialDocument) {
      return { status: 404, message: 'سند مالی پیدا نشد.' };
    }

    const plainFinancialDocument = JSON.parse(JSON.stringify(updatedFinancialDocument));
    return { status: 200, message: 'سند مالی غیرفعال شد.', financialDocument: plainFinancialDocument };
  } catch (error) {
    console.error("Error disabling financialDocument:", error);
    return { status: 500, message: 'خطایی در غیرفعال‌سازی سند مالی رخ داد.' };
  }
}
