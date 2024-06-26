import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";   
import { writeFile } from "fs/promises";
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";

export async function PUT(req) {
    try {
        await connectDB();

        // استخراج داده‌های فرم از formData
        const formData = await req.formData();

        // اعتبارسنجی داده‌ها با استفاده از yup
        const validatedData = await BannerSchima.validate({
            BannerBigTitle: formData.get("BannerBigTitle"),
            BannersmallDiscription: formData.get("BannersmallDiscription"),
            BannerDiscription: formData.get("BannerDiscription"),
            BannerStep: formData.get("BannerStep"),
            BannerTextColor: formData.get("BannerTextColor"),
            BannerImage: formData.getAll("BannerImage"), // اینجا از getAll برای دریافت تمام فایل‌های انتخاب شده استفاده می‌شود
            BannerStatus: formData.get("BannerStatus"),
            BannerLink: formData.get("BannerLink"),
        }, {
            abortEarly: false, // نمایش همه خطاها
        });

        const { BannerBigTitle, BannersmallDiscription, BannerDiscription, BannerStep, BannerImage ,BannerTextColor ,BannerStatus,BannerLink} = validatedData;
        // تبدیل تصویر به buffer و ذخیره در مسیر مورد نظر
        const buffer = Buffer.from(await BannerImage[0].arrayBuffer()); // اینجا از BannerImage[0] برای فایل اول استفاده شده است
        const fileName = Date.now() + BannerImage[0].name;
        await writeFile(path.join(process.cwd(), "public/Uploads/" + fileName), buffer);
        const imageUrl = "/Uploads/" + fileName;

        // ذخیره اطلاعات در دیتابیس
        const newBanner = new Banner({
            BannerBigTitle,
            BannersmallDiscription,
            BannerDiscription,
            BannerStep,
            imageUrl,
            BannerTextColor,
            BannerStatus,
            BannerLink
            
        });

        await newBanner.save();

        return Response.json({ message: "آپلود فایل با موفقیت انجام شد" }, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
export async function GET(req) {
    try {
        await connectDB();

        // واکشی تمام اطلاعات بنرها از دیتابیس
        const banners = await Banner.find({}).lean(); // lean() برای بازگشتن به شیء JS ساده بدون مدیریت مدل

        return Response.json({ banners }, { status: 200 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}

