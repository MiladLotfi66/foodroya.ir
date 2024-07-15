import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import BannerSchema from "@/utils/yupSchemas/BannerSchema";
import sharp from "sharp";

export async function PATCH(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const bannerId = formData.get("id");

    if (!bannerId) {
      console.error("Banner ID is missing");
      return new Response(
        JSON.stringify({ message: "آی‌دی بنر ارسال نشده است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const banner = await Banner.findById(bannerId);

    if (!banner) {
      console.error("Banner not found");
      return new Response(
        JSON.stringify({ message: "بنری با این آی‌دی یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const validatedData = await BannerSchema.validate(
      {
        BannerBigTitle: formData.get("BannerBigTitle"),
        BannersmallDiscription: formData.get("BannersmallDiscription"),
        BannerDiscription: formData.get("BannerDiscription"),
        BannerStep: formData.get("BannerStep"),
        BannerTextColor: formData.get("BannerTextColor"),
        BannerImage: formData.get("BannerImage"),
        BannerStatus: formData.get("BannerStatus"),
        BannerLink: formData.get("BannerLink"),
      },
      {
        abortEarly: false,
      }
    );

    const {
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      BannerTextColor,
      BannerImage,
      BannerStatus,
      BannerLink,
    } = validatedData;

    const processAndSaveImage = async (image) => {
      if (image && typeof image !== "string") {
        const buffer = Buffer.from(await image.arrayBuffer());
        const now = process.hrtime.bigint(); // استفاده از میکروثانیه‌ها
        const fileName = `${now}.webp`;
        const filePath = path.join(process.cwd(), "public/Uploads/" + fileName);
        const optimizedBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();
        await writeFile(filePath, optimizedBuffer);
        return "/Uploads/" + fileName;
      }
      return image;
    };

    const imageUrl = await processAndSaveImage(BannerImage);

    const updatedBanner = {
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      BannerTextColor,
      BannerStatus,
      BannerLink,
      imageUrl,
    };

    const updatedBannerDoc = await Banner.findByIdAndUpdate(
      bannerId,
      updatedBanner,
      { new: true }
    );

    if (imageUrl && banner.imageUrl) {
      try {
        await unlink(path.join(process.cwd(), banner.imageUrl));
      } catch (unlinkError) {
        console.error("Error deleting old image", unlinkError);
      }
    }

    return new Response(
      JSON.stringify({ message: "ویرایش بنر با موفقیت انجام شد" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in PATCH API:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
