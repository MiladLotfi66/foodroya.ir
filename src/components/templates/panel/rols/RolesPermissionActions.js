"use server";
import RolePerimision from "@/templates/panel/rols/rolePerimision";
import connectDB from "@/utils/connectToDB";
import { cookies } from "next/headers";
import RoleSchema from "@/utils/yupSchemas/RoleSchema";
import RoleInShop from "@/templates/panel/rols/RoleInShop";
import Shop from "@/templates/Shop/shops";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import Contact from "../Contact/Contact";
import mongoose from "mongoose";


export async function AddRoleToContact(ContactId, ShopId, RoleId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // اتصال به دیتابیس
    await connectDB();
    
    // اعتبارسنجی ShopId
    if (!ShopId) {
      throw new Error("shopId is required in RoleData");
    }

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

    // ایجاد رکورد جدید در RoleInShop
    const newRoleInShop = new RoleInShop({
      ContactId,
      ShopId,
      RoleId,
      CreatedBy: userData.id,
      LastEditedBy: userData.id, // فرض بر این است که خالق همان شخص آخرین ویرایشگر است
    });

    await newRoleInShop.save({ session });

    // بروزرسانی Contact.RolesId
    await Contact.findByIdAndUpdate(
      ContactId,
      { $addToSet: { RolesId: RoleId } }, // از $addToSet استفاده می‌کنیم تا از افزودن تکراری جلوگیری شود
      { new: true, session }
    );

    // تکمیل تراکنش
    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'رکورد جدید با موفقیت ذخیره شد.' };
  } catch (error) {
    // لغو تراکنش در صورت خطا
    await session.abortTransaction();
    session.endSession();
    console.error('خطا در ذخیره رکورد:', error);
    return { success: false, message: 'خطا در ذخیره رکورد', error };
  }
}

export async function RemoveContactFromRole(ContactId, ShopId, RoleId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // اتصال به دیتابیس
    await connectDB();
    
    // اعتبارسنجی ShopId
    if (!ShopId) {
      throw new Error("shopId is required in RoleData");
    }

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

    // پیدا کردن و حذف رکورد در RoleInShop
    const result = await RoleInShop.findOneAndDelete({
      ContactId,
      ShopId,
      RoleId
    }, { session });

    if (!result) {
      throw new Error('Record not found');
    }

    // بروزرسانی Contact.RolesId
    await Contact.findByIdAndUpdate(
      ContactId,
      { $pull: { RolesId: RoleId } }, // از $pull برای حذف نقش استفاده می‌کنیم
      { new: true, session }
    );

    // تکمیل تراکنش
    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'رکورد با موفقیت حذف شد.' };
  } catch (error) {
    // لغو تراکنش در صورت خطا
    await session.abortTransaction();
    session.endSession();
    console.error('خطا در حذف رکورد:', error);
    return { success: false, message: 'خطا در حذف رکورد', error };
  }
}

// بررسی دسترسی کاربر
const hasContactAccess = async (contactId) => {
  try {
    await connectDB();
    return true; // در اینجا می‌توانید منطق دسترسی را تعریف کنید
  } catch (error) {
    console.error("Error in hasContactAccess function:", error);
    return false;
  }
};

// افزودن نقش
export async function AddRoleServerAction(RoleData) {
  try {
    await connectDB();

    // استخراج ShopUnicName از RoleData
    const { ShopId } = RoleData;

    // دریافت آی‌دی شاپ
    if (!ShopId) {
      throw new Error("shopId is required in RoleData");
    }

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
    const validatedData = await RoleSchema.validate(RoleData, {
      abortEarly: false,
    });

    const newRole = new RolePerimision({
      ...validatedData,
      ShopId: ShopId, // ذخیره آی‌دی شاپ در دیتابیس
      CreatedBy: userData.id,
      LastEditedBy: userData.id,
    });

    await newRole.save();

    return { message: "نقش با موفقیت ثبت شد", status: 201 };
  } catch (error) {
    console.error("Error in AddRoleServerAction:", error);
    return { error: error.message, status: 500 };
  }
}

