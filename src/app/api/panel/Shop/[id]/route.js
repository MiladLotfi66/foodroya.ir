import connectDB from "@/utils/connectToDB";
import shops from "@/models/shops";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import sharp from "sharp";

export async function PATCH(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const ShopId = formData.get("id");

    if (!ShopId) {
      console.error("shop ID is missing");
      return new Response(
        JSON.stringify({ message: "آی‌دی فروشگاه ارسال نشده است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const Shop = await shops.findById(ShopId);

    if (!Shop) {
      console.error("Shop not found");
      return new Response(
        JSON.stringify({ message: "فروشگاهی با این آی‌دی یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const validatedData = await ShopSchema.validate(
      {
        ShopName: formData.get("ShopName"),
        ShopSmallDiscription: formData.get("ShopSmallDiscription"),
        ShopDiscription: formData.get("ShopDiscription"),
        ShopAddress: formData.get("ShopAddress"),
        ShopPhone: formData.get("ShopPhone"),
        ShopMobile: formData.get("ShopMobile"),
        ShopStatus: formData.get("ShopStatus"),
         Logo: formData.get("Logo"),
         TextLogo: formData.get("TextLogo"),
         BackGroundShop: formData.get("BackGroundShop"),
         BackGroundpanel: formData.get("BackGroundpanel"),
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
        const optimizedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
        await writeFile(filePath, optimizedBuffer);
        return "/Uploads/" + fileName;
      }
      return image;
    };

    const LogoUrl = await processAndSaveImage(Logo);
    const TextLogoUrl = await processAndSaveImage(TextLogo);
    const BackGroundShopUrl = await processAndSaveImage(BackGroundShop);
    const BackGroundpanelUrl = await processAndSaveImage(BackGroundpanel);

    const updatedShop = {
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
    };

    const updatedShopDoc = await shops.findByIdAndUpdate(ShopId, updatedShop, {
      new: true,
    });

    const deleteOldImage = async (oldUrl) => {
      if (oldUrl) {
        try {
          await unlink(path.join(process.cwd(), oldUrl));
        } catch (unlinkError) {
          console.error("Error deleting old image", unlinkError);
        }
      }
    };

    await deleteOldImage(Shop.LogoUrl);
    await deleteOldImage(Shop.TextLogoUrl);
    await deleteOldImage(Shop.BackGroundShopUrl);
    await deleteOldImage(Shop.BackGroundpanelUrl);

    return new Response(
      JSON.stringify({ message: "ویرایش فروشگاه با موفقیت انجام شد" }),
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
