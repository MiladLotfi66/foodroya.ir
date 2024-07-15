import connectDB from "@/utils/connectToDB";
import shops from "@/models/shops";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import sharp from "sharp";

export async function PUT(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    console.log("req.formData", formData);

    const validatedData = await ShopSchema.validate(
      {
        ShopName: formData.get("ShopName"),
        ShopSmallDiscription: formData.get("ShopSmallDiscription"),
        ShopDiscription: formData.get("ShopDiscription"),
        ShopAddress: formData.get("ShopAddress"),
        ShopPhone: formData.get("ShopPhone"),
        ShopMobile: formData.get("ShopMobile"),
        ShopStatus: formData.get("ShopStatus"),
        Logo: formData.getAll("Logo"),
        TextLogo: formData.getAll("TextLogo"),
        BackGroundShop: formData.getAll("BackGroundShop"),
        BackGroundpanel: formData.getAll("BackGroundpanel"),
      },
      {
        abortEarly: false,
      }
    );

    const {
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      Logo,
      TextLogo,
      BackGroundShop,
      BackGroundpanel,
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

    const LogoUrl = await processAndSaveImage(Logo[0]);
    const TextLogoUrl = await processAndSaveImage(TextLogo[0]);
    const BackGroundShopUrl = await processAndSaveImage(BackGroundShop[0]);
    const BackGroundpanelUrl = await processAndSaveImage(BackGroundpanel[0]);

    const newShop = new shops({
      ShopName,
      ShopSmallDiscription,
      ShopDiscription,
      ShopAddress,
      ShopPhone,
      ShopMobile,
      ShopStatus,
      LogoUrl,
      TextLogoUrl,
      BackGroundShopUrl,
      BackGroundpanelUrl,
    });

    await newShop.save();

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

    const Shops = await shops.find({}).lean();

    return new Response(JSON.stringify({ Shops }), {
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
