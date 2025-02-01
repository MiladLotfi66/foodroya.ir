"use server";
// utils/FeatureKeyActions.js
import connectDB from "@/utils/connectToDB";
import FeatureKey from "./FeatureKey";
import Feature from "./Feature";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
// تابعی برای تبدیل داده‌ها به شیء ساده


export async function GetAllFeatureKeys(search) {

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
    // اگر پارامتر جستجو موجود باشد، فیلتر بر اساس آن اعمال می‌شود
    let featureKeys;
    if (search) {
      const regex = new RegExp(search, 'i'); // جستجوی غیر حساس به حروف بزرگ و کوچک
      featureKeys = await FeatureKey.find({ name: { $regex: regex } }).select('-__v -CreatedBy -createdAt' ).lean();
    } else {
      featureKeys = await FeatureKey.find().select('-__v -createdAt -CreatedBy').lean();
    }
    const serializedFeatureKeys = featureKeys.map(featureKey => ({
        _id: featureKey._id.toString(),
        name: featureKey.name,
      }));
  
      

    return { status: 200, featureKeys: serializedFeatureKeys };

  } catch (error) {
    console.error("Error fetching featureKeys:", error);
    return { status: 500, message: 'خطایی در دریافت تگ‌ها رخ داد.' };
  }
}

export async function AddFeatureKeyAction(name) {
    
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



  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { status: 400, message: 'نام ویژگی نامعتبر است.' };
  }

  try {
    // بررسی یکتایی نام تگ
    const existingFeatureKey = await FeatureKey.findOne({ name: name.trim() }).lean();
    if (existingFeatureKey) {
      return { status: 400, message: 'نام تگ باید منحصر به فرد باشد.' };
    }

    // ایجاد تگ جدید
    const newFeatureKey = new FeatureKey({
      name: name.trim(),
    });

    const savedFeatureKey = await newFeatureKey.save();
    const plainFeatureKey = JSON.parse(JSON.stringify(savedFeatureKey));

    return { status: 201, featureKey: plainFeatureKey };
  } catch (error) {
    console.error("Error adding featureKey:", error);
    return { status: 500, message: 'خطایی در ایجاد تگ رخ داد.' };
  }
}

export async function GetAllProductFeature(productId) {

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
    // اگر پارامتر جستجو موجود باشد، فیلتر بر اساس آن اعمال می‌شود
  
     const features = await Feature.find(productId).select('-__v -CreatedBy -LastEditedBy').lean();
    
    const serializedFeatureKeys = features.map(feature => ({
        featureKey: feature.featureKey.toString(),
        value:feature.value
      }));
  
      

    return { status: 200, features: serializedFeatureKeys };

  } catch (error) {
    console.error("Error fetching featureKeys:", error);
    return { status: 500, message: 'خطایی در دریافت تگ‌ها رخ داد.' };
  }
}
