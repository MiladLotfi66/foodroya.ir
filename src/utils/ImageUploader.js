// lib/imageUploader.js
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp','image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_SIZE = 10 * 1024; // 10KB


export async function createImageUploader({ buffer, uploadDir = 'uploads', mimeType, size }) {
  try {
    // اعتبارسنجی نوع فایل
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error('نوع فایل نا معتبر است. تنها تصاویر با فرمت JPEG, PNG , jpg , GIF و WebP مجاز هستند.');
    }

    // اعتبارسنجی حجم فایل
    if (size > MAX_SIZE) {
      throw new Error('حجم فایل بیش از حد مجاز (۵ مگابایت) است.');
    }


    // تعیین مسیر کامل پوشه آپلود
    const absoluteUploadDir = path.join(process.cwd(), 'public', uploadDir);

    // اطمینان از وجود پوشه آپلود، در غیر این صورت ایجاد آن
    await fs.mkdir(absoluteUploadDir, { recursive: true });

    // تولید نام فایل یونیک با پسوند webp
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileName = `image-${uniqueSuffix}.webp`;
    const filePath = path.join(absoluteUploadDir, fileName);

    // تبدیل تصویر به WebP با استفاده از sharp
    await sharp(buffer)
      .webp({ quality: 80 }) // تنظیم کیفیت تصویر به دلخواه
      .toFile(filePath);

    // مسیر قابل دسترسی عمومی
    const accessiblePath = `/${uploadDir}/${fileName}`;
    return accessiblePath;
  } catch (error) {
    console.error('Error in createImageUploader:', error);
    throw new Error(error.message || 'مشکلی در پردازش و ذخیره تصویر پیش آمده است.');
    // return {Error :'مشکلی در پردازش و ذخیره تصویر پیش آمده است.'};

  }
}



const s3 = new S3Client({
  region: 'default', // منطقه (region) خود را تنظیم کنید
  endpoint: process.env.S3_ENDPOINT, // در صورت استفاده از S3 سازگار دیگر مانند DigitalOcean Spaces
  forcePathStyle: true, // بسته به سرویس که استفاده می‌کنید
  credentials: {
    accessKeyId: process.env.S3_ACCESSKEY,
    secretAccessKey: process.env.S3_SECRETKEY,
  },
});

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


