"use server";

// /app/upload/route.js
import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from "uuid";

const domain = process.env.S3_ENDPOINT;
const bucketName = process.env.S3_BUCKET_NAME;
const accessKey = process.env.S3_ACCESSKEY;
const secretkey = process.env.S3_SECRETKEY;
// ایجاد یک نمونه از S3Client
const s3 = new S3Client({
    region: 'default',
    endpoint: domain,
    forcePathStyle: true,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretkey,
    },
});

export async function UploadServerAction(formData) {
    try {
        const file = formData.get("file");

        if (!file) {
            return { error: "فایلی انتخاب نشده است." };
        }

        const fileExtension = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;

        // خواندن محتویات فایل به صورت Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadParams = {
            Bucket: bucketName,
            Key: `images/${fileName}`,
            Body: buffer,
            ContentType: file.type,
            ACL: "public-read", // بررسی کنید که نیاز به این تنظیم دارید یا خیر
        };

        const command = new PutObjectCommand(uploadParams);
        await s3.send(command);

        const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/images/${fileName}`;

        return { status: 200 , url: fileUrl };
    } catch (error) {
        console.error('Upload Error:', error);
        return { error: 'خطا در آپلود فایل.' };
    }
}

export async function getS3FileListServerAction() {
    console.log("111111111--------");
    
  const listResponse = await s3.send(new ListObjectsCommand({ Bucket: bucketName })
  );
  console.log("Files in bucket:", listResponse.Contents);

  return { message: "لیست فایل دریافت شد.", listResponse: listResponse };
}
