"use server";
// utils/ProductActions.js
import mongoose from 'mongoose';
import connectDB from "@/utils/connectToDB";
import Product from "./Product";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // برای تولید نام‌های یکتا
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";
import { createImageUploader } from "@/utils/ImageUploader";
import { createAccount } from '../Account/accountActions';
import Feature from './Feature';
import { updateAccountBySession } from '../Account/accountActions';

export async function GetAllProducts(shopId) {
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
      const products = await Product.find({ shop: shopId }).select('-__v')
        .populate('shop')
        .lean(); // استفاده از lean() برای دریافت اشیاء ساده  
      return { status: 200, products};
    } catch (error) {
      console.error("Error fetching products:", error);
      return { status: 500, message: 'خطایی در دریافت محصولها رخ داد.' };
    }
  }
/**
 * Server Action برای افزودن محصول با استفاده از createImageUploader
 * @param {FormData} formData - داده‌های فرم شامل اطلاعات محصول و تصاویر
 * @returns {Promise<{ status: number, product?: object, message?: string }>}
 */

export async function AddProductAction(formData) {
  
  await connectDB();

  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.error("Authentication failed:", authError);
  }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // استخراج داده‌ها از فرم دیتا
    const title = formData.get('title');
    const unit = formData.get('unit');
    const ShopId = formData.get('ShopId');
    const pricingTemplate = formData.get('pricingTemplate');
    const parentAccount = formData.get('parentAccount');
    const tags = formData.get('tags')?.split(',').map(tag => tag.trim());
    const storageLocation = formData.get('storageLocation');
    const isSaleable = formData.get('isSaleable') === 'true';
    const isMergeable = formData.get('isMergeable') === 'true';
    const description = formData.get('description');

    // اعتبارسنجی فیلدهای الزامی
    if (!title || !unit || !ShopId) {
      throw new Error('فیلدهای عنوان، واحد و شناسه فروشگاه الزامی هستند.');
    }

    const newImages = formData.getAll('newImages');

    // اعتبارسنجی حداقل و حداکثر تعداد تصاویر
    if (newImages.length === 0) {
      throw new Error('حداقل یک تصویر برای محصول الزامی است.');
    }
    const MAX_FILES = 10;
    if (newImages.length > MAX_FILES) {
      throw new Error(`حداکثر تعداد تصاویر مجاز ${MAX_FILES} است.`);
    }

    const uploadDir = path.join('Uploads', 'Shop', 'images', ShopId, 'Products');

    // آپلود تصاویر
    const uploadPromises = newImages.map(async (file) => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = file.type;
        const size = file.size;
        const imagePath = await createImageUploader({
          buffer,
          uploadDir,
          mimeType,
          size
        });
        return imagePath;
      } catch (uploadError) {
        // می‌توانید اطلاعات بیشتری در مورد خطاها جمع‌آوری کنید
        throw new Error(`خطا در آپلود تصویر: ${file.name}. ${uploadError.message}`);
      }
    });
    // استفاده از Promise.all برای منتظر ماندن تا تمام تصاویر آپلود شوند
    const imagePaths = await Promise.all(uploadPromises);
    // تولید شناسه برای محصول و حساب
    const productId = new mongoose.Types.ObjectId(); // تولید شناسه برای محصول
    const accountId = new mongoose.Types.ObjectId(); // تولید شناسه برای حساب
    // ایجاد محصول جدید
    const newProduct = new Product({
      _id: productId, // تنظیم شناسه محصول از پیش تعیین شده
      accountId: accountId, // ذخیره شناسه حساب در محصول
      images: imagePaths,
      title,
      pricingTemplate,
      unit,
      ShopId,
      tags,
      storageLocation,
      isSaleable,
      isMergeable,
      description,
      parentAccount,
      createdBy: user.id,
      updatedBy: user.id,
    });
    // تجمیع ویژگی‌ها از فرم دیتا
    const Features = [];
    formData.forEach((value, key) => {
      const featureMatch = key.match(/Features\[(\d+)\]\[(featureKey|value)\]/);
      if (featureMatch) {
        const index = parseInt(featureMatch[1], 10);
        const field = featureMatch[2];
        if (!Features[index]) {
          Features[index] = {};
        }
        Features[index][field] = value;
      }
    });
    // اعتبارسنجی و ایجاد اسناد ویژگی
    const featureDocs = [];
    for (const feature of Features) {
      if (!feature.featureKey || !feature.value) {
        throw new Error('تمام ویژگی‌ها باید شامل featureKey و value باشند.');
      }
      const featureDoc = new Feature({
        featureKey: feature.featureKey,
        value: feature.value,
        productId: productId,
        CreatedBy: user.id,
        LastEditedBy: user.id,
      });
      featureDocs.push(featureDoc);
    }
    // ذخیره‌ی تمامی ویژگی‌ها در پایگاه داده
    const savedFeatures = await Feature.insertMany(featureDocs, { session });

    // افزودن شناسه‌های ویژگی به محصول
    newProduct.Features = savedFeatures.map(feature => feature._id);

    // ذخیره محصول با شناسه‌های ویژگی
    await newProduct.save({ session });

    // ایجاد حساب مرتبط
    const accountData = {
      _id: accountId, // تنظیم شناسه حساب از پیش تعیین شده
      title: newProduct.title,
      accountType: "کالا",
      accountStatus: "فعال",
      parentAccount: parentAccount,
      store: ShopId,
      productId: productId, // ذخیره شناسه محصول در حساب
    };

    const accountResult = await createAccount(accountData, session);
    if (!accountResult.success) {
      throw new Error(accountResult.message);
    }

    // تایید تراکنش و پایان نشست
    await session.commitTransaction();
    session.endSession();

    const plainProduct = newProduct.toObject();
    return { status: 201, product: plainProduct };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding product or creating account:", error);

    // بررسی نوع خطا و تعیین وضعیت HTTP مناسب
    if (error.message.includes('آپلود تصویر')) {
      return { status: 400, message: error.message };
    } else if (
      error.message.includes('فیلدهای عنوان، واحد') ||
      error.message.includes('حداقل یک تصویر') ||
      error.message.includes('featureKey') ||
      error.message.includes('value')
    ) {
      return { status: 400, message: error.message };
    } else if (error.code === 11000) { // خطای تکرار کلید اصلی
      return { status: 409, message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است." };
    }
    return { status: 500, message: error.message || 'خطایی در ایجاد محصول یا حساب رخ داد.' };
  }
}


