"use server";

import connectDB from "@/utils/connectToDB";
import PriceTemplate from "./PriceTemplate";
// import { GetShopIdByShopUniqueName, authenticateUser } from "./RolesPermissionActions";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";
function convertToPlainObjects(docs) {
    return docs.map(doc => JSON.parse(JSON.stringify(doc)));
  }
  
export async function GetAllPriceTemplates(shopId) {
    console.log("-----shopId---->",shopId);
    
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
    try {
      const PriceTemplates = await PriceTemplate.find({ shop: shopId }).select('-__v')
        .populate('shop')
        .lean(); // استفاده از lean() برای دریافت اشیاء ساده  
      return { status: 200, PriceTemplates: convertToPlainObjects(PriceTemplates) };
    } catch (error) {
      console.error("Error fetching PriceTemplates:", error);
      return { status: 500, message: 'خطایی در دریافت ارزها رخ داد.' };
    }
  }

  export async function AddPriceTemplateAction(formData) {
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
    const { title, shortName, exchangeRate, decimalPlaces, status, shopUniqName } = Object.fromEntries(formData.entries());
    // دریافت shopId از shopUniqueName
    const shopId = await GetShopIdByShopUniqueName(shopUniqName);
    if (!shopId || !shopId.ShopID) {
      return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
    }
  
    // بررسی یکتایی shortName
    const existingPriceTemplate = await PriceTemplate.findOne({ shortName ,shop:shopId.ShopID }).lean();
    
    if (existingPriceTemplate) {
      return { status: 400, message: 'نام اختصاری قالب قیمتی باید منحصر به فرد باشد.' };
    } 
    const existingTitlePriceTemplate = await PriceTemplate.findOne({ title ,shop:shopId.ShopID }).lean();
    
    if (existingTitlePriceTemplate) {
      return { status: 400, message: 'نام  قالب قیمتی باید منحصر به فرد باشد.' };
    }
    // ایجاد ارز جدید
    const newPriceTemplate = new PriceTemplate({
      title,
      shortName,
      exchangeRate: parseFloat(exchangeRate),
      decimalPlaces: parseInt(decimalPlaces),
      status,
      shop: shopId.ShopID,
      createdBy: user.id, // استفاده از _id به جای id
      updatedBy: user.id, // استفاده از _id به جای id
    });
    try {
      const savedPriceTemplate = await newPriceTemplate.save();
      const plainPriceTemplate = JSON.parse(JSON.stringify(savedPriceTemplate));
      return { status: 201, PriceTemplate: plainPriceTemplate };
    } catch (error) {
      console.error("Error adding PriceTemplate:", error);
      return { status: 500, message: 'خطایی در ایجاد ارز رخ داد.' };
    }
  }

  export async function EditPriceTemplateAction(formData, shopUniqName) {
    await connectDB();
    const user = await authenticateUser();
  
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
  
    const { id, title, shortName, exchangeRate, decimalPlaces, status } = Object.fromEntries(formData.entries());
  
    const PriceTemplate = await PriceTemplate.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
    if (!currency) {
      return { status: 404, message: 'ارز پیدا نشد.' };
    }
  
    // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
    if (shortName && shortName !== PriceTemplate.shortName) {
      const existingPriceTemplate = await PriceTemplate.findOne({ shortName }).lean();
      if (existingPriceTemplate) {
        return { status: 400, message: 'نام اختصاری قالب قیمتی باید منحصر به فرد باشد.' };
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

  export async function DeletePriceTemplates(priceTemplateId) {
    await connectDB();
    const user = await authenticateUser();
  
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
  
    try {
      const deletedPriceTemplate = await PriceTemplate.findByIdAndDelete(priceTemplateId).lean();
      if (!deletedPriceTemplate) {
        return { status: 404, message: 'ارز پیدا نشد.' };
      }
      return { status: 200, message: 'ارز با موفقیت حذف شد.' };
    } catch (error) {
      console.error("Error deleting priceTemplate:", error);
      return { status: 500, message: 'خطایی در حذف ارز رخ داد.' };
    }
  }