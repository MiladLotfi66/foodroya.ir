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
    console.log("formData", formData);

    await connectDB();
    const user = await authenticateUser();
    if (!user) {
        return { status: 401, message: 'کاربر وارد نشده است.'};
    }

    // const formData = {};
    // for (const [key, value] of Object.entries(formDataObject)) {
    //     formData[key] = value;
    // }
    
    const { title, defaultFormula, status, shopUniqName, pricingFormulas } = formData

    // دریافت shopId از shopUniqueName
    const shopId = await GetShopIdByShopUniqueName(shopUniqName);
    if (!shopId || !shopId.ShopID) {
        return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
    }

    // بررسی یکتایی عنوان
    const existingTitlePriceTemplate = await PriceTemplate.findOne({ title, shop: shopId.ShopID }).lean();
    if (existingTitlePriceTemplate) {
        return { status: 400, message: 'نام قالب قیمتی باید منحصر به فرد باشد.' };
    }

    // ایجاد قالب جدید
    const newPriceTemplate = new PriceTemplate({
        title,
        status: status || 'فعال', // مقدار پیش‌فرض
        shop: shopId.ShopID,
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
  const user = await authenticateUser();

  if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  const { title, defaultFormula, status, pricingFormulas } = formData

  const priceTemplate = await PriceTemplate.findById(id).lean();
  if (!priceTemplate) {
      return { status: 404, message: 'قالب قیمتی پیدا نشد.' };
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
  const user = await authenticateUser();

  if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
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
