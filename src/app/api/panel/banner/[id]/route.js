import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";

export async function PATCH(req) {
    try {
        await connectDB();
        console.log('Connected to DB');

        const formData = await req.formData();
        const bannerId = formData.get("id");
        console.log(bannerId,formData);

        if (!bannerId) {
            console.error('Banner ID is missing');
            return new Response(JSON.stringify({ message: "آی‌دی بنر ارسال نشده است" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const banner = await Banner.findById(bannerId);

        if (!banner) {
            console.error('Banner not found');
            return new Response(JSON.stringify({ message: "بنری با این آی‌دی یافت نشد" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
console.log("BannerImage",formData.getAll("BannerImage"));

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
            const filePath = path.join(process.cwd(), "public/Uploads/" + fileName);
            await writeFile(filePath, buffer);
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

        const updatedBannerDoc = await Banner.findByIdAndUpdate(bannerId, updatedBanner, { new: true });

        if (imageUrl && banner.imageUrl) {
            try {
                await unlink(path.join(process.cwd(), banner.imageUrl));
            } catch (unlinkError) {
                console.error('Error deleting old image', unlinkError);
            }
        }

        return new Response(JSON.stringify({ message: "ویرایش بنر با موفقیت انجام شد" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error in PATCH API:', error);
        return new Response(JSON.stringify({ message: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}