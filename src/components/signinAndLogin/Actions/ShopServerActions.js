"use server";

import shops from "@/models/shops";
import connectDB from "@/utils/connectToDB";
import { cookies } from 'next/headers';
import fs from "fs";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";

export async function authenticateUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('next-auth.session-token')?.value;

    if (!accessToken) {
      throw new Error('Access token not found');
    }


  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `next-auth.session-token=${accessToken}`,
    },
    credentials: 'include',
  });


    if (!res.ok) {
      throw new Error(`Failed to fetch user data. Status: ${res.status}`);
    }

    const session = await res.json();
    // console.log('Session Data:', session);

    if (!session.user) {
      throw new Error('No user data found in session');
    }

    return session.user;
  } catch (err) {
    console.error('Error in authenticateUser:', err);
    throw err;
  }
}

async function GetUserShops() {
  try {
    await connectDB();
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error('User data not found');
    }

    const Shops = await shops.find({ CreatedBy: userData.id }).lean();

    const plainShops = Shops.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(),
      createdAt: Shop.createdAt.toISOString(),
      updatedAt: Shop.updatedAt.toISOString(),
    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فروشگاه‌ها:", error);
    throw new Error("خطای سرور، دریافت فروشگاه‌ها انجام نشد");
  }
}


async function ShopServerEnableActions(ShopID) {
  try {
    await connectDB(); // اتصال به دیتابیس
    const userData = await authenticateUser();

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    if (Shop.CreatedBy.toString() !== userData.id) {
      throw new Error("شما مجاز به انجام این عملیات نیستید");
    }

    Shop.ShopStatus = true;

    await Shop.save();

    return { Message: "وضعیت فروشگاه با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    throw new Error("خطای سرور، تغییر وضعیت فروشگاه انجام نشد");
  }
}

async function ShopServerDisableActions(ShopID) {
  try {
    await connectDB(); // اتصال به دیتابیس
    const userData = await authenticateUser();

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    if (Shop.CreatedBy.toString() !== userData.id) {
      throw new Error("شما مجاز به انجام این عملیات نیستید");
    }

    Shop.ShopStatus = false;

    await Shop.save();

    return { Message: "وضعیت فروشگاه با موفقیت به false تغییر یافت", status: 201 };
  } catch (error) {
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
    const userData = await authenticateUser();

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    if (Shop.CreatedBy.toString() !== userData.id) {
      throw new Error("شما مجاز به انجام این عملیات نیستید");
    }

    const LogoUrl = path.join(process.cwd(), "public", Shop.LogoUrl);
    const TextLogoUrl = path.join(process.cwd(), "public", Shop.TextLogoUrl);
    const BackGroundShopUrl = path.join(process.cwd(), "public", Shop.BackGroundShopUrl);
    const BackGroundpanelUrl = path.join(process.cwd(), "public", Shop.BackGroundpanelUrl);

    const result = await Shop.deleteOne({ _id: ShopID });

    if (result.deletedCount === 0) {
      throw new Error("فروشگاه مورد نظر حذف نشد");
    }

    fs.unlink(LogoUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });

    fs.unlink(TextLogoUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });

    fs.unlink(BackGroundShopUrl, (err) => {
      if (err) {
        console.error("خطا در حذف فایل تصویر:", err);
        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
      }
    });

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
    const userData = await authenticateUser();

    const validatedData = await ShopSchema.validate(ShopData, { abortEarly: false });

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    if (Shop.CreatedBy.toString() !== userData.id) {
      throw new Error("شما مجاز به انجام این عملیات نیستید");
    }

    Object.assign(Shop, validatedData);
    await Shop.save();

    return { message: "فروشگاه با موفقیت ویرایش شد", status: 200 };
  } catch (error) {
    console.error("خطا در ویرایش فروشگاه:", error);
    throw new Error("خطای سرور، ویرایش فروشگاه انجام نشد");
  }
}


async function AddShop({ShopData}) {
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
  GetUserShops,
};
