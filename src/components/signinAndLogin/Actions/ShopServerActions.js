"use server";
import shops from "@/models/shops";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import { writeFile, unlink } from "fs/promises";
import sharp from "sharp";
import Users from "@/models/Users";

const simplifyFollowers = (followers) =>
  followers.map((follower) => follower.toString());

export async function isUniqShop(uniqueIdentifier) {
  await connectDB();
  try {
    const shop = await shops.findOne({ ShopUniqueName: uniqueIdentifier });
    const isUnique = !shop;
    console.log(shop, isUnique, uniqueIdentifier);
    if (isUnique) {
      return { message: "این نام فروشگاه تکراری نمی باشد", status: 200 };
    } else {
      return { error: "این نام فروشگاه تکراری نمی باشد", status: 400 };
    }
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}
const processAndSaveImage = async (image, oldUrl) => {
  if (image && typeof image !== "string") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const now = process.hrtime.bigint(); // استفاده از میکروثانیه‌ها
    const fileName = `${now}.webp`;
    const filePath = path.join(
      process.cwd(),
      "/public/Uploads/Shops/" + fileName
    );
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(filePath, optimizedBuffer);

    if (oldUrl) {
      const oldFilePath = path.join(process.cwd(), "public", oldUrl);
      try {
        await unlink(oldFilePath);
      } catch (unlinkError) {
        if (unlinkError.code === "ENOENT") {
          console.warn("File does not exist, skipping deletion", oldFilePath);
        } else {
          console.error("Error deleting old image", unlinkError);
        }
      }
    }
    return "/Uploads/Shops/" + fileName;
  }
  return image;
};

const hasUserAccess = async (userId) => {
  try {
    await connectDB();
    const userData = await authenticateUser();

    // تبدیل هردو مقدار به رشته و حذف فضاهای خالی احتمالی
    const userDataId = userData.id.trim();
    const userIdStr = userId.toString().trim();

    if (userDataId === userIdStr) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in hasUserAccess function:", error);
    return false; // در صورت وقوع خطا، false را برگردانید
  }
};

