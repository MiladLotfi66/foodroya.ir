"use server";
// utils/contactActions.js
import connectDB from "@/utils/connectToDB";
import Contact from "./Contact";
import Account from "@/templates/panel/Account/Account";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import RolePerimision from "../rols/rolePerimision";
import RoleInShop from "../rols/RoleInShop";
import mongoose from "mongoose";
import { p2e } from "@/utils/ReplaceNumber";
import { CheckUserPermissionInShop } from "../rols/RolesPermissionActions";

function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}


export async function GetAllContacts(shopId) {
  
  await connectDB();
  let user;
    try {
      user = await authenticateUser();
    } catch (authError) {
      user = null;
      console.log("Authentication failed:", authError);
    }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

  try {
    const contacts = await Contact.find({ shop: shopId })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('userAccount')
      .populate('RolesId') // اطمینان از واکشی نقش‌ها
      .lean(); // استفاده از lean() برای دریافت اشیاء ساده

    return { status: 200, contacts: convertToPlainObjects(contacts) };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { status: 500, message: 'خطایی در دریافت مخاطبها رخ داد.' };
  }
}


export async function AddContactAction(formData) {
  await connectDB();
  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.log("Authentication failed:", authError);
  }

if (!user) {
  return { status: 401, message: 'کاربر وارد نشده است.' };
}


  let { 
    name,
    address,
    phoneNumber,
    email,
    nationalId,
    economicCode,
    userAccount,
    ShopId,
    roles // دریافت نقش‌ها
  } = Object.fromEntries(formData.entries());
  // پردازش نقش‌ها (اگر به صورت چندگانه ارسال شده‌اند)
      const hasAccess=await CheckUserPermissionInShop(ShopId,"contactsPermissions","add")
      if (!hasAccess.hasPermission) {
         return { status: 401, message: 'شما دسترسی لازم را ندارید' };
       } 
  
  const rolesArray = formData.getAll('roles'); // دریافت تمام نقش‌ها به صورت آرایه

  // اعتبارسنجی نقش‌ها
  if (rolesArray && rolesArray.length > 0) {
    const validRoles = await RolePerimision.find({ _id: { $in: rolesArray }, ShopId });
    if (validRoles.length !== rolesArray.length) {
      return { status: 400, message: 'یکی یا چند نقش انتخاب شده معتبر نیستند.' };
    }
  }

  // اعتبارسنجی فیلدهای الزامی
  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
    return { status: 400, message: 'شماره تماس الزامی است و باید بین 10 تا 15 رقم باشد.' };
  }

  // اعتبارسنجی فیلدهای اختیاری
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, message: 'ایمیل باید معتبر باشد.' };
  }

  if (nationalId) {
    nationalId = p2e(nationalId);
    if (!/^\d{10}$/.test(nationalId)) {
      return { status: 400, message: 'شماره ملی باید 10 رقم باشد.' };
    }
  }
  
  if (economicCode) {
    economicCode = p2e(economicCode);
    if (!/^\d{10}$/.test(economicCode)) {
      return { status: 400, message: 'کد اقتصادی باید 10 رقم باشد.' };
    }
  }

  // اعتبارسنجی userAccount در صورت نیاز
  if (userAccount && !mongoose.Types.ObjectId.isValid(userAccount)) {
    return { status: 400, message: 'حساب کاربری نامعتبر است.' };
  }

  // پاک‌سازی فیلدهای خالی
  const contactData = {
    name,
    address: address || undefined,
    phone: phoneNumber,
    email: email || undefined,
    nationalId: nationalId || undefined,
    economicCode: economicCode || undefined,
    userAccount: userAccount || undefined,
    RolesId: rolesArray, // اضافه کردن نقش‌ها
    createdBy: user.id,
    updatedBy: user.id,
    shop: ShopId,
  };

  if (userAccount) {
    const existingContactByUserAndShop = await Contact.findOne({ shop: ShopId, userAccount: userAccount }).lean();
    if (existingContactByUserAndShop) {
      
      return { status: 400, message: `برای این کاربر دراین غرفه قبلا مخاطبی به نام ${existingContactByUserAndShop?.name} ایجاد شده است `};
    }
  }
 
  // بررسی یکتایی نام مخاطب
  const existingContact = await Contact.findOne({ name  , shop : ShopId}).lean();
  if (existingContact) {
    return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
  }


  // شروع تراکنش
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();

    // ایجاد مستندات RoleInShop برای هر نقش
    if (rolesArray && rolesArray.length > 0) {
      const roleInShopDocs = rolesArray.map(roleId => ({
        ContactId: savedContact._id,
        ShopId: ShopId,
        RoleId: roleId,
        LastEditedBy: user.id,
        CreatedBy: user.id,
      }));
      await RoleInShop.insertMany(roleInShopDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const plainContact = JSON.parse(JSON.stringify(savedContact));
    return { status: 201, contact: plainContact };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error adding contact:", error);
    return { status: 500, message: 'خطایی در ایجاد مخاطب رخ داد.' };
  }
}

