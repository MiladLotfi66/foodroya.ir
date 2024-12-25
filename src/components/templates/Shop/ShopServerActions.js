"use server";
import mongoose from 'mongoose';
import shops from "@/templates/Shop/shops";
import Comment from "@/models/Comment";
import Account from "@/templates/panel/Account/Account";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import { writeFile, unlink } from "fs/promises";
import sharp from "sharp";
import Users from "@/models/Users";
import { revalidatePath } from "next/cache";
import { getServerSession } from 'next-auth/next';
import { authOption } from "@/app/api/auth/[...nextauth]/route"; // مسیر صحیح فایل auth.js

export const simplifyFollowers = (followers) => {

  // چک کردن اگر followers یک آرایه خالی باشد یا undefined باشد
  if (!Array.isArray(followers) || followers.length === 0) {
    return []; // آرایه خالی را برمی‌گرداند
  }

  return followers?.map((follower) => {
    if (follower && typeof follower.toHexString === 'function') {
      return follower.toHexString();
    } else {
      console.error('Invalid follower object:', follower);
      return null; // در صورت نامعتبر بودن فالوور، می‌توان مقدار null یا مقدار پیش‌فرض دیگری برگرداند
    }
  }).filter(follower => follower !== null); // حذف مقادیر null در صورت وجود
};

export async function isUniqShop(uniqueIdentifier) {
  
  await connectDB();
  try {
    const shop = await shops.findOne({ ShopUniqueName: uniqueIdentifier });
    const isUnique = !shop;
    if (isUnique) {
      return { message: "این نام فروشگاه تکراری نمی باشد", status: 200 };
    } else {
      return { error: "این نام فروشگاه تکراری نمی باشد", status: 400 };
    }
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}
export async function GetUserShops() {
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

    const Shops = await shops.find({ CreatedBy: userData.id , is_deleted:false}).lean();

    const plainShops = Shops?.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(),
      CreatedBy: Shop.CreatedBy.toString(),
      LastEditedBy: Shop.LastEditedBy.toString(),
      createdAt: Shop.createdAt.toISOString(),
      updatedAt: Shop.updatedAt.toISOString(),
      deleted_by: Shop.deleted_by?.toString() || null, // تبدیل ObjectId به string
      deleted_at: Shop.deleted_at?.toISOString() || null, // تبدیل تاریخ به ISO string
      followers: simplifyFollowers(Shop.followers),
      avatarUrl: Shop.LogoUrl, // اطمینان از وجود LogoUrl


    }));

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فروشگاه‌ها:", error);
    return { error: error.message, status: 500 };

  }
}
export async function GetUserShopsCount() {
  try {
    // اتصال به پایگاه داده
    await connectDB();

    // احراز هویت کاربر
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

    // محاسبه تعداد فروشگاه‌ها با استفاده از countDocuments
    const shopCount = await shops.countDocuments({ 
      CreatedBy: userData.id, 
      is_deleted: false 
    });

    return { shopCount, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت تعداد فروشگاه‌ها:", error);
    return { error: error.message, status: 500 };
  }
}

export async function GetShopCommentsArray(shopId) {
  try {
    // اتصال به دیتابیس
    await connectDB();

    // احراز هویت کاربر
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  
    // پیدا کردن رکورد شاپ و آوردن کامنت‌ها
    const shop = await shops.findById(shopId)
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' }
      })
      .lean();

    if (!shop) {
      return { error: "Shop not found", status: 404 };
    }

    // ساده‌سازی کامنت‌ها قبل از ارسال
    const simplifiedComments = shop?.comments?.map(comment => ({
      _id: comment._id,
      text: comment.text, // متن کامنت
      author: comment.author?.name || 'Unknown', // نویسنده کامنت
      likesCount: comment.likes?.length || 0, // تعداد لایک‌ها
      dislikesCount: comment.dislikes?.length || 0, // تعداد دیسلایک‌ها
      repliesCount: comment.replies?.length || 0, // تعداد پاسخ‌ها
      isDeleted: comment.is_deleted || false, // وضعیت حذف شده بودن
    }));

    return { comments: simplifiedComments, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت کامنت‌ها:", error);
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
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

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
    const session = await getServerSession(authOption);
    if (session && session.user) {
      return session.user;
    } else {
      console.log("Token not found. User is not logged in.");
      return null;
    }
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    return null;
  }
}

