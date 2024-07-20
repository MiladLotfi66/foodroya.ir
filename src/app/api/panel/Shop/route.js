import connectDB from "@/utils/connectToDB";
import shops from "@/models/shops";
import { writeFile } from "fs/promises";
import path from "path";
import ShopSchema from "@/utils/yupSchemas/ShopSchema";
import sharp from "sharp";
import { getToken } from "next-auth/jwt"; // استفاده از getToken برای استخراج توکن JWT

export async function PUT(req) {
  try {
    await connectDB();
    // استخراج توکن JWT
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const formData = await req.formData();

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
        const filePath = path.join(process.cwd(), "public/Uploads/Shops/" + fileName);
        const optimizedBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();
        await writeFile(filePath, optimizedBuffer);
        return "/Uploads/Shops/" + fileName;
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
      CreatedBy: token.sub, // استفاده از اطلاعات کاربر از توکن
      LastEditedBy: token.sub, // استفاده از اطلاعات کاربر از توکن
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



// export async function GET(req) {
//   try {
//     await connectDB();

//     const shopsData = await shops.find({}).lean();

//     // تبدیل اشیاء MongoDB به plain objects
//     const Shops = shopsData.map(shop => ({
//       ...shop,
//       _id: shop._id.toString(),
//       CreatedBy: shop.CreatedBy.toString(),
//       LastEditedBy: shop.LastEditedBy.toString(),
//       createdAt: shop.createdAt.toISOString(),
//       updatedAt: shop.updatedAt.toISOString(),
//     }));

//     return new Response(JSON.stringify({ Shops }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error in GET API:", error);
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }


// export async function GET(req) {
//   try {
//     await connectDB();

//     const Shops = await shops.find({}).lean();

//     return new Response(JSON.stringify({ Shops }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error in GET API:", error);
//     return new Response(JSON.stringify({ message: error.message }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }
