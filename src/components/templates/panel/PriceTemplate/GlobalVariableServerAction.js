"use server";

import connectDB from "@/utils/connectToDB";
import GlobalVariable from "./GlobalVariable";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
import mongoose from 'mongoose';
import { CheckUserPermissionInShop } from "../rols/RolesPermissionActions";
import PriceTemplate from "./PriceTemplate";

function convertToPlainObjects(docs) {
  return docs.map(doc => JSON.parse(JSON.stringify(doc)));
}

// دریافت تمام متغیرهای عمومی یک فروشگاه
export async function GetAllGlobalVariables(shopId) {
    
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

  // بررسی دسترسی کاربر
  const hasAccess = await CheckUserPermissionInShop(shopId, "priceTemplatesPermissions", "view");
  
  if (!hasAccess.hasPermission) {
    return { status: 403, message: 'شما دسترسی لازم را ندارید.' };
  }

  try {
    const globalVariables = await GlobalVariable.find({ shop: shopId })
      .select('-__v')
      .populate([
        {
          path: 'createdBy',
          select: 'name userImage email userUniqName phone'
        },
        {
          path: 'updatedBy',
          select: 'name userImage email userUniqName phone'
        }
      ])
      .lean();

    return { status: 200, globalVariables: convertToPlainObjects(globalVariables) };
  } catch (error) {
    console.error("Error fetching global variables:", error);
    return { status: 500, message: 'خطایی در دریافت متغیرهای عمومی رخ داد.' };
  }
}

// افزودن متغیر عمومی جدید
export async function AddGlobalVariableAction(formData) {
    
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

  const { name, alias, value, description, shopId } = formData;

  // بررسی دسترسی کاربر
  const hasAccess = await CheckUserPermissionInShop(shopId, "priceTemplatesPermissions", "add");

  if (!hasAccess.hasPermission) {
    return { status: 403, message: 'شما دسترسی لازم را ندارید.' };
  }

  // بررسی معتبر بودن نماد اختصاری
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(alias)) {
    return { 
      status: 400, 
      message: 'نماد اختصاری باید با حرف انگلیسی شروع شود و فقط شامل حروف انگلیسی، اعداد و _ باشد.' 
    };
  }

  // بررسی کلمات رزرو شده در regex
  const reservedKeywords = ['b', 'd', 'D', 'f', 'n', 'r', 's', 'S', 't', 'v', 'w', 'W', '0', 'B', 
                           'cX', 'dX', 'kX', 'nX', 'pX', 'uX', 'xX', 'f', 'n', 'r', 't', 'v'];
  
  // بررسی پیشوندهای رزرو شده
  if (reservedKeywords.some(keyword => alias.toLowerCase() === keyword)) {
    return { 
      status: 400, 
      message: `نماد اختصاری "${alias}" رزرو شده است و نمی‌توانید از آن استفاده کنید. لطفاً نماد دیگری انتخاب کنید.` 
    };
  }
  
  // بررسی رشته‌های خاص که ممکن است در regex مشکل ایجاد کنند
  if (['\\', '*', '+', '?', '|', '{', '}', '[', ']', '(', ')', '^', '$', '.'].some(char => alias.includes(char))) {
    return { 
      status: 400, 
      message: 'نماد اختصاری نمی‌تواند شامل کاراکترهای خاص مانند \\, *, +, ?, |, {, }, [, ], (, ), ^, $, . باشد.' 
    };
  }

  try {
    // ایجاد متغیر عمومی جدید
    const newGlobalVariable = new GlobalVariable({
      name,
      alias,
      value: parseFloat(value),
      description: description || "",
      shop: shopId,
      createdBy: user.id,
      updatedBy: user.id
    });

    const savedGlobalVariable = await newGlobalVariable.save();
    const plainGlobalVariable = JSON.parse(JSON.stringify(savedGlobalVariable));
    
    return { 
      status: 201, 
      message: 'متغیر عمومی با موفقیت ایجاد شد.',
      globalVariable: plainGlobalVariable 
    };
  } catch (error) {
    console.error("Error adding global variable:", error);
    
    // خطای تکراری بودن
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[1]; // shop, name یا shop, alias
      return { 
        status: 409, 
        message: field === 'name' 
          ? 'نام متغیر در این فروشگاه تکراری است.' 
          : 'نماد اختصاری در این فروشگاه تکراری است.' 
      };
    }
    
    return { status: 500, message: 'خطایی در ایجاد متغیر عمومی رخ داد.' };
  }
}

