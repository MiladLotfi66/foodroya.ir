// app/api/shop/checkUnique/route.js

import Shops from "@/templates/Shop/shops"; 
import connectDB from "@/utils/connectToDB";
import mongoose from "mongoose"; // اطمینان از وارد کردن mongoose

export async function POST(request) {
  try {
    const body = await request.json();

    const { ShopUniqueName, currentShopId } = body;


    if (!ShopUniqueName) {
      console.error("ShopUniqueName is missing");
      return new Response(JSON.stringify({ error: "ShopUniqueName is required" }), { status: 400 });
    }

    await connectDB();

    const query = { ShopUniqueName };

    if (currentShopId) {
      // بررسی اعتبار ObjectId
      if (!mongoose.Types.ObjectId.isValid(currentShopId)) {
        console.error("Invalid currentShopId");
        return new Response(JSON.stringify({ error: "Invalid currentShopId" }), { status: 400 });
      }
      // تبدیل currentShopId به ObjectId با استفاده از new
      query._id = { $ne: new mongoose.Types.ObjectId(currentShopId) };
    }

    const shop = await Shops.findOne(query);

    if (shop) {
      return new Response(JSON.stringify({ error: "این نام فروشگاه تکراری می‌باشد" }), { status: 400 });
    } else {
      return new Response(JSON.stringify({ message: "این نام فروشگاه منحصر به فرد است" }), { status: 200 });
    }
  } catch (error) {
    console.error("Error in /api/shop/checkUnique:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