export async function EditShop(ShopData) {
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
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
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // استخراج توکن JWT و احراز هویت کاربر
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
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

    // ایجاد فروشگاه جدید با استفاده از نشست تراکنش
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
    
    await newShop.save({ session });
    const darayiId = new mongoose.Types.ObjectId();

    // تعریف حساب‌های پیش‌فرض
    const defaultAccounts = [
      {
        _id: darayiId, // تنظیم _id مشخص برای حساب والد
        accountCode: '1000',
        title: 'دارایی',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بستانکار', // اصلاح شده
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '2000',
        title: 'بدهی',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '3000',
        title: 'سرمایه',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بستانکار',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '4000',
        title: 'درآمد',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بستانکار',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '5000',
        title: 'هزینه',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '6000',
        title: 'حساب انتظامی',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بدون ماهیت', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '1000-1',
        title: 'انبار',
        store: newShop._id,
        parentAccount: darayiId,
        accountType: 'انبار',
        accountNature: 'بدهی', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
    ];
    

    // ایجاد حساب‌های پیش‌فرض با استفاده از نشست تراکنش
    await Account.insertMany(defaultAccounts, { session });

    // تکمیل تراکنش
    await session.commitTransaction();
    session.endSession();

    return { message: "فروشگاه و حساب‌های مرتبط با موفقیت ثبت شدند", status: 201 };
  } catch (error) {
    // ابورت تراکنش در صورت بروز خطا
    await session.abortTransaction();
    session.endSession();
    console.error("خطا در عملیات افزودن فروشگاه:", error);
    return { error: error.message, status: 500 };
  }
}


export async function followShopServerAction(ShopID) {
  try {
    await connectDB();

    // اعتبارسنجی کاربر
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }  
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
    revalidatePath("/Shop/allShop")


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
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
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
    revalidatePath("/Shop/allShop")


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
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

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
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

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

    const Shops = await shops.find({is_deleted:false}).lean();

    const plainShops = Shops?.map((Shop) => ({
      ...Shop,
      _id: Shop._id.toString(),
      CreatedBy: Shop.CreatedBy.toString(),
      LastEditedBy: Shop.LastEditedBy.toString(),
      createdAt: Shop.createdAt.toISOString(),
      updatedAt: Shop.updatedAt.toISOString(),
      deleted_by: Shop.deleted_by?.toString(), // تبدیل ObjectId به string
      deleted_at: Shop.deleted_at?.toISOString(), // تبدیل تاریخ به ISO string
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

    const Shops = await shops.find({ ShopStatus: true , is_deleted: false}).lean();

    const plainShops = Shops?.map((Shop) => {

      return {
        ...Shop,
        _id: Shop._id?.toString() || null, // تبدیل ObjectId به string
        CreatedBy: Shop.CreatedBy?.toString() || null, // تبدیل ObjectId به string
        deleted_by: Shop.deleted_by?.toString() || null, // تبدیل ObjectId به string
        LastEditedBy: Shop.LastEditedBy?.toString() || null, // تبدیل ObjectId به string
        createdAt: Shop.createdAt?.toISOString() || null, // تبدیل تاریخ به ISO string
        updatedAt: Shop.updatedAt?.toISOString() || null, // تبدیل تاریخ به ISO string
        deleted_at: Shop.deleted_at?.toISOString() || null, // تبدیل تاریخ به ISO string
        followers: simplifyFollowers(Shop.followers), // تبدیل followers
      };
    });

    return { Shops: plainShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت فروشگاه‌ها:", error); 
    return { error: error.message, status: 500 };
  }
}

async function DeleteShops(ShopID) {
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  
    

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

      // به‌روزرسانی حذف امن
      const result = await shops.updateOne(
        { _id: ShopID },
        {
          $set: {
            is_deleted: true,
            deleted_by: userData.id, // شناسه کاربر حذف‌کننده
            deleted_at: new Date(), // زمان حذف
          },
        }
      );
  
      if (result.nModified === 0) {
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

export async function GetUserFollowingShops() {
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }

  if (!userData) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

    // یافتن کاربر بر اساس شناسه و پرپاپولیت کردن فیلد following
    const user = await Users.findById(userData.id).populate({
      path: 'following',
      select: 'ShopUniqueName ShopName LogoUrl', // انتخاب فیلدهای مورد نیاز
      match: { is_deleted: false }, // فقط شاپ‌هایی که حذف نشده‌اند
    }).lean();

    if (!user) {
      throw new Error("User not found");
    }

    // استخراج شاپ‌های دنبال‌شده
    const followingShops = user.following.map(shop => ({
      shopId: shop._id.toString(),
      name: shop.ShopName,
      uniqueName: shop.ShopUniqueName,
      avatarUrl: shop.LogoUrl,
    }));

    return { shops: followingShops, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت شاپ‌های دنبال‌شده:", error);
    return { error: error.message, status: 500 };
  }
}
export async function GetShopLogos(shopId) {

  // اتصال به پایگاه داده
  await connectDB();
  
  
  try {
    // یافتن فروشگاه بر اساس shopId
    const shop = await shops.findById(shopId).lean();
  
    if (!shop) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

  
    // بازگرداندن URLهای لوگو
    const logos = {
      logoUrl: shop.LogoUrl,
      textLogoUrl: shop.TextLogoUrl,
      backgroundShopUrl: shop.BackGroundShopUrl,
      backgroundPanelUrl: shop.BackGroundpanelUrl,
    };
  
    return { logos , status: 200 };
  } catch (error) {
    console.error("خطا در دریافت تصاویر فروشگاه:", error);
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