// ویرایش متغیر عمومی
export async function EditGlobalVariableAction(formData, id) {
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
    // یافتن متغیر عمومی
    const globalVariable = await GlobalVariable.findById(id).lean();
    if (!globalVariable) {
      return { status: 404, message: 'متغیر عمومی پیدا نشد.' };
    }

    // بررسی دسترسی کاربر
    const hasAccess = await CheckUserPermissionInShop(globalVariable.shop, "priceTemplatesPermissions", "edit");
    if (!hasAccess.hasPermission) {
      return { status: 403, message: 'شما دسترسی لازم را ندارید.' };
    }

    const { name, alias, value, description } = formData;

    // اگر نماد اختصاری تغییر کرده است، بررسی‌های لازم را انجام دهیم
    if (alias && alias !== globalVariable.alias) {
      // بررسی معتبر بودن نماد اختصاری
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(alias)) {
        return { 
          status: 400, 
          message: 'نماد اختصاری باید با حرف انگلیسی شروع شود و فقط شامل حروف انگلیسی، اعداد و _ باشد.' 
        };
      }
      
      // بررسی کلمات رزرو شده در regex
      const reservedKeywords = ['b', 'd', 'D', 'f', 'n', 'r', 's', 'S', 't', 'v', 'w', 'W', '0', 'B', 
                             'cX', 'dX', 'kX', 'nX', 'pX', 'uX', 'xX', 'f', 'n', 'r', 't', 'v'];
      
      // بررسی پیشوندهای رزرو شده
      if (reservedKeywords.some(keyword => alias.toLowerCase() === keyword)) {
        return { 
          status: 400, 
          message: `نماد اختصاری "${alias}" رزرو شده است و نمی‌توانید از آن استفاده کنید. لطفاً نماد دیگری انتخاب کنید.` 
        };
      }
      
      // بررسی رشته‌های خاص که ممکن است در regex مشکل ایجاد کنند
      if (['\\', '*', '+', '?', '|', '{', '}', '[', ']', '(', ')', '^', '$', '.'].some(char => alias.includes(char))) {
        return { 
          status: 400, 
          message: 'نماد اختصاری نمی‌تواند شامل کاراکترهای خاص مانند \\, *, +, ?, |, {, }, [, ], (, ), ^, $, . باشد.' 
        };
      }
      
      // بررسی استفاده از متغیر در فرمول‌های قالب‌های قیمتی
      console.log(`Checking if global variable with alias "${globalVariable.alias}" is used in price templates...`);
      // ایجاد regex برای جستجوی دقیق نماد اختصاری در فرمول‌ها
      const regex = new RegExp(`\\b${globalVariable.alias}\\b`);
      
      const priceTemplatesUsingVariable = await PriceTemplate.find({
        shop: globalVariable.shop,
        $or: [
          { defaultFormula: { $regex: regex } },
          { 'pricingFormulas.formula': { $regex: regex } }
        ]
      }).lean();

      console.log(`Found ${priceTemplatesUsingVariable.length} price templates using this variable.`);
      
      if (priceTemplatesUsingVariable.length > 0) {
        const templateNames = priceTemplatesUsingVariable.map(template => template.title).join('، ');
        return { 
          status: 409, 
          message: `این متغیر در فرمول‌های قالب‌های قیمتی زیر استفاده شده است و نماد اختصاری آن قابل تغییر نیست: ${templateNames}` 
        };
      }
    }

    // ساخت آبجکت برای به‌روزرسانی
    const updateData = {};
    if (name) updateData.name = name;
    if (alias) updateData.alias = alias;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (description !== undefined) updateData.description = description;
    updateData.updatedBy = user.id;

    const updatedGlobalVariable = await GlobalVariable.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).lean();

    const plainGlobalVariable = JSON.parse(JSON.stringify(updatedGlobalVariable));
    
    return { 
      status: 200, 
      message: 'متغیر عمومی با موفقیت به‌روزرسانی شد.',
      globalVariable: plainGlobalVariable 
    };
  } catch (error) {
    console.error("Error editing global variable:", error);
    
    // خطای تکراری بودن
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[1]; // shop, name یا shop, alias
      return { 
        status: 409, 
        message: field === 'name' 
          ? 'نام متغیر در این فروشگاه تکراری است.' 
          : 'نماد اختصاری در این فروشگاه تکراری است.' 
      };
    }
    
    return { status: 500, message: 'خطایی در ویرایش متغیر عمومی رخ داد.' };
  }
}

// حذف متغیر عمومی
export async function DeleteGlobalVariable(globalVariableId) {
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
    // یافتن متغیر عمومی
    const globalVariable = await GlobalVariable.findById(globalVariableId).lean();
    if (!globalVariable) {
      return { status: 404, message: 'متغیر عمومی پیدا نشد.' };
    }

    // بررسی دسترسی کاربر
    const hasAccess = await CheckUserPermissionInShop(globalVariable.shop, "priceTemplatesPermissions", "delete");
    if (!hasAccess.hasPermission) {
      return { status: 403, message: 'شما دسترسی لازم را ندارید.' };
    }

    // بررسی استفاده از متغیر در فرمول‌های قالب‌های قیمتی
    console.log(`Checking if global variable with alias "${globalVariable.alias}" is used in price templates...`);
    const alias = globalVariable.alias.toLowerCase();
    
    // ایجاد regex برای جستجوی دقیق نماد اختصاری در فرمول‌ها
    // \b برای مطمئن شدن از اینکه فقط کلمات کامل را پیدا کند (نه بخشی از کلمات دیگر)
    const regex = new RegExp(`\\b${alias}\\b`);
    console.log("regex",regex);
    
    const priceTemplatesUsingVariable = await PriceTemplate.find({
      shop: globalVariable.shop,
      $or: [
        { defaultFormula: { $regex: regex } },
        { 'pricingFormulas.formula': { $regex: regex } }
      ]
    }).lean();

    console.log(`Found ${priceTemplatesUsingVariable.length} price templates using this variable.`);

    if (priceTemplatesUsingVariable.length > 0) {
      const templateNames = priceTemplatesUsingVariable.map(template => template.title).join('، ');
      return { 
        status: 409, 
        message: `این متغیر در فرمول‌های قالب‌های قیمتی زیر استفاده شده است و قابل حذف نیست: ${templateNames}` 
      };
    }

    // حذف متغیر عمومی
    console.log(`Deleting global variable with ID: ${globalVariableId}`);
    const deletedGlobalVariable = await GlobalVariable.findByIdAndDelete(globalVariableId).lean();
    if (!deletedGlobalVariable) {
      return { status: 404, message: 'متغیر عمومی پیدا نشد.' };
    }

    return { status: 200, message: 'متغیر عمومی با موفقیت حذف شد.' };
  } catch (error) {
    console.error("Error in DeleteGlobalVariable:", error);
    return { status: 500, message: 'خطایی در حذف متغیر عمومی رخ داد.' };
  }
}

