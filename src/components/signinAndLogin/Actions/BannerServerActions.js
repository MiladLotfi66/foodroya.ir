"use server";

import Banner from "@/models/Banner";
import connectDB from "@/utils/connectToDB";
import fs from "fs";
import multer from 'multer';
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { writeFile, unlink } from "fs/promises";
import sharp from "sharp";
import { headers } from "next/headers";
import { GetShopIdByShopUniqueName } from "./RolesPermissionActions";
import BannerSchema from "@/utils/yupSchemas/BannerSchima";

async function BannerServerEnableActions(BannerID) {
  try {
    await connectDB(); // اتصال به دیتابیس
    // یافتن بنر با استفاده از BannerID
    const banner = await Banner.findById(BannerID);

    if (!banner) {
      // اگر بنر پیدا نشد، پرتاب خطا
      throw new Error("بنر مورد نظر یافت نشد");
    }

    // تغییر وضعیت بنر به true
    banner.BannerStatus = true;

    // ذخیره کردن تغییرات در دیتابیس
    await banner.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت بنر با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت بنر:", error);
    throw new Error("خطای سرور، تغییر وضعیت بنر انجام نشد");
  }
}
async function BannerServerDisableActions(BannerID) {
  try {
    await connectDB(); // اتصال به دیتابیس

    // یافتن بنر با استفاده از BannerID
    const banner = await Banner.findById(BannerID);

    if (!banner) {
      // اگر بنر پیدا نشد، پرتاب خطا
      throw new Error("بنر مورد نظر یافت نشد");
    }

    // تغییر وضعیت بنر به true
    banner.BannerStatus = false;

    // ذخیره کردن تغییرات در دیتابیس
    await banner.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت بنر با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت بنر:", error);
    throw new Error("خطای سرور، تغییر وضعیت بنر انجام نشد");
  }
}
async function GetAllBanners(ShopId) {
  
  try {
    await connectDB();

    // واکشی تمام اطلاعات بنرها از دیتابیس
    const banners = await Banner.find({ShopId:ShopId}).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

    // تبدیل اشیاء به plain objects
    const plainBanners = banners.map((banner) => ({
      ...banner,
      _id: banner._id.toString(), // تبدیل ObjectId به رشته
      createdAt: banner.createdAt.toISOString(), // تبدیل Date به رشته
      updatedAt: banner.updatedAt.toISOString(), // تبدیل Date به رشته
      ShopId: banner.ShopId.toString(), // تبدیل Date به رشته
    }));

    return { banners: plainBanners, status: 200 };
  } catch (error) {
    console.error("خطا در تغییر وضعیت بنر:", error);
    throw new Error("خطای سرور، تغییر وضعیت بنر انجام نشد");
  }
}

export async function GetAllEnableBanners(shopUniqName) {
  try {
    await connectDB();

    // دریافت آی‌دی فروشگاه از طریق نام یکتای فروشگاه
    const shopResponse = await GetShopIdByShopUniqueName(shopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required");
    }
    const ShopId = shopResponse.ShopID;

    // واکشی بنرهای فعال که به فروشگاه مدنظر تعلق دارند
    const banners = await Banner.find({ BannerStatus: true, ShopId }).lean(); // فیلتر بر اساس ShopId و BannerStatus

    // تبدیل اشیاء به plain objects
    const plainBanners = banners.map((banner) => ({
      ...banner,
      _id: banner._id.toString(), // تبدیل ObjectId به رشته
      createdAt: banner.createdAt.toISOString(), // تبدیل Date به رشته
      updatedAt: banner.updatedAt.toISOString(), // تبدیل Date به رشته
    }));

    return { banners: plainBanners, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت بنرها:", error);
    throw new Error("خطای سرور، دریافت بنرها انجام نشد");
  }
}

async function DeleteBanners(BannerID) {
  try {
    await connectDB();

    // یافتن بنر با استفاده از BannerID
    const banner = await Banner.findById(BannerID);
    if (!banner) {
      throw new Error("بنر مورد نظر یافت نشد");
    }

    // مسیر فایل تصویر بنر
    const imagePath = path.join(process.cwd(), "public", banner.imageUrl);

    // حذف بنر از دیتابیس
    const result = await Banner.deleteOne({ _id: BannerID });
    if (result.deletedCount === 0) {
      throw new Error("بنر مورد نظر حذف نشد");
    }

    // حذف فایل تصویر بنر
    // await unlink(path.join(process.cwd(), 'public', banner.imageUrl));
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });

    return { message: "بنر و فایل تصویر با موفقیت حذف شدند", status: 200 };
  } catch (error) {
    console.error("خطا در حذف بنر:", error);
    throw new Error("خطای سرور، حذف بنر انجام نشد");
  }
}