export async function EditContactAction(formData) {
  await connectDB();
  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.log("Authentication failed:", authError);
  }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  
  let { 
    id,
    name,
    address,
    phoneNumber,
    email,
    nationalId,
    economicCode,
    userAccount,
    ShopId,
    roles // دریافت نقش‌ها
  } = Object.fromEntries(formData.entries());

  const hasAccess=await CheckUserPermissionInShop(ShopId,"contactsPermissions","edit")
  if (!hasAccess.hasPermission) {
     return { status: 401, message: 'شما دسترسی لازم را ندارید' };
   } 

  // پردازش نقش‌ها (اگر به صورت چندگانه ارسال شده‌اند)
  const rolesArray = formData.getAll('roles'); // دریافت تمام نقش‌ها به صورت آرایه

  // اعتبارسنجی نقش‌ها
  // اعتبارسنجی شناسه‌های نقش
  const areRoleIdsValid = rolesArray.every(id => mongoose.Types.ObjectId.isValid(id));
  if (!areRoleIdsValid) {
    return { status: 400, message: 'یکی یا چند شناسه نقش نامعتبر است.' };
  }
  // اعتبارسنجی نقش‌ها با استفاده از مدل یکسان (Role)
  const validRoles = await RolePerimision.find({ _id: { $in: rolesArray }, ShopId });
  if (validRoles.length !== rolesArray.length) {
    return { status: 400, message: 'یکی یا چند نقش انتخاب شده معتبر نیستند.' };
  }
    
  // اعتبارسنجی فیلدهای الزامی
  if (!phoneNumber || typeof phoneNumber !== 'string' || !/^\d{10,15}$/.test(phoneNumber)) {
    return { status: 400, message: 'شماره تماس الزامی است و باید بین 10 تا 15 رقم باشد.' };
  }

  // اعتبارسنجی فیلدهای اختیاری
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, message: 'ایمیل باید معتبر باشد.' };
  }

  if (nationalId) {
    nationalId = p2e(nationalId);
    if (!/^\d{10}$/.test(nationalId)) {
      return { status: 400, message: 'شماره ملی باید 10 رقم باشد.' };
    }
  }
  
  if (economicCode) {
    economicCode = p2e(economicCode);
    if (!/^\d{10}$/.test(economicCode)) {
      return { status: 400, message: 'کد اقتصادی باید 10 رقم باشد.' };
    }
  }

  // اعتبارسنجی userAccount در صورت نیاز
  if (userAccount && !mongoose.Types.ObjectId.isValid(userAccount)) {
    return { status: 400, message: 'حساب کاربری نامعتبر است.' };
  }

  // یافتن مخاطب موجود
  const existingContact = await Contact.findById(id);
  if (!existingContact) {
    return { status: 404, message: 'مخاطب پیدا نشد.' };
  }

  // بررسی یکتایی ترکیب shop و userAccount (در صورت تغییر)
  const newShopId = ShopId || existingContact.shop;
  const newUserAccount = userAccount || existingContact.userAccount;

  // اگر ترکیب shop یا userAccount تغییر کرده باشد، بررسی یکتایی کنید
  if (
    (ShopId && ShopId !== existingContact.shop.toString()) ||
    (userAccount && userAccount !== existingContact.userAccount?.toString())
  ) {
    const duplicateContact = await Contact.findOne({ 
      shop: newShopId, 
      userAccount: newUserAccount,
      _id: { $ne: id } // اطمینان از اینکه مخاطب فعلی را در نظر نمی‌گیرد
    }).lean();
    if (duplicateContact) {
      
      return { status: 400, message: `رای این کاربر در این فروشگاه قبلاً مخاطب دیگری به نام ${duplicateContact.name} ایجاد شده است.` };
    }
  }

  // بررسی یکتایی نام مخاطب اگر تغییر کرده باشد
  if (name && name !== existingContact.name) {
    const contactWithName = await Contact.findOne({ name, shop: newShopId }).lean();
    if (contactWithName) {
      return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
    }
  }

  // بررسی یکتایی nationalId اگر تغییر کرده باشد
  if (nationalId && nationalId !== existingContact.nationalId) {
    const contactWithNationalId = await Contact.findOne({ nationalId }).lean();
    if (contactWithNationalId) {
      return { status: 400, message: 'شماره ملی باید منحصر به فرد باشد.' };
    }
  }

  // آماده‌سازی داده‌های آپدیت
  const updateData = {
    name: name || existingContact.name,
    address: address || existingContact.address,
    phone: phoneNumber,
    email: email !== undefined ? email : existingContact.email,
    nationalId: nationalId !== undefined ? nationalId : existingContact.nationalId,
    economicCode: economicCode !== undefined ? economicCode : existingContact.economicCode,
    userAccount: newUserAccount,
    RolesId: rolesArray, // اضافه کردن نقش‌ها
    shop: newShopId,
    updatedBy: user.id,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // به‌روزرسانی مخاطب
    const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true, session })
      .populate('shop')
      .populate('createdBy')
      .populate('updatedBy')
      .populate('userAccount')
      .lean();

    // به‌روزرسانی نقش‌ها در RoleInShop
    // ابتدا نقش‌های فعلی را پیدا کنید
    const existingRoles = await RoleInShop.find({ ContactId: id, ShopId: newShopId }).session(session).lean();
    const existingRoleIds = existingRoles.map(r => r.RoleId.toString());

    // نقش‌های جدیدی که باید اضافه شوند
    const rolesToAdd = rolesArray.filter(role => !existingRoleIds.includes(role));

    // نقش‌هایی که باید حذف شوند
    const rolesToRemove = existingRoleIds.filter(role => !rolesArray.includes(role));

    // اضافه کردن نقش‌های جدید
    if (rolesToAdd.length > 0) {
      const newRoleInShopDocs = rolesToAdd.map(roleId => ({
        ContactId: id,
        ShopId: newShopId,
        RoleId: roleId,
        LastEditedBy: user.id,
        CreatedBy: user.id,
      }));
      await RoleInShop.insertMany(newRoleInShopDocs, { session });
    }

    // حذف نقش‌هایی که دیگر تعلق ندارند
    if (rolesToRemove.length > 0) {
      await RoleInShop.deleteMany({ ContactId: id, RoleId: { $in: rolesToRemove } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    const plainContact = convertToPlainObjects([updatedContact])[0];
    return { status: 200, contact: plainContact };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error editing contact:", error);
    if (error.code === 11000) { // خطای Duplicate Key
      if (error.keyPattern.name) {
        return { status: 400, message: 'نام مخاطب باید منحصر به فرد باشد.' };
      }
      if (error.keyPattern.userAccount && error.keyPattern.shop) {
        return { status: 400, message: 'برای این کاربر در این فروشگاه قبلاً مخاطبی ایجاد شده است.' };
      }
      if (error.keyPattern.nationalId) {
        return { status: 400, message: 'شماره ملی باید منحصر به فرد باشد.' };
      }
    }
    return { status: 500, message: 'خطایی در ویرایش مخاطب رخ داد.' };
  }
}


export async function DeleteContacts(contactId) {
  await connectDB();
  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    user = null;
    console.log("Authentication failed:", authError);
  }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // بررسی وابستگی‌ها
    const linkedAccount = await Account.findOne({ contact: contactId }).session(session).exec();
    if (linkedAccount) {
      return { status: 500, message: 'این مخاطب در حساب‌ها استفاده شده است و قابل حذف نیست.' };
    }

    // حذف مخاطب
    const result = await Contact.findOneAndDelete({ _id: contactId }).session(session).exec();
    if (!result) {
      return { status: 404, message: 'مخاطب یافت نشد.' };
    }
      const hasAccess=await CheckUserPermissionInShop(result.shop,"contactsPermissions","delete")
      if (!hasAccess.hasPermission) {
         return { status: 401, message: 'شما دسترسی لازم را ندارید' };
       } 

    // حذف نقش‌های مرتبط در RoleInShop
    await RoleInShop.deleteMany({ ContactId: contactId }).session(session).exec();

    // تایید تراکنش
    await session.commitTransaction();
    session.endSession();
    return { status: 200, message: 'مخاطب با موفقیت حذف شد.' };
  } catch (error) {
    // بازگرداندن تراکنش در صورت خطا
    await session.abortTransaction();
    session.endSession();
    console.error('خطا در حذف مخاطب:', error.message);
    return { status: 500, message: 'خطایی در حذف مخاطب رخ داد.' };
  }
}

export async function GetUserRolesInShop(shopId) {
  
  await connectDB();
  let user;
    try {
      user = await authenticateUser();
    } catch (authError) {
      user = null;
      console.log("Authentication failed:", authError);
    }

  if (!user) {
    return { status: 401, message: 'کاربر وارد نشده است.' };
  }
  

  try {
    const contacts = await Contact.find({ shop: shopId , userAccount:user.id })
    .populate('RolesId', 'RoleTitle') // انتخاب فقط RoleTitle
    .select('RolesId') // انتخاب فقط فیلد RolesId
    .lean();
    
    const roles = contacts.flatMap(contact =>
      contact.RolesId.map(role => ({
        id: role._id,
        title: role.RoleTitle
      })))

    // حذف تکراری‌ها (در صورت نیاز)

    return { status: 200, roles: roles };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { status: 500, message: 'خطایی در دریافت مخاطب‌ها رخ داد.' };
  }
}

