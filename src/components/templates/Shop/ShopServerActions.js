"use server";
import mongoose from 'mongoose';
import shops from "@/templates/Shop/shops";
import Comment from "@/models/Comment";
import Account from "@/templates/panel/Account/Account";
import connectDB from "@/utils/connectToDB";
import ShopSchema from "@/templates/Shop/ShopSchema";
import Users from "@/models/Users";
import { revalidatePath } from "next/cache";
import { getServerSession } from 'next-auth/next';
import { authOption } from "@/app/api/auth/[...nextauth]/route"; // مسیر صحیح فایل auth.js
import { GetUserbyUserId } from '@/components/signinAndLogin/Actions/UsersServerActions';
import Contact from '../panel/Contact/Contact';
import RoleInShop from '../panel/rols/RoleInShop';
import rolePerimision from '../panel/rols/rolePerimision';
import PriceTemplate from '../panel/PriceTemplate/PriceTemplate';
import { processAndSaveImage } from '@/utils/ImageUploader';
import { deleteOldImage } from '@/utils/ImageUploader';
import { GetCurrencyIdByName } from '../panel/Currency/currenciesServerActions';
import SendMetod from '../panel/sendMetod/SendMetod';
import { getContactsByRoleId } from '../panel/rols/RolesPermissionActions';
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


