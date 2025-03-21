"use server";

import connectDB from "@/utils/connectToDB";
import PriceTemplate from "./PriceTemplate";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import mongoose from 'mongoose';
import { CheckUserPermissionInShop } from "../rols/RolesPermissionActions";
import Product from "../Product/Product";




function convertToPlainObjects(docs) {
    return docs.map(doc => JSON.parse(JSON.stringify(doc)));
  }
  
export async function GetAllPriceTemplates(ShopId) {

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
      const PriceTemplates = await PriceTemplate.find({ shop: ShopId }).select('-__v')
        // .populate('shop')
        .lean(); // استفاده از lean() برای دریافت اشیاء ساده  

      return { status: 200, PriceTemplates: convertToPlainObjects(PriceTemplates) };
    } catch (error) {
      console.error("Error fetching PriceTemplates:", error);
      return { status: 500, message: 'خطایی در دریافت ارزها رخ داد.' };
    }
  }

  export async function AddPriceTemplateAction(formData) {

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
  

    // const formData = {};
    // for (const [key, value] of Object.entries(formDataObject)) {
    //     formData[key] = value;
    // }
    
    const { title, defaultFormula, status, pricingFormulas,ShopId } = formData

    const hasAccess=await CheckUserPermissionInShop(ShopId,"priceTemplatesPermissions","add")
    if (!hasAccess.hasPermission) {
       return { status: 401, message: 'شما دسترسی لازم را ندارید' };
     } 


    // بررسی یکتایی عنوان
    const existingTitlePriceTemplate = await PriceTemplate.findOne({ title, shop:ShopId }).lean();
    if (existingTitlePriceTemplate) {
        return { status: 400, message: 'نام قالب قیمتی باید منحصر به فرد باشد.' };
    }

    // ایجاد قالب جدید
    const newPriceTemplate = new PriceTemplate({
        title,
        status: status || 'فعال', // مقدار پیش‌فرض
        shop: ShopId,
        createdBy: user.id,
        updatedBy: user.id,
        defaultFormula,
        pricingFormulas: formData.pricingFormulas // به صورت پیش‌فرض، فرمول‌های قیمت خالی است
    });

    try {
        const savedPriceTemplate = await newPriceTemplate.save();
        const plainPriceTemplate = JSON.parse(JSON.stringify(savedPriceTemplate));
        return { status: 201, PriceTemplate: plainPriceTemplate };
    } catch (error) {
        console.error("Error adding PriceTemplate:", error);
        return { status: 500, message: 'خطایی در ایجاد قالب قیمتی رخ داد.' };
    }
}


export async function EditPriceTemplateAction(formData, id) {
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



  const { title, defaultFormula, status, pricingFormulas } = formData

  const priceTemplate = await PriceTemplate.findById(id).lean();
  if (!priceTemplate) {
      return { status: 404, message: 'قالب قیمتی پیدا نشد.' };
  }
  const hasAccess=await CheckUserPermissionInShop(priceTemplate.shop,"priceTemplatesPermissions","edit")
  if (!hasAccess.hasPermission) {
     return { status: 401, message: 'شما دسترسی لازم را ندارید' };
   } 


  // ساخت آبجکت برای به‌روزرسانی
  const updateData = {};
  if (title) updateData.title = title;
  if (status) updateData.status = status;
  if (defaultFormula) updateData.defaultFormula = defaultFormula;
  if (pricingFormulas) updateData.pricingFormulas = pricingFormulas;
  updateData.updatedBy = user.id; // بروزرسانی اطلاعات کاربر

  try {
      const updatedPriceTemplate = await PriceTemplate.findByIdAndUpdate(id, updateData, { new: true })
          .lean();
      const plainPriceTemplate = JSON.parse(JSON.stringify(updatedPriceTemplate));
      return { status: 200, PriceTemplate: plainPriceTemplate };
  } catch (error) {
      console.error("Error editing PriceTemplate:", error);
      return { status: 500, message: 'خطایی در ویرایش قالب قیمتی رخ داد.' };
  }
}


export async function DeletePriceTemplates(priceTemplateId) {
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
const priceTemplate = await PriceTemplate.findById(priceTemplateId).lean();
if (!priceTemplate) {
    return { status: 404, message: 'قالب قیمتی پیدا نشد.' };
}

const hasAccess=await CheckUserPermissionInShop(priceTemplate.shop,"priceTemplatesPermissions","delete")
if (!hasAccess.hasPermission) {
   return { status: 401, message: 'شما دسترسی لازم را ندارید' };
 } 

    // جستجوی محصولاتی که از این قالب قیمتی استفاده می‌کنند
    const productsUsingTemplate = await Product.find({
      ShopId: priceTemplate.shop,
      pricingTemplate: priceTemplateId
    }).select('title _id').lean();
    
    console.log(`Found ${productsUsingTemplate.length} products using this price template.`);
    
    // اگر محصولی از این قالب استفاده می‌کند، اجازه حذف نمی‌دهیم
    if (productsUsingTemplate.length > 0) {
      // حداکثر 5 محصول را نمایش می‌دهیم
      const productTitles = productsUsingTemplate
        .slice(0, 5)
        .map(product => product.title)
        .join('، ');
      
      const additionalText = productsUsingTemplate.length > 5 
        ? ` و ${productsUsingTemplate.length - 5} محصول دیگر` 
        : '';
        
      return { 
        status: 409, 
        message: `این قالب قیمتی در محصولات زیر استفاده شده است و قابل حذف نیست: ${productTitles}${additionalText}` 
      };
    }


  try {
      const deletedPriceTemplate = await PriceTemplate.findByIdAndDelete(priceTemplateId).lean();
      if (!deletedPriceTemplate) {
          return { status: 404, message: 'قالب قیمتی پیدا نشد.' };
      }

      return { status: 200, message: 'قالب قیمتی با موفقیت حذف شد.' };
  } catch (error) {
      console.error("Error deleting PriceTemplate:", error);
      return { status: 500, message: 'خطایی در حذف قالب قیمتی رخ داد.' };
  }
}
