"use server";
// utils/ProductActions.js
import connectDB from "@/utils/connectToDB";
import Product from "./Product";
import { GetShopIdByShopUniqueName } from "@/components/signinAndLogin/Actions/RolesPermissionActions";
import { authenticateUser } from "@/components/signinAndLogin/Actions/ShopServerActions";

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
      return { status: 200, products: convertToPlainObjects(products) };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { status: 500, message: 'خطایی در دریافت محصولها رخ داد.' };
    }
  }

  export async function AddProductAction(formData) {
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
  
    const { title, shortName, exchangeRate, decimalPlaces, status, shopUniqName } = Object.fromEntries(formData.entries());
    // دریافت shopId از shopUniqueName
    const shopId = await GetShopIdByShopUniqueName(shopUniqName);
    if (!shopId || !shopId.ShopID) {
      return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
    }
  
    // بررسی یکتایی shortName
    const existingProduct = await Product.findOne({ shortName ,shop:shopId.ShopID }).lean();
    
    if (existingProduct) {
      return { status: 400, message: 'نام اختصاری محصول باید منحصر به فرد باشد.' };
    } 
    const existingTitleProduct = await Product.findOne({ title ,shop:shopId.ShopID }).lean();
    
    if (existingTitleProduct) {
      return { status: 400, message: 'نام  محصول باید منحصر به فرد باشد.' };
    }
    // ایجاد محصول جدید
    const newProduct = new Product({
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
      const savedProduct = await newProduct.save();
      const plainProduct = JSON.parse(JSON.stringify(savedProduct));
      return { status: 201, product: plainProduct };
    } catch (error) {
      console.error("Error adding product:", error);
      return { status: 500, message: 'خطایی در ایجاد محصول رخ داد.' };
    }
  }
  

  export async function EditProductAction(formData, shopUniqName) {
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
  
    if (shopUniqName) {
      const shopId = await GetShopIdByShopUniqueName(shopUniqName);
      if (!shopId || !shopId.ShopID) {
        return { status: 404, message: 'فروشگاه انتخاب شده وجود ندارد.' };
      }
      updateData.shop = shopId.ShopID;
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
      return { status: 500, message: 'خطایی در ویرایش محصول رخ داد.' };
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
  