export async function isUniqShop(uniqueIdentifier, currentShopId = null) {
  
  await connectDB();
  
  try {
    const query = { ShopUniqueName: uniqueIdentifier };
    
    // اگر currentShopId ارائه شده باشد، فروشگاه فعلی را از جستجو حذف می‌کنیم
    if (currentShopId) {
      query._id = { $ne: currentShopId };
    }

    const shop = await shops.findOne(query);
    const isUnique = !shop;

    if (isUnique) {
      return { message: "این نام فروشگاه تکراری نمی باشد", status: 200 };
    } else {
      return { error: "این نام فروشگاه تکراری می باشد", status: 400 };
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
      BaseCurrency: Shop?.BaseCurrency?.toString(),

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
export const hasUserAccessToEditAndDeleteShop = async (userId) => {
  
  try {
    await connectDB();
    let userData;
    try {
      userData = await authenticateUser();
    } catch (authError) {
      userData = null;
      console.log("Authentication failed:", authError);
    }
    
 
  if (!userData||!userId) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

    // تبدیل هردو مقدار به رشته و حذف فضاهای خالی احتمالی
    const userDataId = userData.id;
    const userIdStr = userId.toString();

    if (userDataId.toString() === userIdStr.toString()) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in hasUserAccessToEditAndDeleteShop function:", error);
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
console.log("Shop",Shop);

    if (!(await hasUserAccessToEditAndDeleteShop(userData.id))) {
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
        currentShopId: ShopID, // افزودن currentShopId

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

    const LogoUrl = await processAndSaveImage(Logo, Shop.LogoUrl,'Uploads/Shops');
    const TextLogoUrl = await processAndSaveImage(TextLogo, Shop.TextLogoUrl,'Uploads/Shops');
    const BackGroundShopUrl = await processAndSaveImage(
      BackGroundShop,
      Shop.BackGroundShopUrl,
      'Uploads/Shops'
    );
    const BackGroundpanelUrl = await processAndSaveImage(
      BackGroundpanel,
      Shop.BackGroundpanelUrl,
      'Uploads/Shops'
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
    const LogoUrl = await processAndSaveImage(Logo,null,'Uploads/Shops');
    const TextLogoUrl = await processAndSaveImage(TextLogo,null,'Uploads/Shops');
    const BackGroundShopUrl = await processAndSaveImage(BackGroundShop,null,'Uploads/Shops');
    const BackGroundpanelUrl = await processAndSaveImage(BackGroundpanel,null,'Uploads/Shops');
const defaultCurency= await GetCurrencyIdByName("ریال")

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
      BaseCurrency:defaultCurency.currencies._id
    });

    await newShop.save({ session });

    // تعریف ObjectId های حساب‌های گروه اصلی
    const darayiId = new mongoose.Types.ObjectId();
    const darayijariId = new mongoose.Types.ObjectId();
    const bedahiId = new mongoose.Types.ObjectId();
    // const bedahijariId = new mongoose.Types.ObjectId();
    // const bedahisabetId = new mongoose.Types.ObjectId();
    const sarmayeId = new mongoose.Types.ObjectId();
    const daramadId = new mongoose.Types.ObjectId();
    const hazineId = new mongoose.Types.ObjectId();
    const hesabEntezamiId = new mongoose.Types.ObjectId();

    // تعریف حساب‌های پیش‌فرض
    const defaultAccounts = [
      {
        _id: darayiId, // حساب گروه دارایی
        accountCode: '1000',
        title: 'دارایی',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بستانکار',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        _id: bedahiId, // حساب گروه بدهی
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
        _id: sarmayeId, // حساب گروه سرمایه
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
        _id: daramadId, // حساب گروه درآمد
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
        _id: hazineId, // حساب گروه هزینه
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
        _id: hesabEntezamiId, // حساب انتظامی
        accountCode: '6000',
        title: 'حساب انتظامی',
        store: newShop._id,
        parentAccount: null,
        accountType: 'گروه حساب',
        accountNature: 'بدون ماهیت',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        _id: darayijariId, // حساب گروه هزینه
        accountCode: '1000-1',
        title: 'دارایی های جاری',
        store: newShop._id,
        parentAccount: darayiId,
        accountType: 'گروه حساب',
        accountNature: 'بدهی', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '1000-1-1',
        title: 'حسابهای دریافتنی',
        store: newShop._id,
        parentAccount: darayijariId,
        accountType: 'گروه حساب',
        accountNature: 'بدهی', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '1000-1-2',
        title: 'انبار',
        store: newShop._id,
        parentAccount: darayijariId,
        accountType: 'انبار',
        accountNature: 'بدهی', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '1000-1-3',
        title: 'صندوق',
        store: newShop._id,
        parentAccount: darayijariId,
        accountType: 'صندوق',
        accountNature: 'بدهی', // می‌توانید اصلاح کنید بر اساس نیاز
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      // حساب‌های جدید اضافه شده
      {
        accountCode: '4000-1',
        title: 'فروش کالا',
        store: newShop._id,
        parentAccount: daramadId, // زیرمجموعه حساب درآمد
        accountType: 'حساب عادی',
        accountNature: 'بستانکار',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '5000-1',
        title: 'بهای تمام شده ی کالای فروش رفته',
        store: newShop._id,
        parentAccount: hazineId, // زیرمجموعه حساب هزینه
        accountType: 'حساب عادی',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '5000-2', // تغییر کد حساب به 5002
        title: 'برگشت از فروش',
        store: newShop._id,
        parentAccount: hazineId, // زیرمجموعه حساب هزینه
        accountType: 'حساب عادی',
        accountNature: 'بدهی', // طبیعت بدهکار برای حساب‌های هزینه
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '5000-3',
        title: 'تخفیفات',
        store: newShop._id,
        parentAccount: hazineId, // زیرمجموعه حساب درآمد
        accountType: 'حساب عادی',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '5000-4',
        title: 'ضایعات',
        store: newShop._id,
        parentAccount: hazineId, // زیرمجموعه حساب درآمد
        accountType: 'حساب عادی',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      ///////////////////
      {
        accountCode: '2000-1',
        title: 'بدهی های ثابت',
        store: newShop._id,
        parentAccount: bedahiId, // زیرمجموعه حساب درآمد
        accountType: 'گروه حساب',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
      {
        accountCode: '2000-2',
        title: 'بدهی های جاری',
        store: newShop._id,
        parentAccount: bedahiId, // زیرمجموعه حساب درآمد
        accountType: 'گروه حساب',
        accountNature: 'بدهی',
        accountStatus: 'فعال',
        createdBy: userData.id,
        isSystem: true,
      },
    ];
    
    const modirKolId = new mongoose.Types.ObjectId();
    const defaultRoles=[
      {
        _id: modirKolId,
        RoleTitle: 'مدیر کل',
        ShopId: newShop._id,
        LastEditedBy: userData.id,
        CreatedBy: userData.id,
        bannersPermissions: ["edit","delete","view","add"],
        rolesPermissions: ["edit","delete","view","add"],
        RoleStatus: true,
      },
    ]
    const ContactId = new mongoose.Types.ObjectId();

     const defaultRoleinShop=[
      {
        ContactId:ContactId ,
        ShopId: newShop._id,
        RoleId: modirKolId ,
        LastEditedBy: userData.id,
        CreatedBy: userData.id,
      },
    ] 
   const creator= await GetUserbyUserId(userData.id)
   
    const defaultContact=[
      {
        name: userData.name ,
        shop: newShop._id,
        phone: creator.user.phone ,
        RolesId: [modirKolId],
        userAccount:userData.id,
        createdBy: userData.id,
        updatedBy: userData.id,
      },
    ]
    const defaultPriceTemplate=[
      {title : "پیشفرض",
      decimalPlaces : 2 ,
      status : "فعال" ,
      shop : newShop._id,
      pricingFormulas:[{
        roles:modirKolId,
        formula:"c"
      }],
      defaultFormula:"c",}
    ]

    // شیئهای روش ارسال پیش‌فرض
    const defaultShippingMethods = [
      {
        SendMetodStatus:true,
        Title: "پست",
        Price: "پس کرایه",
        imageUrl:`${process.env.NEXTAUTH_URL}/Uploads/postLogo.png`,
        description: "کالا هایی که به روش پستی ارسال می شوند باید هنگام دریافت از مامور پست توسط گیرنده بازدید شوند که بسته ضربه خوردگی یا آسیب فیزیکی نداشته باشد",
        ShopId: newShop._id,
        CreatedBy: userData.id,
      },
      {
        SendMetodStatus:true,
        Title: "تیپاکس",
        Price: "پس کرایه",
        imageUrl:`${process.env.NEXTAUTH_URL}/Uploads/tipaxLogo.webp`,
        description: "کالا هایی که به روش تیپاکس ارسال می شوند باید هنگام دریافت از مامور تیپاکس توسط گیرنده بازدید شوند که بسته ضربه خوردگی یا آسیب فیزیکی نداشته باشد",
        ShopId: newShop._id,
        CreatedBy: userData.id,
      }
    ];

    // -----------------------------


    // ایجاد حساب‌های پیش‌فرض با استفاده از نشست تراکنش
    await Account.insertMany(defaultAccounts, { session });
    await Contact.insertMany(defaultContact, { session });
    await RoleInShop.insertMany(defaultRoleinShop, { session });
    await rolePerimision.insertMany(defaultRoles, { session });
    await PriceTemplate.insertMany(defaultPriceTemplate, { session });
    await SendMetod.insertMany(defaultShippingMethods, { session });

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

    if (!(await hasUserAccessToEditAndDeleteShop(userData.id))) {
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

    if (!(await hasUserAccessToEditAndDeleteShop(userData.id))) {
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
      BaseCurrency: Shop?.BaseCurrency?.toString(),
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
        BaseCurrency: Shop?.BaseCurrency?.toString()|| null,
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

// async function DeleteShops(ShopID) {
//   try {
//     await connectDB();
//     let userData;
//     try {
//       userData = await authenticateUser();
//     } catch (authError) {
//       userData = null;
//       console.log("Authentication failed:", authError);
//     }
//   if (!userData) {
//     return { status: 401, message: 'کاربر وارد نشده است.' };
//   }
//     const Shop = await shops.findById(ShopID);

//     if (!Shop) {
//       throw new Error("فروشگاه مورد نظر یافت نشد");
//     }

//     if (!(await hasUserAccessToEditAndDeleteShop(Shop.CreatedBy))) {
//       throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
//     }

//       // به‌روزرسانی حذف امن
//       const result = await shops.updateOne(
//         { _id: ShopID },
//         {
//           $set: {
//             is_deleted: true,
//             deleted_by: userData.id, // شناسه کاربر حذف‌کننده
//             deleted_at: new Date(), // زمان حذف
//           },
//         }
//       );
  
//       if (result.nModified === 0) {
//         throw new Error("فروشگاه مورد نظر حذف نشد");
//       }

//     const deleteStatus=deleteOldImage(Shop.LogoUrl)
//     if (deleteStatus.status!==200) {
//       console.error("خطا در حذف فایل تصویر:");
//       throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
//      }
 
//      const deleteStatus2=deleteOldImage(Shop.TextLogoUrl)
//      if (deleteStatus2.status!==200) {
//        console.error("خطا در حذف فایل تصویر:");
//        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
//       }  
//          const deleteStatus3=deleteOldImage(Shop.BackGroundShopUrl)
//      if (deleteStatus3.status!==200) {
//        console.error("خطا در حذف فایل تصویر:");
//        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
//       }  
//              const deleteStatus4=deleteOldImage(Shop.BackGroundpanelUrl)
//      if (deleteStatus4.status!==200) {
//        console.error("خطا در حذف فایل تصویر:");
//        throw new Error("خطای سرور، حذف فایل تصویر انجام نشد");
//       }
 

//     return { message: "فروشگاه و فایل تصویر با موفقیت حذف شدند", status: 200 };
//   } catch (error) {
//     console.error("خطا در حذف فروشگاه:", error);
//     return { error: error.message, status: 500 };
//   }
// }
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

    if (!(await hasUserAccessToEditAndDeleteShop(userData.id))) {
            throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

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

    // لیست URL‌های تصاویر برای حذف
    const imageUrls = [
      Shop.LogoUrl,
      Shop.TextLogoUrl,
      Shop.BackGroundShopUrl,
      Shop.BackGroundpanelUrl,
    ].filter(url => !!url); // فیلتر کردن URL های null یا undefined

    console.log("Image URLs to delete:", imageUrls);

    // حذف موازی تصاویر
    const deletePromises = imageUrls.map(async (url) => {
      console.log(`Deleting image: ${url}`);
      const deleteStatus = await deleteOldImage(url);
      if (deleteStatus.status !== 200) {
        console.error(`خطا در حذف فایل تصویر برای URL: ${url} - ${deleteStatus.message}`);
        // به جای پرتاب خطا، می‌توانید پیام خطا را ذخیره کنید
        return { url, success: false, message: deleteStatus.message };
      } else {
        console.log(`حذف فایل تصویر موفق: ${url}`);
        return { url, success: true };
      }
    });

    // اجرای همه حذف‌ها
    const deleteResults = await Promise.all(deletePromises);

    // بررسی نتایج حذف
    const failedDeletes = deleteResults.filter(result => !result.success);
    if (failedDeletes.length > 0) {
      return { 
        message: "فروشگاه حذف شد، ولی برخی تصاویر حذف نشدند.",
        status: 207, // Multi-Status
        details: failedDeletes
      };
    }

    return { message: "فروشگاه و تمام فایل‌های تصویر با موفقیت حذف شدند", status: 200 };
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
      return { message: 'Shop not found' ,  status: 404 };
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
export async function GetShopInfo(shopId) {

  // اتصال به پایگاه داده
  await connectDB();
  try {
    // یافتن فروشگاه بر اساس shopId
    const shop = await shops.findById(shopId).populate({
      path: 'BaseCurrency',
      select: '_id title shortName exchangeRate decimalPlaces ', // انتخاب فیلدهای مورد نیاز از مدل ارز
    })
    .select("_id ShopUniqueName ShopName LogoUrl TextLogoUrl BackGroundShopUrl BackGroundpanelUrl BaseCurrency" )
    .lean();

    if (!shop) {
      return { message: 'Shop not found' ,  status: 404 };
    }
    const serializedShop = {
      ...shop,
      _id: shop._id.toString(),
      BaseCurrency: {
        ...shop.BaseCurrency,
        _id: shop.BaseCurrency._id.toString(),
      },
    };
      return { shop: serializedShop, status: 200 };
      } catch (error) {
    console.error("خطا در دریافت فروشگاه:", error);
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
