"use server";

import Banner from "@/models/Banner";
import connectDB from "@/utils/connectToDB";
import fs from "fs";
import path from "path";

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
async function GetAllBanners() {
    try {
        await connectDB();

        // واکشی تمام اطلاعات بنرها از دیتابیس
        const banners = await Banner.find({}).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

  // تبدیل اشیاء به plain objects
  const plainBanners = banners.map(banner => ({
    ...banner,
    _id: banner._id.toString(), // تبدیل ObjectId به رشته
    createdAt: banner.createdAt.toISOString(), // تبدیل Date به رشته
    updatedAt: banner.updatedAt.toISOString(), // تبدیل Date به رشته
}));

return { banners: plainBanners, status: 200 };
    } catch (error) {
        console.error("خطا در تغییر وضعیت بنر:", error);
        throw new Error("خطای سرور، تغییر وضعیت بنر انجام نشد");    }
}

async function GetAllEnableBanners() {
    try {
        await connectDB();

        // واکشی تمام اطلاعات بنرها از دیتابیس
        const banners = await Banner.find({ BannerStatus: true }).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

        // تبدیل اشیاء به plain objects
        const plainBanners = banners.map(banner => ({
            ...banner,
            _id: banner._id.toString(), // تبدیل ObjectId به رشته
            createdAt: banner.createdAt.toISOString(), // تبدیل Date به رشته
            updatedAt: banner.updatedAt.toISOString(), // تبدیل Date به رشته
        }));

        return { banners: plainBanners, status: 200 };

    } catch (error) {
        console.error("خطا در تغییر وضعیت بنر:", error);
        throw new Error("خطای سرور، تغییر وضعیت بنر انجام نشد");
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
      const imagePath = path.join(process.cwd(), 'public', banner.imageUrl);
  
      // حذف بنر از دیتابیس
      const result = await Banner.deleteOne({ _id: BannerID });
      if (result.deletedCount === 0) {
        throw new Error("بنر مورد نظر حذف نشد");
      }
  
      // حذف فایل تصویر بنر
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


export  {DeleteBanners,BannerServerEnableActions ,BannerServerDisableActions,GetAllBanners,GetAllEnableBanners};