// ویرایش نقش
// تعریف ثابت برای عنوان نقش مدیر کل
const MANAGER_ALL_ROLE_TITLE = "مدیر کل"; // اطمینان حاصل کنید که این عنوان دقیقاً با عنوان نقش مدیر کل در پایگاه داده شما مطابقت دارد

// تابع مقایسه آرایه‌ها برای بررسی تغییرات در rolesPermissions
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
};

export async function EditRole(RoleData, roleId) {
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

    if (!roleId) {
      return { status: 400, message: "آی‌دی نقش ارسال نشده است." };
    }

    const Role = await RolePerimision.findById(roleId);

    if (!Role) {
      return { status: 404, message: "نقشی با این آی‌دی یافت نشد." };
    }

    // بررسی دسترسی کاربر
    if (!await hasContactAccess(Role.CreatedBy)) {
      return { status: 403, message: "شما دسترسی لازم برای این عملیات را ندارید." };
    }

    // بررسی و جلوگیری از تغییر rolesPermissions برای نقش "مدیر کل"
    if (Role.RoleTitle === MANAGER_ALL_ROLE_TITLE) {
      if ('rolesPermissions' in RoleData) {
        if (!arraysEqual(RoleData.rolesPermissions, Role.rolesPermissions)) {
          return { 
            status: 400, 
            message: 'نقش مدیر کل قابل تغییر در قسمت نقش‌ها نیست.' 
          };
        }
        // حذف rolesPermissions از RoleData تا از تغییرات جلوگیری شود
        delete RoleData.rolesPermissions;
      }
    }

    // اعتبارسنجی داده‌ها
    const validatedData = await RoleSchema.validate(
      {
        RoleTitle: RoleData.RoleTitle,
        RoleStatus: RoleData.RoleStatus,
        bannersPermissions: RoleData.bannersPermissions,
        rolesPermissions: RoleData.rolesPermissions,  
        sendMethodPermissions: RoleData.sendMethodPermissions,
        accountsPermissions: RoleData.accountsPermissions,
        contactsPermissions: RoleData.contactsPermissions,
        priceTemplatesPermissions: RoleData.priceTemplatesPermissions,
        productsPermissions: RoleData.productsPermissions,
        financialDocumentsPermissions: RoleData.financialDocumentsPermissions,
        sendMethodsPermissions: RoleData.sendMethodsPermissions,
        purchaseInvoicesPermissions: RoleData.purchaseInvoicesPermissions,
        saleInvoicesPermissions: RoleData.saleInvoicesPermissions,
        purchaseReturnInvoicesPermissions: RoleData.purchaseReturnInvoicesPermissions,
        saleReturnInvoicesPermissions: RoleData.saleReturnInvoicesPermissions,
        wasteInvoicesPermissions: RoleData.wasteInvoicesPermissions,
        allInvoicesPermissions: RoleData.allInvoicesPermissions,
      },
      { abortEarly: false }
    );

    // اگر نقش مدیر کل بود، مطمئن شوید که rolesPermissions حذف شده‌اند از داده‌های به‌روز شده
    if (Role.RoleTitle === MANAGER_ALL_ROLE_TITLE) {
      delete validatedData.rolesPermissions;
    }

    const updatedRole = {
      ...validatedData,
      LastEditedBy: userData.id,
    };

    await RolePerimision.findByIdAndUpdate(roleId, updatedRole, { new: true });
    return { message: "ویرایش نقش با موفقیت انجام شد.", status: 200 };
  } catch (error) {
    console.error("خطا در ویرایش نقش:", error);
    return { error: error.message || "خطای سرور.", status: 500 };
  }
}


