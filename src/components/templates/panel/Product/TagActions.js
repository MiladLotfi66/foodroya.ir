"use server";
// utils/TagActions.js
import connectDB from "@/utils/connectToDB";
import Tag from "./Tag";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";
// تابعی برای تبدیل داده‌ها به شیء ساده


export async function GetAllTags(search) {
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
    // اگر پارامتر جستجو موجود باشد، فیلتر بر اساس آن اعمال می‌شود
    let tags;
    if (search) {
      const regex = new RegExp(search, 'i'); // جستجوی غیر حساس به حروف بزرگ و کوچک
      tags = await Tag.find({ name: { $regex: regex } }).select('-__v -CreatedBy -createdAt' ).lean();
    } else {
      tags = await Tag.find().select('-__v -createdAt -CreatedBy').lean();
    }
    const serializedTags = tags.map(tag => ({
        _id: tag._id.toString(),
        name: tag.name,
      }));
  
      

    return { status: 200, tags: serializedTags };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return { status: 500, message: 'خطایی در دریافت تگ‌ها رخ داد.' };
  }
}

export async function AddTagAction(formData) {
    
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


  const data = Object.fromEntries(formData.entries());
  const { name } = data;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { status: 400, message: 'نام تگ نامعتبر است.' };
  }

  try {
    // بررسی یکتایی نام تگ
    const existingTag = await Tag.findOne({ name: name.trim() }).lean();
    if (existingTag) {
      return { status: 400, message: 'نام تگ باید منحصر به فرد باشد.' };
    }

    // ایجاد تگ جدید
    const newTag = new Tag({
      name: name.trim(),
      createdBy: user.id, // فرض می‌کنیم که user دارای فیلد id است
    });

    const savedTag = await newTag.save();
    const plainTag = JSON.parse(JSON.stringify(savedTag));
    return { status: 201, tag: plainTag };
  } catch (error) {
    console.error("Error adding tag:", error);
    return { status: 500, message: 'خطایی در ایجاد تگ رخ داد.' };
  }
}
