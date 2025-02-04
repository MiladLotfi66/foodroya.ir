"use server";

import SendMetod from "./SendMetod";
import connectDB from "@/utils/connectToDB";
import SendMetodSchema from "./SendMetodSchema";
import { deleteOldImage, processAndSaveImage } from "@/utils/ImageUploader";
import { authenticateUser } from "@/templates/Shop/ShopServerActions";

async function SendMetodServerEnableActions(SendMetodID) {
  try {
    await connectDB(); // اتصال به دیتابیس
    // یافتن روش ارسال با استفاده از SendMetodID
    const sendMetod = await SendMetod.findById(SendMetodID);

    if (!sendMetod) {
      // اگر روش ارسال پیدا نشد، پرتاب خطا
      throw new Error("روش ارسال مورد نظر یافت نشد");
    }

    // تغییر وضعیت روش ارسال به true
    sendMetod.SendMetodStatus = true;

    // ذخیره کردن تغییرات در دیتابیس
    await sendMetod.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت روش ارسال با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت روش ارسال:", error);
    throw new Error("خطای سرور، تغییر وضعیت روش ارسال انجام نشد");
  }
}
async function SendMetodServerDisableActions(SendMetodID) {
  try {
    await connectDB(); // اتصال به دیتابیس

    // یافتن روش ارسال با استفاده از SendMetodID
    const sendMetod = await SendMetod.findById(SendMetodID);

    if (!sendMetod) {
      // اگر روش ارسال پیدا نشد، پرتاب خطا
      throw new Error("روش ارسال مورد نظر یافت نشد");
    }

    // تغییر وضعیت روش ارسال به true
    sendMetod.SendMetodStatus = false;

    // ذخیره کردن تغییرات در دیتابیس
    await sendMetod.save();

    // بازگرداندن پاسخ موفقیت‌آمیز
    return { Message: "وضعیت روش ارسال با موفقیت به true تغییر یافت", status: 201 };
  } catch (error) {
    // چاپ خطا در صورت وقوع مشکل
    console.error("خطا در تغییر وضعیت روش ارسال:", error);
    throw new Error("خطای سرور، تغییر وضعیت روش ارسال انجام نشد");
  }
}
async function GetAllSendMetods(ShopId) {
  
  try {
    await connectDB();

    // واکشی تمام اطلاعات روش ارسالها از دیتابیس
    const sendMetods = await SendMetod.find({ShopId:ShopId}).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

    // تبدیل اشیاء به plain objects
    const plainSendMetods = sendMetods?.map((sendMetod) => ({
      ...sendMetod,
      
// Title
// Description
// Price


// imageUrl
// SendMetodStatus

      _id: sendMetod?._id?.toString(), // تبدیل ObjectId به رشته
      CreatedBy: sendMetod?.CreatedBy?.toString(), // تبدیل ObjectId به رشته
      LastEditedBy: sendMetod?.LastEditedBy?.toString(), // تبدیل ObjectId به رشته
      ShopId: sendMetod?.ShopId?.toString(), // تبدیل Date به رشته
    }));

    return { sendMetods: plainSendMetods, status: 200 };
  } catch (error) {
    console.error("خطا در تغییر وضعیت روش ارسال:", error);
    throw new Error("خطای سرور، تغییر وضعیت روش ارسال انجام نشد");
  }
}

export async function GetAllEnableSendMetods(ShopId) {
  try {
    await connectDB();
    // واکشی روش ارسالهای فعال که به فروشگاه مدنظر تعلق دارند
    const SendMetods = await SendMetod.find({ SendMetodStatus: true, ShopId }).lean(); // فیلتر بر اساس ShopId و SendMetodStatus
    // اگر روش ارسالی پیدا نشد، لیست خالی بازگردانید
    // تبدیل اشیاء به plain objects
    const plainSendMetods = SendMetods?.map((sendMetod) => ({
      ...sendMetod,
      _id: sendMetod._id.toString(), // تبدیل ObjectId به رشته
      ShopId: sendMetod.ShopId.toString(), // تبدیل ObjectId به رشته
      CreatedBy: sendMetod.CreatedBy.toString(), // تبدیل ObjectId به رشته
      LastEditedBy: sendMetod.LastEditedBy.toString(), // تبدیل ObjectId به رشته
    }));

    return { sendMetods: plainSendMetods, status: 200 };
  } catch (error) {
    console.error("خطا در دریافت روش ارسالها:", error);
    throw new Error("خطای سرور، دریافت روش ارسالها انجام نشد");
  }
}