// حذف نقش
export async function DeleteRole(RoleID) {
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
  
  const Role = await RolePerimision.findById(RoleID);

  if (!Role) {
    return { status: 404, message: "نقش مورد نظر یافت نشد." };
  }

  // بررسی اینکه نقش مدیر کل نباید حذف شود
  // فرض می‌کنیم فیلد نام نقش 'name' باشد، در صورت نیاز تغییر دهید
  if (Role.RoleTitle === 'مدیر کل') { // یا هر نام دیگری که برای نقش مدیر کل استفاده می‌کنید
    return { status: 400, message: 'نقش مدیر کل قابل حذف نیست.' };
  }


    await RolePerimision.deleteOne({ _id: RoleID });

    return { message: "نقش با موفقیت حذف شد", status: 200 };
  } catch (error) {
    console.error("خطا در حذف نقش:", error);
    return { error: error.message, status: 500 };
  }
}

// فعال‌سازی نقش
export async function EnableRole(RoleID) {
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
    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasContactAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Role.RoleStatus = true;

    await Role.save();

    return {
      message: "وضعیت نقش با موفقیت به true تغییر یافت",
      status: 200,
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

// غیرفعال‌سازی نقش
export async function DisableRole(RoleID) {
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
    const Role = await RolePerimision.findById(RoleID);

    if (!Role) {
      throw new Error("نقشی با این آی‌دی یافت نشد");
    }

    if (!await hasContactAccess(Role.CreatedBy)) {
      throw new Error("شما دسترسی لازم برای این عملیات را ندارید");
    }

    Role.RoleStatus = false;

    await Role.save();

    return {
      message: "وضعیت نقش با موفقیت به false تغییر یافت",
      status: 200,
    };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

export async function GetAllFollowedUsers(ShopId){
  try {
  await connectDB()

  const shop = await Shop.findOne({ _id : ShopId }).populate({path: 'followers', select: 'username'}).lean();
  
  const followers = shop.followers?.map(follower => ({
    ...follower,
    _id: follower._id.toString(), // تبدیل ObjectId به رشته
  }));


  return { "status": 200, "data": followers }; // فقط لیست کاربران را برگردانید



} catch (error) {
  console.error("خطا در دریافت فالور ها:", error);
  return { error: error.message, status: 500 };
}
}

export async function GetAllFollowedUsersWithRoles(ShopId, roleId) {
  try {
    await connectDB();
console.log("ShopId",ShopId);

    // دریافت فالورهای فروشگاه
    const shop = await Shop.findOne({ _id: ShopId })
      .populate({ path: 'followers', select: 'name userImage' })
      .lean();

    const followersWithRoles = await Promise.all(
      shop.followers?.map(async (follower) => {
        // بررسی اینکه آیا این فالور برای این فروشگاه نقش خاصی دارد یا خیر
        const roleInShop = await RoleInShop.findOne({
          ContactId: follower._id,
          ShopId: ShopId,
          RoleId: roleId,
        });

        return {
          ...follower,
          _id: follower._id.toString(),
          hasRole: !!roleInShop, // اگر نقش وجود داشت، مقدار true برمی‌گرداند
        };
      })
    );

    return { status: 200, data: followersWithRoles };
  } catch (error) {
    console.error("خطا در دریافت فالورها و بررسی نقش:", error);
    return { error: error.message, status: 500 };
  }
}

export async function GetAllContactsWithRoles(ShopId, roleId) {
  try {
    await connectDB();

    // اعتبارسنجی ورودی‌ها
    if (!ShopId || !roleId) {
      return { status: 400, error: "شناسه غرفه و شناسه نقش الزامی است." };
    }

    // دریافت تمامی مخاطبین مربوط به غرفه
    const ShopContacts = await Contact.find({ shop: ShopId }).lean();
    console.log("ShopContacts", ShopContacts);

    // اگر هیچ مخاطبی پیدا نشود
    if (!ShopContacts || ShopContacts.length === 0) {
      return { status: 404, error: "هیچ مخاطبی برای این غرفه پیدا نشد." };
    }

    // تهیه لیستی از شناسه مخاطبین
    const contactIds = ShopContacts.map(contact => contact._id);

    // دریافت نقش‌هایی که مخاطبین با شناسه‌های مشخص شده برای نقش داده شده دارند
    const rolesInShop = await RoleInShop.find({
      ShopId: ShopId,
      RoleId: roleId,
      ContactId: { $in: contactIds }
    }).select('ContactId').lean();

    // استخراج شناسه مخاطبین که نقش مشخص شده را دارند
    const contactsWithRoleIds = rolesInShop.map(role => role.ContactId.toString());

    // علامت‌گذاری مخاطبین با بررسی اینکه آیا شناسه آن‌ها در لیست دارند یا خیر
    const contactsWithRoles = ShopContacts.map(contact => ({
      ...contact,
      _id: contact._id.toString(),
      hasRole: contactsWithRoleIds.includes(contact._id.toString())
    }));

    return { status: 200, data: contactsWithRoles };
  } catch (error) {
    console.error("خطا در دریافت مخاطبین و بررسی نقش‌ها:", error);
    return { error: error.message, status: 500 };
  }
}

export async function GetShopRolesByShopId(ShopId) {
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

    if (!ShopId) {
      throw new Error("ShopId not found");
    }

    const Roles = await RolePerimision.find({ ShopId }).lean();

    // تبدیل فیلدهای خاص به plain strings
    const plainRoles = Roles?.map(role => ({
      ...role,
      _id: role._id.toString(),
      ShopId: role.ShopId.toString(),  // تبدیل ShopId به رشته
      CreatedBy: role.CreatedBy.toString(),
      LastEditedBy: role.LastEditedBy.toString(),
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    }));

    return { Roles: plainRoles, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت نقش‌ها:", error);
    return { error: error.message, status: 500 };
  }
}



export async function GetShopIdByShopUniqueName(ShopUniqueName) {

  try {
    await connectDB();
    
    const shop = await Shop.findOne({ ShopUniqueName }).lean();

    if (!shop) {
      throw new Error("شاپ با این نام پیدا نشد");
    }

    return { status: 200, ShopID: shop._id.toString() }; // آی‌دی شاپ و وضعیت را برگردان
  } catch (error) {
    console.error(`خطا در بازیابی آی‌دی شاپ: ${error.message}`);
    throw new Error("مشکلی در بازیابی آی‌دی شاپ وجود دارد");
  }
}

export async function  getContactsByRoleId (roleId) {
  try {
    await connectDB();
    // const rolesInShop = await RoleInShop.find({ RoleId: roleId }).populate('ContactId');
    const rolesInShop = await RoleInShop.find({ RoleId: roleId }) .populate({
      path: 'ContactId',
      select: '_id name'
    });

    const contacts = rolesInShop?.map(roleInShop => {
      const contact = roleInShop.ContactId;
      return contact ? { _id: contact._id.toString(), name: contact.name } : null;
    }).filter(contact => contact !== null); // حذف موارد null

    // بررسی داده‌های برگردانده شده

    return contacts;
  } catch (error) {
    console.error("Error fetching contact names by RoleId:", error.message);
     throw new Error("Error fetching contact names by RoleId");
  }
};

export async function GetContactRolsAtShop({ contactId, shopId }) {
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
  }    // یافتن نقش‌های کاربر در فروشگاه خاص
    const rolesInShop = await RoleInShop.find({ ContactId: contactId, ShopId: shopId }).populate('RoleId');
    
    // استخراج آی‌دی‌های نقش‌ها و ایجاد یک آرایه
    const roleIds = rolesInShop?.map(item => item.RoleId._id.toString());

    return { message: "Roles retrieved successfully", status: 200, data: roleIds };
  } catch (error) {
    console.error("Error in GetContactRolesAtShop action:", error.message);
    return { error: error.message, status: 500 };
  }
}

export async function CheckRolePermissionsServerAction({ roles, action, access }) {
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
 

    for (const roleId of roles) {
      const roleData = await RolePerimision.findOne({ _id: roleId }).lean();
      if (roleData) {
        if (access in roleData && roleData[access].includes(action)) {
          // دسترسی داینامیک
          return { message: "Permission granted", status: 200, data: true };
        }
      }
    }

    
    return { message: "Permission denied", status: 200, data: false };
  } catch (error) {
    console.error("Error in CheckRolePermissions action:", error.message);
    return { error: error.message, status: 500 };
  }
}


