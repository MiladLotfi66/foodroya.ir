// lib/imageUploader.js
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';


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