async function DeleteSendMetods(SendMetodID) {
  try {
    await connectDB();

    // یافتن روش ارسال با استفاده از SendMetodID
    const sendMetod = await SendMetod.findById(SendMetodID);
    if (!sendMetod) {
      return { message: "روش ارسال مورد نظر یافت نشد", status: 500 };

    }

    // مسیر فایل تصویر روش ارسال

    // حذف روش ارسال از دیتابیس
    const result = await SendMetod.deleteOne({ _id: SendMetodID });
    if (result.deletedCount === 0) {
      return { message: "روش ارسال مورد نظر حذف نشد", status: 500 };
    }

  const deleteStatus=deleteOldImage(sendMetod.imageUrl)
   if (deleteStatus.status===200) {
  return { message: "روش ارسال و فایل تصویر با موفقیت حذف شدند", status: 200 };
}else{
  return { message: "خطای سرور، حذف روش ارسال انجام نشد", status: 500 };
}

  } catch (error) {
    console.error("خطا در حذف روش ارسال:", error);
    return { message: "خطای سرور، حذف روش ارسال انجام نشد", status: 500 };
  }
}

function formDataToObject(formData) {
  const object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });
  return object;
}
export async function AddSendMetodAction(formData) {
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
    // اتصال به دیتابیس
    await connectDB();

    // استخراج اطلاعات از FormData
    const ShopId = formData.get("ShopId");
    const Title = formData.get("Title");
    const Description = formData.get("Description");
    const Price = formData.get("Price");
    // فیلد SendMetodStatus ممکن است به صورت رشته "true"/"false" دریافت شود، بنابراین تبدیل می‌کنیم.
    const SendMetodStatus = formData.get("SendMetodStatus") === "true";

    // پردازش فیلد imageUrl: چک می‌کنیم آیا فایل آپلود شده است یا مقدار قبلی (آدرس تصویر) ارسال شده است
    const imageField = formData.get("imageUrl");

    const imageUrl = await processAndSaveImage(imageField,null,`/Uploads/Shop/images/${ShopId}/SendMetods`,);
    // ساخت سند جدید در مدل SendMetod
    const newSendMetod = new SendMetod({
      ShopId,
      Title,
      Description,
      Price,
      imageUrl,
      SendMetodStatus,
      LastEditedBy:user.id,
CreatedBy:user.id
    });
    await newSendMetod.save();
    // در صورت موفقیت، وضعیت 201 (Created) به همراه داده ایجاد شده برگردانده می‌شود
    return { message: "روش ارسال با موفقیت ایجاد شد." ,status: 201 }
    
  } catch (error) {
    console.error("Error in AddSendMetodAction:", error);
    return {message: "خطایی در ایجاد روش ارسال رخ داده است.",  status: 500 }
    
  }
}
export async function EditSendMetodAction(formData) {
  let user;
  try {
    user = await authenticateUser();
  } catch (authError) {
    console.error("Authentication failed:", authError);
    return { status: 401, message: "کاربر وارد نشده است." };
  }

  if (!user) {
    return { status: 401, message: "کاربر وارد نشده است." };
  }

  try {
    // اتصال به دیتابیس
    await connectDB();

    // استخراج شناسه سندی که قصد ویرایش آن را داریم
    const sendMetodId = formData.get("id");
    if (!sendMetodId) {
      return { status: 400, message: "شناسه روش ارسال مشخص نشده است." };
    }

    // یافتن سند موجود از مدل SendMetod
    const existingSendMetod = await SendMetod.findById(sendMetodId);
    if (!existingSendMetod) {
      return { status: 404, message: "روش ارسال مورد نظر یافت نشد." };
    }

    // استخراج اطلاعات جدید از formData
    // توجه کنید که فیلد ShopId معمولاً ثابت است و نباید تغییر کند؛ بنابراین نیازی به بروزرسانی آن نیست.
    const Title = formData.get("Title");
    const Description = formData.get("Description");
    const Price = formData.get("Price");
    const SendMetodStatus = formData.get("SendMetodStatus") === "true";
    
    // پردازش فیلد imageUrl:
    // اگر فایل جدید آپلود شده باشد، آن را پردازش و ذخیره می‌کنیم؛ در غیر این صورت از مقدار قبلی استفاده می‌شود.
    const imageField = formData.get("imageUrl");
    let imageUrl = existingSendMetod.imageUrl; // مقدار پیش‌فرض از سند موجود
    if (imageField) {
      imageUrl = await processAndSaveImage(
        imageField,
        null,
        `/Uploads/Shop/images/${existingSendMetod.ShopId}/SendMetods`
      );
    }

    // به‌روزرسانی فیلدهای سند
    existingSendMetod.Title = Title;
    existingSendMetod.Description = Description;
    existingSendMetod.Price = Price;
    existingSendMetod.SendMetodStatus = SendMetodStatus;
    existingSendMetod.imageUrl = imageUrl;
    existingSendMetod.LastEditedBy = user.id;

    // ذخیره سند به‌روز شده
    await existingSendMetod.save();

    return { status: 200, message: "روش ارسال با موفقیت به روز رسانی شد." };
  } catch (error) {
    console.error("Error in EditSendMetodAction:", error);
    return { status: 500, message: "خطایی در ویرایش روش ارسال رخ داده است." };
  }
}


export {
  DeleteSendMetods,
  SendMetodServerEnableActions,
  SendMetodServerDisableActions,
  GetAllSendMetods,
  
};