export async function GetUserPermissionsInShop(shopId) {
  await connectDB();

  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    // یافتن مخاطب‌ها (Contact) مربوط به کاربر در فروشگاه مشخص شده
    const contacts = await Contact.find({ shop: shopId, userAccount: user.id })
      .populate('RolesId') // پرpopulate کردن نقش‌ها
      .lean();

    if (contacts.length === 0) {
      return { status: 403, message: 'کاربر در این فروشگاه نقشی ندارد.' };
    }

    // استخراج تمام نقش‌های کاربر در فروشگاه
    const roles = contacts.flatMap(contact => contact.RolesId);

    if (roles.length === 0) {
      return { status: 403, message: 'کاربر هیچ نقشی در این فروشگاه ندارد.' };
    }

    // تعریف فیلدهای مرتبط با دسترسی‌ها
    const permissionFields = [
      'bannersPermissions',
      'rolesPermissions',
      'sendMethodPermissions',
      'accountsPermissions',
      'contactsPermissions',
      'priceTemplatesPermissions',
      'productsPermissions',
      'financialDocumentsPermissions',
      'sendMethodsPermissions',
      'purchaseInvoicesPermissions',
      'saleInvoicesPermissions',
      'purchaseReturnInvoicesPermissions',
      'saleReturnInvoicesPermissions',
      'allInvoicesPermissions',
      'wasteInvoicesPermissions',
    ];

    // شیء برای ذخیره دسترسی‌های ترکیبی
    const aggregatedPermissions = {};

    // مقداردهی اولیه به فیلدهای دسترسی
    permissionFields.forEach(field => {
      aggregatedPermissions[field] = new Set(); // استفاده از Set برای حذف دسترسی‌های تکراری
    });

    // پیمایش و جمع‌آوری دسترسی‌ها از تمامی نقش‌ها
    roles.forEach(role => {
      permissionFields.forEach(field => {
        if (Array.isArray(role[field])) {
          role[field].forEach(permission => aggregatedPermissions[field].add(permission));
        }
      });
    });

    // تبدیل Set به آرایه برای بازگرداندن خروجی نهایی
    permissionFields.forEach(field => {
      aggregatedPermissions[field] = Array.from(aggregatedPermissions[field]);
    });

    return { status: 200, permissions: aggregatedPermissions };
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return { status: 500, message: "خطایی در دریافت دسترسی‌ها رخ داده است." };
  }
}


