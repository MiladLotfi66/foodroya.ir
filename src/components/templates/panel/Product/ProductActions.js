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
  console.log("formData---------->",formData);
  
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

    const productId = new mongoose.Types.ObjectId(); // تولید شناسه برای محصول
    const accountId = new mongoose.Types.ObjectId(); // تولید شناسه برای حساب

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

    await newProduct.save({ session });

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
    } else if (error.message.includes('فیلدهای عنوان، واحد') || error.message.includes('حداقل یک تصویر')) {
      return { status: 400, message: error.message };
    } else if (error.code === 11000) { // خطای تکرار کلید اصلی
      return { status: 409, message: "کدینگ حساب در این فروشگاه قبلاً استفاده شده است." };
    }
    return { status: 500, message: error.message || 'خطایی در ایجاد محصول یا حساب رخ داد.' };
  }
}

  export async function EditProductAction(formData, ShopId) {
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
  
    const product = await Product.findById(id).populate('shop').populate('createdBy').populate('updatedBy').lean();
    if (!product) {
      return { status: 404, message: 'محصول پیدا نشد.' };
    }
  
    // بررسی یکتایی shortName در صورتی که تغییر کرده باشد
    if (shortName && shortName !== product.shortName) {
      const existingProduct = await Product.findOne({ shortName }).lean();
      if (existingProduct) {
        return { status: 400, message: 'نام اختصاری محصول باید منحصر به فرد باشد.' };
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
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
        .populate('shop')
        .populate('createdBy')
        .populate('updatedBy')
        .lean();
      const plainProduct = JSON.parse(JSON.stringify(updatedProduct));
      return { status: 200, product: plainProduct };
    } catch (error) {
      console.error("Error editing product:", error);
      return { status: 500, message:error|| 'خطایی در ویرایش محصول رخ داد.' };
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
  