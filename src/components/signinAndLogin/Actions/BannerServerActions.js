"use server";

import Banner from "@/models/Banner";
import connectDB from "@/utils/connectToDB";
import fs from "fs";
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import { writeFile, unlink } from "fs/promises";
import sharp from "sharp";
import { headers } from "next/headers";



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
    const plainBanners = banners.map((banner) => ({
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

async function GetAllEnableBanners() {
  try {
    await connectDB();

    // واکشی تمام اطلاعات بنرها از دیتابیس
    const banners = await Banner.find({ BannerStatus: true }).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

    // تبدیل اشیاء به plain objects
    const plainBanners = banners.map((banner) => ({
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
    const imagePath = path.join(process.cwd(), "public", banner.imageUrl);

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

async function EditBanner(bannerID, bannerData) {
  try {
    await connectDB(); // اتصال به دیتابیس

    const validatedData = await BannerSchima.validate(bannerData, { abortEarly: false });

    const banner = await Banner.findById(bannerID);

    if (!banner) {
      throw new Error("بنر مورد نظر یافت نشد");
    }

    // به روزرسانی بنر با داده‌های جدید
    Object.assign(banner, validatedData);
    await banner.save();


    return { message: "بنر با موفقیت ویرایش شد", status: 200 };
  } catch (error) {
    console.error("خطا در ویرایش بنر:", error);
    throw new Error("خطای سرور، ویرایش بنر انجام نشد");
  }
}

async function AddBanner({bannerData}) {
    console.log("bannerData-->",bannerData);
  try {
    await connectDB(); // اتصال به دیتابیس

    // اعتبارسنجی داده‌ها با استفاده از yup
    const validatedData = await BannerSchima.validate(bannerData, { abortEarly: false });

    const newBanner = new Banner(validatedData);
    await newBanner.save();

    return { message: "بنر با موفقیت اضافه شد", status: 201 };
  } catch (error) {
    console.error("خطا در افزودن بنر:", error);
    throw new Error("خطای سرور، افزودن بنر انجام نشد");
  }
}

async function AddNewBanner() {
  const headersList = headers();
  const referer = headersList.get('referer')

  console.log(`Requested URL:`);

console.log("referer",referer);

headersList.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});
 
if (referer) {
  const url = new URL(referer);
  const params = new URLSearchParams(url.search);

    // استخراج مقدار shopUniqName از پارامترها
    const shopUniqName = params.get('shopUniqName');
    console.log('shopUniqName:', shopUniqName);

  }
}


export {
  DeleteBanners,
  BannerServerEnableActions,
  BannerServerDisableActions,
  GetAllBanners,
  GetAllEnableBanners,
  EditBanner,
  AddBanner,
  AddNewBanner,
};



// export async function PUT(req) {
//   try {
//     await connectDB();

//     const formData = await req.formData();

//     const validatedData = await BannerSchima.validate(
//       {
//         BannerBigTitle: formData.get("BannerBigTitle"),
//         BannersmallDiscription: formData.get("BannersmallDiscription"),
//         BannerDiscription: formData.get("BannerDiscription"),
//         BannerStep: formData.get("BannerStep"),
//         BannerTextColor: formData.get("BannerTextColor"),
//         BannerImage: formData.getAll("BannerImage"),
//         BannerStatus: formData.get("BannerStatus"),
//         BannerLink: formData.get("BannerLink"),
//       },
//       {
//         abortEarly: false,
//       }
//     );

//     const {
//       BannerBigTitle,
//       BannersmallDiscription,
//       BannerDiscription,
//       BannerStep,
//       BannerImage,
//       BannerTextColor,
//       BannerStatus,
//       BannerLink,
//     } = validatedData;

//     const buffer = Buffer.from(await BannerImage[0].arrayBuffer());
//     const now = process.hrtime.bigint(); // استفاده از میکروثانیه‌ها
//     const fileName = `${now}.webp`;
//     const filePath = path.join(process.cwd(), "public/Uploads/" + fileName);
//     const optimizedBuffer = await sharp(buffer)
//       .webp({ quality: 80 })
//       .toBuffer();
//     await writeFile(filePath, optimizedBuffer);
//     const imageUrl = "/Uploads/" + fileName;

//     const newBanner = new Banner({
//       BannerBigTitle,
//       BannersmallDiscription,
//       BannerDiscription,
//       BannerStep,
//       imageUrl,
//       BannerTextColor,
//       BannerStatus,
//       BannerLink,
//     });

//     await newBanner.save();

//     return new Response(
//       JSON.stringify({ message: "آپلود فایل با موفقیت انجام شد" }),
//       { status: 201, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("Error in PUT API:", error);
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

// export async function GET(req) {
//   try {
//     await connectDB();

//     const banners = await Banner.find({}).lean();

//     return new Response(JSON.stringify({ banners }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error in GET API:", error);
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