export async function GetUserRolesInShop(shopId) {
  // اتصال به دیتابیس
  await connectDB();

  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    // یافتن مخاطب‌ها (Contacts) مربوط به کاربر در فروشگاه مشخص شده
    const contacts = await Contact.find({ shop: shopId, userAccount: user.id })
      .populate('RolesId', 'RoleTitle') // پرکردن فیلد RolesId با RoleTitle
      .select('RolesId') // انتخاب فقط فیلد RolesId
      .lean();

    if (contacts.length === 0) {
      return { status: 404, message: 'کاربر در این فروشگاه نقشی ندارد.' };
    }

    // استخراج نقش‌ها از مخاطب‌ها
    const roles = contacts.flatMap(contact => contact.RolesId.map(role => ({
      id: role._id,
      title: role.RoleTitle
    })));

    // حذف تکراری‌ها (اختیاری)
    const uniqueRoles = Array.from(new Map(roles.map(role => [role.id.toString(), role])).values());

    return { status: 200, roles: uniqueRoles };
  } catch (error) {
    console.error("Error fetching user roles in shop:", error);
    return { status: 500, message: 'خطایی در دریافت نقش‌های کاربر رخ داد.' };
  }
}


export async function CheckUserPermissionInShop(shopId, accessName, actionName) {
  // اتصال به دیتابیس
  await connectDB();

  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    // یافتن مخاطب‌ها (Contacts) مربوط به کاربر در فروشگاه مشخص شده
    const contacts = await Contact.find({ shop: shopId, userAccount: user.id })
      .populate('RolesId') // پرpopulate کردن نقش‌ها
      .select('RolesId') // انتخاب فقط فیلد RolesId
      .lean();

    if (contacts.length === 0) {
      return { status: 403, message: 'کاربر در این فروشگاه نقشی ندارد.' };
    }

    // استخراج نقش‌ها از مخاطب‌ها
    const roles = contacts.flatMap(contact => contact.RolesId);

    if (roles.length === 0) {
      return { status: 403, message: 'کاربر هیچ نقشی در این فروشگاه ندارد.' };
    }

    // یافتن دسترسی‌ها از تمامی نقش‌ها
    let hasPermission = false;

    for (const role of roles) {
      // بررسی اینکه آیا فیلد دسترسی مورد نظر در نقش وجود دارد
      if (role[accessName] && Array.isArray(role[accessName])) {
        if (role[accessName].includes(actionName)) {
          hasPermission = true;
          break; // اگر یکی از نقش‌ها دسترسی داشته باشد، نیازی به بررسی بیشتر نیست
        }
      }
    }

    if (hasPermission) {
      return { status: 200, hasPermission: true, message: 'دسترسی تأیید شده است.' };
    } else {
      return { status: 200, hasPermission: false, message: 'دسترسی rad نشده است.' };
    }
  } catch (error) {
    console.error("Error checking user permission in shop:", error);
    return { status: 500, message: 'خطایی در بررسی دسترسی کاربر رخ داد.' };
  }
}

