// lib/imageUploader.js
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand ,CopyObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';


const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const s3 = new S3Client({
  region: 'default', // منطقه (region) خود را تنظیم کنید
  endpoint: process.env.S3_ENDPOINT, // در صورت استفاده از S3 سازگار دیگر مانند DigitalOcean Spaces
  forcePathStyle: true, // بسته به سرویس که استفاده می‌کنید
  credentials: {
    accessKeyId: process.env.S3_ACCESSKEY,
    secretAccessKey: process.env.S3_SECRETKEY,
  },
});


// lib/imageUploader.js

// تابع کپی تصویر
export const copyImage = async (oldUrl, uploadDir) => {
  try {
    const url = new URL(oldUrl);
    let sourceKey = '';

    // استخراج کلید از URL
    if (process.env.S3_ENDPOINT) {
      const pathParts = url.pathname.split('/');
      sourceKey = pathParts.slice(2).join('/'); // فرض بر این است که کلید از قسمت سوم شروع می‌شود
    } else {
      sourceKey = url.pathname.slice(1); // حذف اولین `/`
    }

    // تولید کلید جدید برای تصویر کپی شده
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileExtension = path.extname(sourceKey);
    const newFileName = `image-${uniqueSuffix}${fileExtension}`; // می‌توانید فرمت را تغییر دهید اگر نیاز است
    const destinationKey = `${uploadDir.replace(/\/+$/, '')}/${newFileName}`;

    // پارامترهای کپی
    const copyParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      CopySource: `${process.env.S3_BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
      ACL: 'public-read', // دسترسی عمومی خواندنی (در صورت نیاز)
      ContentType: 'image/webp', // یا نوع محتوای مناسب
    };

    const copyCommand = new CopyObjectCommand(copyParams);
    await s3.send(copyCommand);

    // ساخت URL جدید
    const newImageURL = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${destinationKey}`;
    return newImageURL;
  } catch (error) {
    console.error('Error in copyImage:', error);
    throw new Error(error.message || 'مشکلی در کپی تصویر پیش آمده است.');
  }
};

// همچنین می‌توانید تابعی برای کپی چند تصویر اضافه کنید


export async function createImageUploader2({ buffer, mimeType, size, uploadDir = 'uploads' }) {
  try {
    // اعتبارسنجی نوع فایل
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error('نوع فایل نا معتبر است. تنها تصاویر با فرمت JPEG, PNG, JPG, GIF و WebP مجاز هستند.');
    }

    // اعتبارسنجی حجم فایل
    if (size > MAX_SIZE) {
      throw new Error('حجم فایل بیش از حد مجاز (۵ مگابایت) است.');
    }

    // تبدیل تصویر به WebP با استفاده از sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 }) // تنظیم کیفیت تصویر به دلخواه
      .toBuffer();

    // تولید نام فایل یونیک با پسوند WebP
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileName = `image-${uniqueSuffix}.webp`;

    // ترکیب uploadDir و نام فایل برای کلید S3
    const key = `${uploadDir.replace(/\/+$/, '')}/${fileName}`;

    // آپلود تصویر به S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: webpBuffer,
      ContentType: 'image/webp',
      ACL: 'public-read', // دسترسی عمومی خواندنی (در صورت نیاز)

    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // ساخت URL قابل دسترسی
    const imageURL = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
    return imageURL;
  } catch (error) {
    console.error('Error in createImageUploader:', error);
    throw new Error(error.message || 'مشکلی در پردازش و ذخیره تصویر پیش آمده است.');
  }
}

