'use client';

import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, fetchCart } from '@/Redux/features/mobileMenu/cartSlice';
import { updateCartItemAction, removeCartItemAction } from './ShopingCartServerActions';
import Link from 'next/link';
import { useShopInfoFromRedux } from '@/utils/getShopInfoFromREdux';
import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image';
import CloseSvg from "@/module/svgs/CloseSvg";
import { toggleBasketCart } from '@/Redux/features/mobileMenu/mobileMenuSlice';

const ShopingCartPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  
  const cartStatus = useSelector((state) => state.cart.status);
  const cartError = useSelector((state) => state.cart.error);
  const userId = session?.user?.id;
  const { currentShopId, shopLogo, shopTextLogo, baseCurrency } = useShopInfoFromRedux();

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId]);

  const handleToggleBasketMenu = () => {
    dispatch(toggleBasketCart());
  };

  // گروه‌بندی آیتم‌ها بر اساس فروشگاه
  const groupedCart = cartItems.reduce((acc, item) => {
    
    const shopId = item.shop;
    if (!acc[shopId]) {
      acc[shopId] = {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        shopLogo: item?.shopInfo?.LogoUrl,
        ShopName: item?.shopInfo?.ShopName
        // shopTextLogo: item.shopInfo.shopTextLogo
      };
    }
    acc[shopId].items.push(item);
    acc[shopId].totalQuantity += item.quantity;
    acc[shopId].totalAmount += item.price * item.quantity;
    return acc;
  }, {});

  const currentShopItems = groupedCart[currentShopId]?.items || [];
  const otherShops = Object.keys(groupedCart)
    .filter(shopId => shopId !== currentShopId)
    .map(shopId => ({ shopId, ...groupedCart[shopId] }));

  // فرمت‌کننده قیمت
  const formatter = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: baseCurrency.decimalPlaces,
    maximumFractionDigits: baseCurrency.decimalPlaces,
  });

  // محاسبه جمع کل فروشگاه فعلی
  const currentShopTotal = currentShopItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // تغییر تعداد محصول
  const handleQuantityChange = async (productId, shopId, newQuantity) => {
    try {
      dispatch(updateQuantity({ product: productId, quantity: newQuantity, shop: shopId }));
      await updateCartItemAction(userId, productId, newQuantity);
    } catch (error) {
      console.error('خطا در به‌روزرسانی تعداد:', error);
    }
  };

  // حذف محصول
  const handleRemoveItem = async (productId, shopId) => {
    try {
      dispatch(removeFromCart({ product: productId, shop: shopId }));
      await removeCartItemAction(userId, productId);
    } catch (error) {
      console.error('خطا در حذف محصول:', error);
    }
  };

  if (cartStatus === 'loading') {
    return <div className="min-h-screen p-8 text-center">در حال بارگذاری سبد خرید...</div>;
  }

  if (cartStatus === 'failed') {
    return <div className="min-h-screen p-8 text-center text-red-500">خطا: {cartError}</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">سبد خرید شما خالی است</h2>
        <Link href="#" className="text-blue-500 hover:underline">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1 max-w-4xl mx-auto">
      <div className="hidden">
        <CloseSvg />
      </div>
      <div className="flex text-center">
        <button
          aria-label="close"
          className="hover:text-orange-300 md:hidden"
          onClick={handleToggleBasketMenu}
        >
          <svg width="34" height="34">
            <use href="#CloseSvg"></use>
          </svg>
        </button>
      </div>

      {/* سبد خرید فروشگاه فعلی */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {currentShopItems.map((item) => (
          <div
            key={`${item.product}-${item.shop}`}
            className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="w-24 h-24 relative flex-shrink-0">
              <Image
                src={item.image || '/images/default-product.jpg'}
                alt={item.title}
                width={80}
                height={80}
                className="object-cover w-full h-full shadow-md rounded-lg"
                onError={(e) => { e.target.src = '/images/default-product.jpg'; }}
                quality={20}
                priority={true}
              />
            </div>

            <div className="flex-1 mr-4">
              <h3 className="font-DanaMedium text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 mb-1">
                قیمت واحد: {formatter.format(item.price)} {baseCurrency.title}
              </p>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => handleQuantityChange(item.product, item.shop, item.quantity - 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-md"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product, item.shop, item.quantity + 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-md"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-4 mb-1">
                <p className="font-DanaDemiBold">
                  {formatter.format(item.price * item.quantity)} {baseCurrency.title}
                </p>
                <button
                  onClick={() => handleRemoveItem(item.product, item.shop)}
                  className="text-red-500 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
     {/* جمع کل و دکمه پرداخت فروشگاه فعلی */}
     {currentShopItems.length > 0 && (
        <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-md ">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-DanaDemiBold">
              جمع کل: {formatter.format(currentShopTotal)} {baseCurrency.title}
            </h3>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              پرداخت
            </button>
          </div>
        </div>
      )}
      {/* سبدهای خرید سایر فروشگاه‌ها */}
      {otherShops.length > 0 && (
        <div className="mt-4 max-h-[30vh] overflow-y-auto">
          <h3 className="text-lg font-DanaDemiBold mb-4">سبد خرید های دیگر شما</h3>
          <div className="flex flex-wrap gap-4">
            {otherShops.map((shop) => (
              <div
                key={shop.shopId}
                className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md flex-row items-center gap-3"
              >
                {shop.shopLogo && (
                  <Image
                    src={shop.shopLogo}
                    alt={shop.ShopName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                 <div className=" flex items-center justify-center">
                    {shop.ShopName}
                  </div>
                <div>
                  <p className="text-sm">{shop.totalQuantity} عدد</p>
                  <p className="text-sm">
                    {formatter.format(shop.totalAmount)} 
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

 
    </div>
  );
};

export default ShopingCartPage;