export async function EditProductAction(formData, ShopId) {
  console.log("EditProductAction - formData:", formData);

  await connectDB();

  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.error("Authentication failed:", authError);
  }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  // استخراج شناسه محصول از فرم دیتا
  const productId = formData.get('id');
  if (!productId) {
    return { status: 400, message: 'شناسه محصول الزامی است.' };
  }

  try {
    // بررسی وجود محصول
    const existingProduct = await Product.findById(productId).populate('Features');
    if (!existingProduct) {
      return { status: 404, message: 'محصول یافت نشد.' };
    }

    // شروع نشست تراکنش
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // استخراج و به‌روزرسانی فیلدهای محصول
      const title = formData.get('title');
      const unit = formData.get('unit');
      const pricingTemplate = formData.get('pricingTemplate');
      const parentAccount = formData.get('parentAccount');
      const tags = formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [];
      const storageLocation = formData.get('storageLocation');
      const isSaleable = formData.get('isSaleable') === 'true';
      const isMergeable = formData.get('isMergeable') === 'true';
      const description = formData.get('description');

      // اعتبارسنجی فیلدهای الزامی
      if (!title || !unit) {
        throw new Error('فیلدهای عنوان و واحد الزامی هستند.');
      }

      // مدیریت تصاویر
      const existingImages = existingProduct.images || [];
      const newImages = formData.getAll('newImages'); // تصاویر جدید برای آپلود
      const imagesToRemove = formData.get('imagesToRemove') ? formData.get('imagesToRemove').split(',') : []; // شناسه‌های تصاویر برای حذف

      // اعتبارسنجی تعداد تصاویر
      const MAX_FILES = 10;
      const remainingImagesCount = existingImages.length - imagesToRemove.length + newImages.length;
      if (remainingImagesCount === 0) {
        throw new Error('حداقل یک تصویر برای محصول الزامی است.');
      }
      if (remainingImagesCount > MAX_FILES) {
        throw new Error(`حداکثر تعداد تصاویر مجاز ${MAX_FILES} است.`);
      }

      // آپلود تصاویر جدید
      const uploadDir = path.join('Uploads', 'Shop', 'images', ShopId, 'Products');

      const uploadPromises = newImages.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = file.type;
          const size = file.size;
          const imagePath = await createImageUploader({
            buffer,
            uploadDir,
            mimeType,
            size
          });
          return imagePath;
        } catch (uploadError) {
          throw new Error(`خطا در آپلود تصویر: ${file.name}. ${uploadError.message}`);
        }
      });

      const newImagePaths = await Promise.all(uploadPromises);

      // حذف تصاویر انتخاب شده
      const remainingImages = existingImages.filter(img => !imagesToRemove.includes(img));
      for (const imagePath of imagesToRemove) {
        await deleteImage(imagePath);
      }

      // به‌روزرسانی مسیرهای تصاویر
      const updatedImagePaths = [...remainingImages, ...newImagePaths];

      // استخراج ویژگی‌ها از فرم دیتا به صورت آرایه
      const FeaturesInput = [];
      formData.forEach((value, key) => {
        const featureMatch = key.match(/Features\[(\d+)\]\[(\w+)\]/);
        if (featureMatch) {
          const index = parseInt(featureMatch[1], 10);
          const field = featureMatch[2];
          if (!FeaturesInput[index]) {
            FeaturesInput[index] = {};
          }
          FeaturesInput[index][field] = value;
        }
      });

      // فیلتر و حذف ویژگی‌های خالی
      const filteredFeaturesInput = FeaturesInput.filter(feature => feature && feature.featureKey && feature.value);
      
      // اعتبارسنجی یکتایی featureKey‌ها در داده‌های ورودی
      const featureKeysSet = new Set();
      for (const feature of filteredFeaturesInput) {
        if (featureKeysSet.has(feature.featureKey)) {
          throw new Error(`ویژگی با کلید "${feature.featureKey}" در داده‌های ورودی تکراری است.`);
        }
        featureKeysSet.add(feature.featureKey);
      }

      // حذف تمامی ویژگی‌های موجود برای محصول
      await Feature.deleteMany({ productId: productId }, { session });

      // افزودن ویژگی‌های جدید
      const newFeatures = filteredFeaturesInput.map(feature => ({
        featureKey: feature.featureKey,
        value: feature.value,
        productId: productId,
        CreatedBy: user.id,
        LastEditedBy: user.id,
      }));

      // اعتبارسنجی قبل از افزودن به همان سطح
      // می‌توانید این مرحله را حذف کنید چون ایندکس یکتا در پایگاه‌داده این کار را تضمین می‌کند
      /*
      const uniqueKeys = new Set();
      for (const feature of newFeatures) {
        if (uniqueKeys.has(feature.featureKey)) {
          throw new Error(`ویژگی با کلید "${feature.featureKey}" تکراری است.`);
        }
        uniqueKeys.add(feature.featureKey);
      }
      */

      // افزودن ویژگی‌ها به پایگاه‌داده
      const insertedFeatures = await Feature.insertMany(newFeatures, { session });

      const insertedFeatureIds = insertedFeatures.map(feat => feat._id);

      // به‌روزرسانی محصول
      existingProduct.title = title;
      existingProduct.unit = unit;
      existingProduct.pricingTemplate = pricingTemplate;
      existingProduct.parentAccount = parentAccount;
      existingProduct.tags = tags;
      existingProduct.storageLocation = storageLocation;
      existingProduct.isSaleable = isSaleable;
      existingProduct.isMergeable = isMergeable;
      existingProduct.description = description;
      existingProduct.images = updatedImagePaths;
      existingProduct.Features = insertedFeatureIds;
      existingProduct.updatedBy = user.id;

      await existingProduct.save({ session });

      // به‌روزرسانی حساب مرتبط
      const accountId = existingProduct.accountId;
      if (accountId) {
        const accountData = {
          title: existingProduct.title,
          // به‌روزرسانی سایر فیلدهای حساب در صورت نیاز
        };
        const accountResult = await updateAccountBySession(accountId, accountData, session);
        if (!accountResult.success) {
          throw new Error(accountResult.message);
        }
      }

      // تایید تراکنش و پایان نشست
      await session.commitTransaction();
      session.endSession();

      const plainProduct = await Product.findById(productId).populate('Features').lean();
      return { status: 200, product: plainProduct, message: 'محصول با موفقیت ویرایش شد.' };
    } catch (error) {
      // در صورت بروز خطا، تراکنش را لغو می‌کنیم
      await session.abortTransaction();
      session.endSession();
      console.error("Error editing product or updating account:", error);

      // بررسی نوع خطا و تعیین وضعیت HTTP مناسب
      if (error.message.includes('آپلود تصویر')) {
        return { status: 400, message: error.message };
      } else if (
        error.message.includes('فیلدهای عنوان') ||
        error.message.includes('featureKey') ||
        error.message.includes('value') ||
        error.message.includes('محصول یافت نشد.') ||
        error.message.includes('تکراری')
      ) {
        return { status: 400, message: error.message };
      } else if (error.code === 11000) { // خطای تکرار کلید اصلی
        return { status: 409, message: "ویژگی با این کلید برای محصول وجود دارد." };
      }
      return { status: 500, message: error.message || 'خطایی در ویرایش محصول رخ داد.' };
    }

  } catch (error) {
    console.error("Error in EditProductAction:", error);
    return { status: 500, message: 'خطایی در پردازش درخواست رخ داد.' };
  }
}




  export async function DeleteProducts(productId) {
    await connectDB();
    const user = await authenticateUser();
  
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
  
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId).lean();
      if (!deletedProduct) {
        return { status: 404, message: 'محصول پیدا نشد.' };
      }
      return { status: 200, message: 'محصول با موفقیت حذف شد.' };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { status: 500, message: 'خطایی در حذف محصول رخ داد.' };
    }
  }
  /**
   * فعال‌سازی محصول
   * @param {string} productId - شناسه محصول
   * @returns {Object} - نتیجه عملیات
   */
  export async function EnableProductAction(productId) {
    await connectDB();
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status: 'فعال', updatedBy: user.id },
        { new: true }
      )
        .populate('shop')
        .populate('createdBy')
        .populate('updatedBy')
        .lean();
      if (!updatedProduct) {
        return { status: 404, message: 'محصول پیدا نشد.' };
      }
      const plainProduct = JSON.parse(JSON.stringify(updatedProduct));
      return { status: 200, message: 'محصول فعال شد.', product: plainProduct };
    } catch (error) {
      console.error("Error enabling product:", error);
      return { status: 500, message: 'خطایی در فعال‌سازی محصول رخ داد.' };
    }
  }
  export async function DisableProductAction(productId) {
    await connectDB();
    const user = await authenticateUser();
  
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status: 'غیرفعال', updatedBy: user.id },
        { new: true }
      )
        .populate('shop')
        .populate('createdBy')
        .populate('updatedBy')
        .lean();
  
      if (!updatedProduct) {
        return { status: 404, message: 'محصول پیدا نشد.' };
      }
  
      const plainProduct = JSON.parse(JSON.stringify(updatedProduct));
      return { status: 200, message: 'محصول غیرفعال شد.', product: plainProduct };
    } catch (error) {
      console.error("Error disabling product:", error);
      return { status: 500, message: 'خطایی در غیرفعال‌سازی محصول رخ داد.' };
    }
  }
  