export async function getUserPermissionInShopAccessList(shopId, accessName) {
  
  // اتصال به دیتابیس
  await connectDB();

  try {
    // احراز هویت کاربر
    const user = await authenticateUser();
    if (!user) {
      return { status: 401, message: 'کاربر وارد نشده است.' };
    }

    // یافتن مخاطب‌ها (Contacts) مربوط به کاربر در فروشگاه مشخص شده
    const contacts = await Contact.find({ shop: shopId, userAccount: user.id })
      .populate('RolesId') // پرpopulate کردن نقش‌ها
      .select('RolesId') // انتخاب فقط فیلد RolesId
      .lean();

    if (contacts.length === 0) {
      return { status: 403, message: 'کاربر در این فروشگاه نقشی ندارد.' };
    }

    // استخراج نقش‌ها از مخاطب‌ها
    const roles = contacts.flatMap(contact => contact.RolesId);

    if (roles.length === 0) {
      return { status: 403, message: 'کاربر هیچ نقشی در این فروشگاه ندارد.' };
    }

    // استفاده از Set برای جمع‌آوری دسترسی‌ها بدون تکرار
    const permissionsSet = new Set();

    for (const role of roles) {
      // بررسی اینکه آیا فیلد دسترسی مورد نظر در نقش وجود دارد
      if (role[accessName] && Array.isArray(role[accessName])) {
        role[accessName].forEach(permission => permissionsSet.add(permission));
      }
    }

    const hasPermission = Array.from(permissionsSet);

    if (hasPermission.length > 0) {
      return { status: 200, hasPermission, message: 'دسترسی تأیید شده است.' };
    } else {
      return { status: 200, hasPermission, message: 'دسترسی رد نشده است.' };
    }
  } catch (error) {
    console.error("Error checking user permission in shop:", error);
    return { status: 500, message: 'خطایی در بررسی دسترسی کاربر رخ داد.' };
  }
}
