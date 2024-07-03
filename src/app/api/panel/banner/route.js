import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";

export async function PUT(req) {
    try {
        await connectDB();

        const formData = await req.formData();

        const validatedData = await BannerSchima.validate({
            BannerBigTitle: formData.get("BannerBigTitle"),
            BannersmallDiscription: formData.get("BannersmallDiscription"),
            BannerDiscription: formData.get("BannerDiscription"),
            BannerStep: formData.get("BannerStep"),
            BannerTextColor: formData.get("BannerTextColor"),
            BannerImage: formData.getAll("BannerImage"),
            BannerStatus: formData.get("BannerStatus"),
            BannerLink: formData.get("BannerLink"),
        }, {
            abortEarly: false,
        });

        const { BannerBigTitle, BannersmallDiscription, BannerDiscription, BannerStep, BannerImage, BannerTextColor, BannerStatus, BannerLink } = validatedData;

        const buffer = Buffer.from(await BannerImage[0].arrayBuffer());
        const fileName = Date.now() + BannerImage[0].name;
        await writeFile(path.join(process.cwd(), "public/Uploads/" + fileName), buffer);
        const imageUrl = "/Uploads/" + fileName;

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

export async function PATCH(req) {
    try {
        await connectDB();

        const formData = await req.formData();
        const bannerId = formData.get("id");

        const validatedData = await BannerSchima.validate({
            BannerBigTitle: formData.get("BannerBigTitle"),
            BannersmallDiscription: formData.get("BannersmallDiscription"),
            BannerDiscription: formData.get("BannerDiscription"),
            BannerStep: formData.get("BannerStep"),
            BannerTextColor: formData.get("BannerTextColor"),
            BannerImage: formData.getAll("BannerImage"),
            BannerStatus: formData.get("BannerStatus"),
            BannerLink: formData.get("BannerLink"),
        }, {
            abortEarly: false,
        });

        const { BannerBigTitle, BannersmallDiscription, BannerDiscription, BannerStep, BannerImage, BannerTextColor, BannerStatus, BannerLink } = validatedData;

        let imageUrl;

        if (BannerImage && BannerImage.length > 0) {
            const buffer = Buffer.from(await BannerImage[0].arrayBuffer());
            const fileName = Date.now() + BannerImage[0].name;
            await writeFile(path.join(process.cwd(), "public/Uploads/" + fileName), buffer);
            imageUrl = "/Uploads/" + fileName;
        }

        const updatedBanner = {
            BannerBigTitle,
            BannersmallDiscription,
            BannerDiscription,
            BannerStep,
            BannerTextColor,
            BannerStatus,
            BannerLink
        };

        if (imageUrl) {
            updatedBanner.imageUrl = imageUrl;
        }

        const banner = await Banner.findByIdAndUpdate(bannerId, updatedBanner, { new: true });

        if (imageUrl && banner.imageUrl) {
            await unlink(path.join(process.cwd(), banner.imageUrl));
        }

        return Response.json({ message: "ویرایش بنر با موفقیت انجام شد" }, { status: 200 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectDB();

        const banners = await Banner.find({}).lean();

        return Response.json({ banners }, { status: 200 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