function formDataToObject(formData) {
  const object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });
  return object;
}

const processAndSaveImage = async (image) => {
  if (image && typeof image !== "string") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const now = process.hrtime.bigint(); 
    const fileName = `${now}.webp`;
    const filePath = path.join(process.cwd(), "public/Uploads/Banners/" + fileName);
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(filePath, optimizedBuffer);
    return "/Uploads/Banners/" + fileName;
  }
  return image;
};
export async function AddBannerAction(data) {

  try {
    await connectDB();

    // تبدیل FormData به آبجکت ساده ساخته شده
    const formDataObject = formDataToObject(data);

    const shopUniqName = formDataObject.shopUniqName;

    if (!shopUniqName) {
      throw new Error("shopUniqName is required");
    }

    // دریافت آی‌دی فروشگاه
    const shopResponse = await GetShopIdByShopUniqueName(shopUniqName);
    if (shopResponse.status !== 200 || !shopResponse.ShopID) {
      throw new Error(shopResponse.error || "shopId is required");
    }
    const ShopId = shopResponse.ShopID;

    // اعتبارسنجی داده‌های ورودی
    const validatedData = await BannerSchima.validate(formDataObject, {
      abortEarly: false,
    });

    const {
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      BannerImage,
      BannerTextColor,
      BannerStatus,
      BannerLink,
    } = validatedData;

    
    const imageUrl = await processAndSaveImage(BannerImage);

    // ایجاد بنر جدید با آی‌دی فروشگاه
    const newBanner = new Banner({
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      imageUrl,
      BannerTextColor,
      BannerStatus,
      BannerLink,
      ShopId, // اضافه کردن آی‌دی فروشگاه
    });

    await newBanner.save();

    return { status: 201, message: "آپلود فایل با موفقیت انجام شد" };
  } catch (error) {
    console.error("Error in AddBannerAction:", error);
    return { status: 500, message: error.message };
  }
}


export async function EditBannerAction(data,shopUniqName) {
  try {
    await connectDB();
    const formDataObject = formDataToObject(data);

    const bannerId = formDataObject.id;

    if (!bannerId) {
      console.error("Banner ID is missing");
      return { status: 400, message: "آی‌دی بنر ارسال نشده است" };
    }

    const banner = await Banner.findById(bannerId);

    if (!banner) {
      console.error("Banner not found");
      return { status: 404, message: "بنری با این آی‌دی یافت نشد" };
    }

    const validatedData = await BannerSchema.validate(formDataObject, {
      abortEarly: false,
    });

    const {
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      BannerTextColor,
      BannerStatus,
      BannerLink,
      BannerImage,
    } = validatedData;

   let imageUrl
    if (typeof(BannerImage)!=="string") {
      
   imageUrl = await processAndSaveImage(BannerImage);
   try {
    console.log("image delete=----------------->");
    
    await unlink(path.join(process.cwd(), 'public', banner.imageUrl));
      } catch (unlinkError) {
    console.error("Error deleting old image", unlinkError);
  }
}else {
   imageUrl =BannerImage
}

    const updatedBanner = {
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      BannerTextColor,
      BannerStatus,
      BannerLink,
      imageUrl,
    };

    const updatedBannerDoc = await Banner.findByIdAndUpdate(
      bannerId,
      updatedBanner,
      { new: true }
    );

       return { status: 201, message: "ویرایش بنر با موفقیت انجام شد" };

  } catch (error) {
    console.error("Error in EditBannerAction:", error);
    return { status: 500, message: error.message };
  }
}


export {
  DeleteBanners,
  BannerServerEnableActions,
  BannerServerDisableActions,
  GetAllBanners,
  
};