export const processAndSaveImage = async (image, oldUrl, uploadDir ) => {
  if (image && typeof image !== "string") {
    try {
      // اعتبارسنجی نوع فایل
      const mimeType = image.type || image.mimetype;
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error('نوع فایل نا معتبر است. تنها تصاویر با فرمت JPEG, PNG, JPG, GIF و WebP مجاز هستند.');
      }

      // اعتبارسنجی حجم فایل
      const size = image.size || image.length;
      if (size > MAX_SIZE) {
        throw new Error('حجم فایل بیش از حد مجاز (۵ مگابایت) است.');
      }

      // تبدیل تصویر به بافر
      const buffer = Buffer.from(await image.arrayBuffer());

      // تبدیل تصویر به WebP با استفاده از sharp
      const optimizedBuffer = await sharp(buffer)
        .webp({ quality: 80 }) // تنظیم کیفیت تصویر به دلخواه
        .toBuffer();

      // تولید نام فایل یونیک با پسوند WebP
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const fileName = `image-${uniqueSuffix}.webp`;

      // ترکیب uploadDir و نام فایل برای کلید S3
      const key = `${uploadDir.replace(/\/+$/, '')}/${fileName}`;

      // آپلود تصویر به S3
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read', // دسترسی عمومی خواندنی (در صورت نیاز)
      };

      const uploadCommand = new PutObjectCommand(uploadParams);
      await s3.send(uploadCommand);

      // ساخت URL قابل دسترسی
      const imageURL = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`

      // حذف URL قبلی در صورت وجود
      if (oldUrl) {
        await deleteOldImage(oldUrl);
      }

      return imageURL;
    } catch (error) {
      console.error('Error in processAndSaveImage:', error);
      throw new Error(error.message || 'مشکلی در پردازش و ذخیره تصویر پیش آمده است.');
    }
  }
  return image;
};

// export const deleteOldImage = async (oldUrl) => {
//   try {
//     // استخراج کلید از URL
//     const url = new URL(oldUrl);
//     let key = '';

//     // بررسی و استخراج کلید بسته به ساختار URL
//     if (process.env.S3_ENDPOINT) {
//       // اگر از S3 سازگار دیگری استفاده می‌کنید مانند DigitalOcean Spaces
//       const pathParts = url.pathname.split('/');
//       // فرض می‌شود که پس از نام باکت، کلید شروع می‌شود
//       key = pathParts.slice(2).join('/');
//     } else {
//       // ساختار URL پیش‌فرض S3
//       key = url.pathname.slice(1); // حذف اولین `/`
//     }

//     const deleteParams = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: key,
//     };

//     const deleteCommand = new DeleteObjectCommand(deleteParams);
//     await s3.send(deleteCommand);

// return{status:200}
//   } catch (error) {
    
//     return { status: 500, message: 'خطایی در حذف تصویر رخ داد.' };

//     // تصمیم بگیرید که آیا می‌خواهید خطا را پرتاب کنید یا خیر
//   }
// };


export const deleteOldImage = async (oldUrl) => {
  console.log(`Attempting to delete image: ${oldUrl}`);
  
  if (!oldUrl) {
    console.warn("No URL provided for deletion.");
    return { status: 400, message: "URL provided is invalid." };
  }

  try {
    // استخراج کلید از URL
    const url = new URL(oldUrl);
    let key = '';

    // بررسی و استخراج کلید بسته به ساختار URL
    if (process.env.S3_ENDPOINT) {
      // اگر از S3 سازگار دیگری استفاده می‌کنید مانند DigitalOcean Spaces
      const pathParts = url.pathname.split('/');
      // فرض می‌شود که پس از نام باکت، کلید شروع می‌شود
      key = pathParts.slice(2).join('/');
    } else {
      // ساختار URL پیش‌فرض S3
      key = url.pathname.slice(1); // حذف اولین `/`
    }

    console.log(`Extracted key for deletion: ${key}`);

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    
     await s3.send(deleteCommand);
    
    return { status: 200 };
  } catch (error) {
    console.error("Error in deleteOldImage:", error);
    return { status: 500, message: 'خطایی در حذف تصویر رخ داد.' };
  }
};



export const deleteOldImages = async (oldUrls) => {
  
  try {
    // ایجاد یک آرایه از پرامیس‌ها برای حذف تصاویر به صورت موازی
    const deletePromises = oldUrls.map((oldUrl) => deleteOldImage(oldUrl));

    // اجرای تمام پرامیس‌ها به صورت موازی
    const results = await Promise.all(deletePromises);

    // بررسی نتایج حذف هر تصویر
    const failedDeletes = results.filter(result => result.status !== 200);

    if (failedDeletes.length > 0) {
      console.error('برخی از تصاویر به درستی حذف نشدند.');
      return { status: 500, message: 'برخی از تصاویر به درستی حذف نشدند.' };
    }

    return { status: 200, message: 'تمامی تصاویر با موفقیت حذف شدند.' };
  } catch (error) {
    console.error('Error in deleteOldImages:', error);
    return { status: 500, message: 'خطایی در حذف تصاویر رخ داد.' };
  }
};



