"use server";

import Banner from "@/templates/panel/Banner/Banner";
import connectDB from "@/utils/connectToDB";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import BannerSchema from "@/utils/yupSchemas/BannerSchima";
import { deleteOldImage, processAndSaveImage } from "@/utils/ImageUploader";

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
    const plainBanners = banners?.map((banner) => ({
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

export async function GetAllEnableBanners(ShopId) {
  try {
    await connectDB();

 
    
    // واکشی بنرهای فعال که به فروشگاه مدنظر تعلق دارند
    const banners = await Banner.find({ BannerStatus: true, ShopId }).lean(); // فیلتر بر اساس ShopId و BannerStatus
    // اگر بنری پیدا نشد، لیست خالی بازگردانید
  
    // تبدیل اشیاء به plain objects
    const plainBanners = banners?.map((banner) => ({
      ...banner,
      _id: banner._id.toString(), // تبدیل ObjectId به رشته
      ShopId: banner.ShopId.toString(), // تبدیل ObjectId به رشته
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
      return { message: "بنر مورد نظر یافت نشد", status: 500 };

    }

    // مسیر فایل تصویر بنر

    // حذف بنر از دیتابیس
    const result = await Banner.deleteOne({ _id: BannerID });
    if (result.deletedCount === 0) {
      return { message: "بنر مورد نظر حذف نشد", status: 500 };
    }

  const deleteStatus=deleteOldImage(banner.imageUrl)
   if (deleteStatus.status===200) {
  return { message: "بنر و فایل تصویر با موفقیت حذف شدند", status: 200 };
}else{
  return { message: "خطای سرور، حذف بنر انجام نشد", status: 500 };
}

  } catch (error) {
    console.error("خطا در حذف بنر:", error);
    return { message: "خطای سرور، حذف بنر انجام نشد", status: 500 };
  }
}

function formDataToObject(formData) {
  const object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });
  return object;
}
export async function AddBannerAction(data) {

  try {
    await connectDB();

    // تبدیل FormData به آبجکت ساده ساخته شده
    const formDataObject = formDataToObject(data);

    
    const ShopId = formDataObject.ShopId;

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

    
    const imageUrl = await processAndSaveImage(BannerImage,null,`${ShopId}/banners`,);

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
export async function EditBannerAction(data,ShopId) {
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
      
   imageUrl = await processAndSaveImage(BannerImage,null,`${ShopId}/banners`,);
   try {
   deleteOldImage(banner.imageUrl)
   
      } catch {
    console.error("Error deleting old image");
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