export async function authenticateUser() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("next-auth.session-token")?.value;

    if (!accessToken) {
      throw new Error("Access token not found");
    }

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${accessToken}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user data. Status: ${res.status}`);
    }

    const session = await res.json();

    if (!session.user) {
      throw new Error("No user data found in session");
    }

    return session.user;
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    return { error: error.message, status: 500 };
  }
}

export async function GetUserbyUserId(userId) {
  try {
    // اتصال به پایگاه داده
    await connectDB();

    // پیدا کردن کاربر و دریافت لیست شناسه‌های فروشگاه‌های فالو شده
    const user = await Users.findById(userId).lean();

    if (!user) {
      throw new Error("User not found");
    }

    // تبدیل شناسه‌ها و مقادیر پیچیده به فرمت‌های قابل سریالایز
    const plainUser = {
      ...user,
      _id: user._id.toString(),
      following: user.following.map((shop) => shop._id.toString()),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // برگرداندن اطلاعات کاربر
    return { user: plainUser, status: 200 };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: error.message, status: 500 };
  }
}

export async function EditShop(ShopData) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }

    const ShopID = ShopData.get("id");
    if (!ShopID) {
      console.error("shop ID is missing");
      throw new Error("آی‌دی فروشگاه ارسال نشده است");
    }
    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      console.error("Shop not found");
      throw new Error("فروشگاهی با این آی‌دی یافت نشد");
    }

    if (!(await hasUserAccess(Shop.CreatedBy))) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }
    const validatedData = await ShopSchema.validate(
      {
        ShopUniqueName: ShopData.get("ShopUniqueName"),
        ShopName: ShopData.get("ShopName"),
        ShopSmallDiscription: ShopData.get("ShopSmallDiscription"),
        ShopDiscription: ShopData.get("ShopDiscription"),
        ShopAddress: ShopData.get("ShopAddress"),
        ShopPhone: ShopData.get("ShopPhone"),
        ShopMobile: ShopData.get("ShopMobile"),
        ShopStatus: ShopData.get("ShopStatus"),
        Logo: ShopData.get("Logo"),
        TextLogo: ShopData.get("TextLogo"),
        BackGroundShop: ShopData.get("BackGroundShop"),
        BackGroundpanel: ShopData.get("BackGroundpanel"),
      },
      {
        abortEarly: false,
      }
    );

    const {
      ShopUniqueName,
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      Logo,
      TextLogo,
      BackGroundShop,
      BackGroundpanel,
    } = validatedData;

    const LogoUrl = await processAndSaveImage(Logo, Shop.LogoUrl);
    const TextLogoUrl = await processAndSaveImage(TextLogo, Shop.TextLogoUrl);
    const BackGroundShopUrl = await processAndSaveImage(
      BackGroundShop,
      Shop.BackGroundShopUrl
    );
    const BackGroundpanelUrl = await processAndSaveImage(
      BackGroundpanel,
      Shop.BackGroundpanelUrl
    );

    const updatedShop = {
      ShopUniqueName,
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      LogoUrl,
      TextLogoUrl,
      BackGroundShopUrl,
      BackGroundpanelUrl,
      LastEditedBy: userData.id,
    };

    const updatedShopDoc = await shops.findByIdAndUpdate(ShopID, updatedShop, {
      new: true,
    });
    return { message: "ویرایش فروشگاه با موفقیت انجام شد", status: 200 };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

export async function AddShopServerAction(ShopData) {
  try {
    await connectDB();

    // استخراج توکن JWT
    const userData = await authenticateUser();

    if (!userData) {
      throw new Error("User data not found");
    }

    // تبدیل FormData به شیء ساده
    const shopDataObject = {};
    ShopData.forEach((value, key) => {
      shopDataObject[key] = value;
    });

    // اعتبارسنجی داده‌ها
    const validatedData = await ShopSchema.validate(shopDataObject, {
      abortEarly: false,
    });

    const {
      ShopUniqueName,
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      Logo,
      TextLogo,
      BackGroundShop,
      BackGroundpanel,
    } = validatedData;

    // پردازش و ذخیره تصاویر
    const LogoUrl = await processAndSaveImage(Logo);
    const TextLogoUrl = await processAndSaveImage(TextLogo);
    const BackGroundShopUrl = await processAndSaveImage(BackGroundShop);
    const BackGroundpanelUrl = await processAndSaveImage(BackGroundpanel);

    const newShop = new shops({
      ShopUniqueName,
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      LogoUrl,
      TextLogoUrl,
      BackGroundShopUrl,
      BackGroundpanelUrl,
      CreatedBy: userData.id,
      LastEditedBy: userData.id,
    });
    console.log("ShopUniqueName", ShopUniqueName);
    console.log(newShop);
    await newShop.save();

    return { message: "فروشگاه با موفقیت ثبت شد", status: 201 };
  } catch (error) {
    console.error("Error in addShop action:", error);
    return { error: error.message, status: 500 };
  }
}
export async function followShopServerAction(ShopID) {
  try {
    await connectDB();

    // اعتبارسنجی کاربر
    const userData = await authenticateUser();
    if (!userData) {
      throw new Error("User data not found");
    }

    // پیدا کردن فروشگاه
    const Shop = await shops.findById(ShopID);
    if (!Shop) {
      throw new Error("فروشگاهی با این آی‌دی یافت نشد");
    }

    // بررسی اینکه آیا کاربر قبلاً فروشگاه را دنبال کرده است یا خیر
    const userAlreadyFollows = Shop.followers.includes(userData.id);
    if (userAlreadyFollows) {
      return {
        message: "شما قبلاً این فروشگاه را دنبال کرده‌اید",
        status: 400,
      };
    }

    // اضافه کردن کاربر به فالوورهای فروشگاه
    Shop.followers.push(userData.id);
    await Shop.save();

    // اضافه کردن فروشگاه به فالوورهای کاربر
    const user = await Users.findById(userData.id);
    user.following.push(ShopID);
    await user.save();

    return { message: "فروشگاه با موفقیت دنبال شد", status: 200 };
  } catch (error) {
    console.error("Error in followShopServerAction:", error);
    return { error: error.message, status: 500 };
  }
}

export async function unfollowShopServerAction(ShopID) {
  try {
    await connectDB();

    // اعتبارسنجی کاربر
    const userData = await authenticateUser();
    if (!userData) {
      throw new Error("User data not found");
    }

    // پیدا کردن فروشگاه
    const Shop = await shops.findById(ShopID);
    if (!Shop) {
      throw new Error("فروشگاهی با این آی‌دی یافت نشد");
    }

    // بررسی اینکه آیا کاربر فروشگاه را دنبال کرده است یا خیر
    const userFollowsShop = Shop.followers.includes(userData.id);
    if (!userFollowsShop) {
      return { message: "شما این فروشگاه را دنبال نکرده‌اید", status: 400 };
    }

    // حذف کاربر از لیست فالوورهای فروشگاه
    Shop.followers = Shop.followers.filter(
      (followerId) => followerId.toString() !== userData.id
    );
    await Shop.save();

    // حذف فروشگاه از لیست فروشگاه‌های دنبال‌شده کاربر
    const user = await Users.findById(userData.id);
    user.following = user.following.filter(
      (followingShopId) => followingShopId.toString() !== ShopID
    );
    await user.save();

    return {
      message: "شما با موفقیت این فروشگاه را آنفالو کردید",
      status: 200,
    };
  } catch (error) {
    console.error("Error in unfollowShopServerAction:", error);
    return { error: error.message, status: 500 };
  }
}

async function ShopServerEnableActions(ShopID) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاهی با این آی‌دی یافت نشد");
    }

    if (!(await hasUserAccess(Shop.CreatedBy))) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Shop.ShopStatus = true;

    await Shop.save();

    return {
      Message: "وضعیت فروشگاه با موفقیت به true تغییر یافت",
      status: 201,
    };
  } catch (error) {
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    return { error: error.message, status: 500 };
  }
}

async function ShopServerDisableActions(ShopID) {
  try {
    await connectDB();
    const userData = await authenticateUser();

    const Shop = await shops.findById(ShopID);

    if (!Shop) {
      throw new Error("فروشگاه مورد نظر یافت نشد");
    }

    if (!(await hasUserAccess(Shop.CreatedBy))) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Shop.ShopStatus = false;

    await Shop.save();

    return {
      Message: "وضعیت فروشگاه با موفقیت به false تغییر یافت",
      status: 201,
    };
  } catch (error) {
    console.error("خطا در تغییر وضعیت فروشگاه:", error);
    return { error: error.message, status: 500 };
  }
}

async function GetAllShops() {
  try {
    await connectDB();

    const Shops = await shops.find({}).lean();

    const plainShops = Shops.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(),
      CreatedBy: Shop.CreatedBy.toString(),
      LastEditedBy: Shop.LastEditedBy.toString(),
      createdAt: Shop.createdAt.toISOString(),
      updatedAt: Shop.updatedAt.toISOString(),
      followers: simplifyFollowers(Shop.followers),
    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فروشگاه‌ها:", error);
    return { error: error.message, status: 500 };
  }
}

async function GetAllEnableShops() {
  try {
    await connectDB();

    const Shops = await shops.find({ ShopStatus: true }).lean();

    const plainShops = Shops.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(),
      CreatedBy: Shop.CreatedBy.toString(),
      LastEditedBy: Shop.LastEditedBy.toString(),
      createdAt: Shop.createdAt.toISOString(),
      updatedAt: Shop.updatedAt.toISOString(),
      followers: simplifyFollowers(Shop.followers),
    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فروشگاه‌ها:", error);
    return { error: error.message, status: 500 };
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

    if (!(await hasUserAccess(Shop.CreatedBy))) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    const LogoUrl = path.join(process.cwd(), "public", Shop.LogoUrl);
    const TextLogoUrl = path.join(process.cwd(), "public", Shop.TextLogoUrl);
    const BackGroundShopUrl = path.join(
      process.cwd(),
      "public",
      Shop.BackGroundShopUrl
    );
    const BackGroundpanelUrl = path.join(
      process.cwd(),
      "public",
      Shop.BackGroundpanelUrl
    );

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
    return { error: error.message, status: 500 };
  }
}


export {
  DeleteShops,
  ShopServerEnableActions,
  ShopServerDisableActions,
  GetAllShops,
  GetAllEnableShops,
};
