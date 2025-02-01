"use server";
import shoppingCart from "./shoppingCart";
import ShopingCartItems from "./ShopingCartItems";
import connectDB from "@/utils/connectToDB";


export async function GetUserShopingCartInfo() {

  // اتصال به پایگاه داده
  await connectDB();
  try {
    // یافتن فروشگاه بر اساس shopId
    const shop = await shops.findById(shopId).populate({
      path: 'BaseCurrency',
      select: '_id title shortName exchangeRate decimalPlaces ', // انتخاب فیلدهای مورد نیاز از مدل ارز
    })
    .select("_id ShopUniqueName ShopName LogoUrl TextLogoUrl BackGroundShopUrl BackGroundpanelUrl BaseCurrency" )
    .lean();

    if (!shop) {
      return { message: 'Shop not found' ,  status: 404 };
    }
    const serializedShop = {
      ...shop,
      _id: shop._id.toString(),
      BaseCurrency: {
        ...shop.BaseCurrency,
        _id: shop.BaseCurrency._id.toString(),
      },
    };
      return { shop: serializedShop, status: 200 };
      } catch (error) {
    console.error("خطا در دریافت فروشگاه:", error);
    return { error: error.message, status: 500 };
  }


}
  

export const addToCartAction = async (userId, productData,shop) => {
  
  try {
    await connectDB();
    // یافتن سبد خرید کاربر
    let cart = await shoppingCart.findOne({ user: userId });

    // اگر سبد خرید وجود نداشت، یک سبد جدید ایجاد کنید
    if (!cart) {
      cart = await shoppingCart.create({ user: userId, ShopingCartItems: [] });
    }
console.log("product:Shop:user: ",productData.productId,userId,shop);

        // بررسی وجود محصول در سبد خرید
        const existingItem = await ShopingCartItems.findOne({
          product: productData.productId,
          Shop: shop,
          user: userId
        });
    console.log("existingItem",existingItem);
    
        if (existingItem) {
          existingItem.quantity += productData.quantity;
          await existingItem.save();
        } else {
          const newCartItem = await ShopingCartItems.create({
            product: productData.productId,
            quantity: productData.quantity,
            price: productData.price,
            Shop: shop,
            user: userId,

          });
          cart.ShopingCartItems.push(newCartItem._id);
        }
    
        await cart.save();
        return { message:"کالا با موفقیت به سبد خرید اضافه شد",success: true };
      } catch (error) {
        console.error('خطا در افزودن به سبد خرید:', error);
        return { success: false };
      }
    };
export const getCartItemsAction = async (userId) => {
  try {
    await connectDB();
    const cart = await shoppingCart.findOne({ user: userId }).populate('ShopingCartItems');
    return cart?.ShopingCartItems || [];
  } catch (error) {
    console.error('خطا در دریافت سبد خرید:', error);
    return [];
  }
};


// به‌روزرسانی تعداد محصول
export const updateCartItemAction = async (userId, productId, newQuantity) => {
  try {
    await connectDB();
    
    await ShopingCartItems.findOneAndUpdate(
      { product: productId, user: userId },
      { quantity: newQuantity }
    );
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// حذف محصول از سبد خرید
export const removeCartItemAction = async (userId, productId) => {
  try {
    await connectDB();
    
    await ShopingCartItems.findOneAndDelete({
      product: productId,
      user: userId
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};



// actions/cartActions.js
export const getCartFromDB = async (userId) => {
  
  try {
    await connectDB();
    
    const cart = await shoppingCart.findOne({ user: userId })
      .populate({
        path: 'ShopingCartItems',
        populate: [
          { path: 'product', select: 'title images' },
          { path: 'Shop', select: 'name' }
        ]
      });
      console.log("getCartFromDB>cart",cart.ShopingCartItems);

    return {
      items: cart?.ShopingCartItems?.map(item => ({
        product: item.product._id.toString(),
        productTitle: item.product.title,
        price: item.price,
        quantity: item.quantity,
        shop: item.Shop._id.toString(),
        shopName: item.Shop.name,
        image: item.product.images?.[0] || '/default-product.jpg'
      })) || [],
      success: true
    };

  } catch (error) {
    console.error('خطا در دریافت سبد خرید:', error);
    return { items: [], success: false };
  }
};