"use server";

import shops from "@/models/shops";
import connectDB from "@/utils/connectToDB";
import fs from "fs";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";

async function ShopServerEnableActions(ShopID) {
  try {
    await connectDB(); // اتصال به دیتابیس

    // یافتن فروشگاه با استفاده از ShopID
    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      // اگر فروشگاه پیدا نشد، پرتاب خطا
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    // تغییر وضعیت فروشگاه به true
    Shop.ShopStatus = true;

    // ذخیره کردن تغییرات در دیتابیس
    await Shop.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت فروشگاه با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    throw new Error("خطای سرور، تغییر وضعیت فروشگاه انجام نشد");
  }
}
async function ShopServerDisableActions(ShopID) {
  try {
    await connectDB(); // اتصال به دیتابیس

    // یافتن فروشگاه با استفاده از ShopID
    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      // اگر فروشگاه پیدا نشد، پرتاب خطا
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    // تغییر وضعیت فروشگاه به true
    Shop.ShopStatus = false;

    // ذخیره کردن تغییرات در دیتابیس
    await Shop.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت فروشگاه با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    throw new Error("خطای سرور، تغییر وضعیت فروشگاه انجام نشد");
  }
}
async function GetAllShops() {
  try {
    await connectDB();

    // واکشی تمام اطلاعات فروشگاهها از دیتابیس
    const Shops = await shops.find({}).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

    // تبدیل اشیاء به plain objects
    const plainShops = Shops.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(), // تبدیل ObjectId به رشته
      createdAt: Shop.createdAt.toISOString(), // تبدیل Date به رشته
      updatedAt: Shop.updatedAt.toISOString(), // تبدیل Date به رشته
    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    throw new Error("خطای سرور، تغییر وضعیت فروشگاه انجام نشد");
  }
}

async function GetAllEnableShops() {
  try {
    await connectDB();

    // واکشی تمام اطلاعات فروشگاهها از دیتابیس
    const Shops = await shops.find({ ShopStatus: true }).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

    // تبدیل اشیاء به plain objects
    const plainShops = Shops.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(), // تبدیل ObjectId به رشته
      createdAt: Shop.createdAt.toISOString(), // تبدیل Date به رشته
      updatedAt: Shop.updatedAt.toISOString(), // تبدیل Date به رشته
    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    throw new Error("خطای سرور، تغییر وضعیت فروشگاه انجام نشد");
  }
}
async function DeleteShops(ShopID) {
  try {
    await connectDB();
    console.log("ShopID",ShopID);

    // یافتن فروشگاه با استفاده از ShopID
    const Shop = await shops.findById(ShopID);
    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    // مسیر فایل تصویر فروشگاه
    const LogoUrl = path.join(process.cwd(), "public", Shop.LogoUrl);
    const TextLogoUrl = path.join(process.cwd(), "public", Shop.TextLogoUrl);
    const BackGroundShopUrl = path.join(process.cwd(), "public", Shop.BackGroundShopUrl);
    const BackGroundpanelUrl = path.join(process.cwd(), "public", Shop.BackGroundpanelUrl);

    // حذف  فروشگاه از دیتابیس
    const result = await Shop.deleteOne({ _id: ShopID });
    if (result.deletedCount === 0) {
      throw new Error("فروشگاه مورد نظر حذف نشد");
    }

    // حذف فایل لوگو فروشگاه
    fs.unlink(LogoUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    }); 
     // حذف فایل لوگو متنی فروشگاه
    fs.unlink(TextLogoUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    }); 
     // حذف فایل تصویر زمینه فروشگاه
    fs.unlink(BackGroundShopUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });  
    // حذف فایل تصویر زمینه پنل
    fs.unlink(BackGroundpanelUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });

    return { message: "فروشگاه و فایل تصویر با موفقیت حذف شدند", status: 200 };
  } catch (error) {
    console.error("خطا در حذف فروشگاه:", error);
    throw new Error("خطای سرور، حذف فروشگاه انجام نشد");
  }
}

async function EditShop(ShopID, ShopData) {
  try {
    await connectDB(); // اتصال به دیتابیس

    const validatedData = await ShopSchema.validate(ShopData, { abortEarly: false });

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    // به روزرسانی فروشگاه با داده‌های جدید
    Object.assign(Shop, validatedData);
    await Shop.save();


    return { message: "فروشگاه با موفقیت ویرایش شد", status: 200 };
  } catch (error) {
    console.error("خطا در ویرایش فروشگاه:", error);
    throw new Error("خطای سرور، ویرایش فروشگاه انجام نشد");
  }
}

async function AddShop({ShopData}) {
    console.log("ShopData-->",ShopData);
  try {
    await connectDB(); // اتصال به دیتابیس

    // اعتبارسنجی داده‌ها با استفاده از yup
    const validatedData = await ShopSchema.validate(ShopData, { abortEarly: false });

    const newShop = new shops(validatedData);
    await newShop.save();

    return { message: "فروشگاه با موفقیت اضافه شد", status: 201 };
  } catch (error) {
    console.error("خطا در افزودن فروشگاه:", error);
    throw new Error("خطای سرور، افزودن فروشگاه انجام نشد");
  }
}

export {
  DeleteShops,
  ShopServerEnableActions,
  ShopServerDisableActions,
  GetAllShops,
  GetAllEnableShops,
  EditShop,
  AddShop,
};
