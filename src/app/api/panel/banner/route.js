import connectDB from "@/utils/connectToDB";
import Banner from "@/models/Banner";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import BannerSchima from "@/utils/yupSchemas/BannerSchima";
import sharp from "sharp";

export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const validatedData = await BannerSchima.validate(
      {
        BannerBigTitle: formData.get("BannerBigTitle"),
        BannersmallDiscription: formData.get("BannersmallDiscription"),
        BannerDiscription: formData.get("BannerDiscription"),
        BannerStep: formData.get("BannerStep"),
        BannerTextColor: formData.get("BannerTextColor"),
        BannerImage: formData.getAll("BannerImage"),
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
      BannerImage,
      BannerTextColor,
      BannerStatus,
      BannerLink,
    } = validatedData;

    const buffer = Buffer.from(await BannerImage[0].arrayBuffer());
    const now = process.hrtime.bigint(); // استفاده از میکروثانیه‌ها
    const fileName = `${now}.webp`;
    const filePath = path.join(process.cwd(), "public/Uploads/" + fileName);
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();
    await writeFile(filePath, optimizedBuffer);
    const imageUrl = "/Uploads/" + fileName;

    const newBanner = new Banner({
      BannerBigTitle,
      BannersmallDiscription,
      BannerDiscription,
      BannerStep,
      imageUrl,
      BannerTextColor,
      BannerStatus,
      BannerLink,
    });

    await newBanner.save();

    return new Response(
      JSON.stringify({ message: "آپلود فایل با موفقیت انجام شد" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in PUT API:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const banners = await Banner.find({}).lean();

    return new Response(JSON.stringify({ banners }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET API:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
