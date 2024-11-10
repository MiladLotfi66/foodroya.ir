"use server";
// utils/currencyActions.js
import connectDB from "@/utils/connectToDB";
import Currency from "@/models/Currency";
import { GetShopIdByShopUniqueName } from "./RolesPermissionActions";
import { authenticateUser } from "./ShopServerActions";

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
    const currencies = await Currency.find({ shop: shopId }).select('-__v')
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
export async function AddCurrencyAction(formData) {
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
  const existingCurrency = await Currency.findOne({ shortName ,shop:ShopId }).lean();
  
  if (existingCurrency) {
    return { status: 400, message: 'نام اختصاری ارز باید منحصر به فرد باشد.' };
  } 
  const existingTitleCurrency = await Currency.findOne({ title ,shop:ShopId }).lean();
  
  if (existingTitleCurrency) {
    return { status: 400, message: 'نام  ارز باید منحصر به فرد باشد.' };
  }
  // ایجاد ارز جدید
  const newCurrency = new Currency({
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
    const savedCurrency = await newCurrency.save();
    const plainCurrency = JSON.parse(JSON.stringify(savedCurrency));
    return { status: 201, currency: plainCurrency };
  } catch (error) {
    console.error("Error adding currency:", error);
    return { status: 500, message: 'خطایی در ایجاد ارز رخ داد.' };
  }
}

/**
 * ویرایش ارز
 * @param {FormData} formData - داده‌های فرم
 * @param {string} ShopId - نام یکتا فروشگاه
 * @returns {Object} - نتیجه عملیات
 */
export async function EditCurrencyAction(formData, ShopId) {
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

  const currency = await Currency.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
  if (!currency) {
    return { status: 404, message: 'ارز پیدا نشد.' };
  }

  // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
  if (shortName && shortName !== currency.shortName) {
    const existingCurrency = await Currency.findOne({ shortName }).lean();
    if (existingCurrency) {
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
    const updatedCurrency = await Currency.findByIdAndUpdate(id, updateData, { new: true })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();
    const plainCurrency = JSON.parse(JSON.stringify(updatedCurrency));
    return { status: 200, currency: plainCurrency };
  } catch (error) {
    console.error("Error editing currency:", error);
    return { status: 500, message: 'خطایی در ویرایش ارز رخ داد.' };
  }
}

/**
 * حذف ارز
 * @param {string} currencyId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function DeleteCurrencies(currencyId) {
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
    const deletedCurrency = await Currency.findByIdAndDelete(currencyId).lean();
    if (!deletedCurrency) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }
    return { status: 200, message: 'ارز با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error deleting currency:", error);
    return { status: 500, message: 'خطایی در حذف ارز رخ داد.' };
  }
}

/**
 * فعال‌سازی ارز
 * @param {string} currencyId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function EnableCurrencyAction(currencyId) {
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
    const updatedCurrency = await Currency.findByIdAndUpdate(
      currencyId,
      { status: 'فعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedCurrency) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }

    const plainCurrency = JSON.parse(JSON.stringify(updatedCurrency));
    return { status: 200, message: 'ارز فعال شد.', currency: plainCurrency };
  } catch (error) {
    console.error("Error enabling currency:", error);
    return { status: 500, message: 'خطایی در فعال‌سازی ارز رخ داد.' };
  }
}

/**
 * غیرفعال‌سازی ارز
 * @param {string} currencyId - شناسه ارز
 * @returns {Object} - نتیجه عملیات
 */
export async function DisableCurrencyAction(currencyId) {
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
    const updatedCurrency = await Currency.findByIdAndUpdate(
      currencyId,
      { status: 'غیرفعال', updatedBy: user.id },
      { new: true }
    )
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .lean();

    if (!updatedCurrency) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }

    const plainCurrency = JSON.parse(JSON.stringify(updatedCurrency));
    return { status: 200, message: 'ارز غیرفعال شد.', currency: plainCurrency };
  } catch (error) {
    console.error("Error disabling currency:", error);
    return { status: 500, message: 'خطایی در غیرفعال‌سازی ارز رخ داد.' };
  }
}
