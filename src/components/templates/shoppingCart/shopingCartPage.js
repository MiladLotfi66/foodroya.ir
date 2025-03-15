'use client';

import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, fetchCart } from '@/Redux/features/mobileMenu/cartSlice';
import { updateCartItemAction, removeCartItemAction } from './ShopingCartServerActions';
import Link from 'next/link';
import { useShopInfoFromRedux } from '@/utils/getShopInfoFromREdux';
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image';

const ShopingCartPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  
  const cartStatus = useSelector((state) => state.cart.status);
  const cartError = useSelector((state) => state.cart.error);
  const userId = session?.user?.id;
  const { currentShopId, shopLogo, shopTextLogo, baseCurrency } = useShopInfoFromRedux();
  
  // برای نگهداری آیدی سبد انتخاب شده
  const [selectedCartId, setSelectedCartId] = useState(currentShopId);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId]);

  // گروه‌بندی آیتم‌ها بر اساس فروشگاه
  const groupedCart = cartItems.reduce((acc, item) => {
    const shopId = item.shop;
    if (!acc[shopId]) {
      acc[shopId] = {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        shopLogo: item?.shopInfo?.LogoUrl,
        ShopName: item?.shopInfo?.ShopName,
        lastUpdated: item.lastUpdated || new Date().toISOString(), // برای مرتب‌سازی سبدها
      };
    }
    
    // بروزرسانی تاریخ آخرین بروزرسانی سبد اگر آیتم جدیدتری داشته باشد
    if (item.lastUpdated && new Date(item.lastUpdated) > new Date(acc[shopId].lastUpdated)) {
      acc[shopId].lastUpdated = item.lastUpdated;
    }
    
    acc[shopId].items.push(item);
    acc[shopId].totalQuantity += item.quantity;
    acc[shopId].totalAmount += item.price * item.quantity;
    return acc;
  }, {});

  // مرتب‌سازی سبدها براساس تاریخ بروزرسانی (نزولی - جدیدترین اول)
  const sortedShops = Object.keys(groupedCart)
    .map(shopId => ({ shopId, ...groupedCart[shopId] }))
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  // جدیدترین سبد خرید (اولین آیتم در لیست مرتب‌شده)
  const newestShopId = sortedShops.length > 0 ? sortedShops[0].shopId : currentShopId;
  
  // تنظیم سبد فعلی به جدیدترین سبد اگر هنوز انتخاب نشده باشد
  useEffect(() => {
    if (sortedShops.length > 0 && !selectedCartId) {
      setSelectedCartId(newestShopId);
    }
  }, [sortedShops, newestShopId, selectedCartId]);

  const selectedShopItems = groupedCart[selectedCartId]?.items || [];
  const otherShops = sortedShops.filter(shop => shop.shopId !== selectedCartId);

  // فرمت‌کننده قیمت
  const formatter = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: baseCurrency.decimalPlaces,
    maximumFractionDigits: baseCurrency.decimalPlaces,
  });

  // محاسبه جمع کل سبد انتخاب‌شده
  const selectedCartTotal = selectedShopItems.reduce(
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

  // تغییر سبد خرید فعال
  const handleCartChange = (shopId) => {
    setSelectedCartId(shopId);
  };

  if (cartStatus === 'loading') {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">سبد خرید</h2>
        </div>
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (cartStatus === 'failed') {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">سبد خرید</h2>
        </div>
        <div className="text-red-500">خطا: {cartError}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">سبد خرید</h2>
        </div>
        <div className="flex flex-col justify-center items-center p-10 text-gray-500 dark:text-gray-300">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="text-lg font-bold mb-4">سبد خرید شما خالی است</h2>
          <Link href="#" className="text-blue-500 hover:underline">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  // اطلاعات فروشگاه فعلی
  const selectedShopInfo = groupedCart[selectedCartId] || {};
  const { ShopName = 'فروشگاه', shopLogo: currentLogo = '/images/default-shop.jpg' } = selectedShopInfo;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">سبد خرید</h2>
      </div>

      {/* نمایش اطلاعات فروشگاه فعلی */}
      <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md mb-4">
        <div className="flex items-center gap-3">
          {currentLogo && (
            <div className="w-12 h-12 relative flex-shrink-0">
              <Image
                src={currentLogo}
                alt={ShopName}
                width={48}
                height={48}
                className="rounded-full object-cover"
                onError={(e) => { e.target.src = '/images/default-shop.jpg'; }}
              />
            </div>
          )}
          <div>
            <h3 className="font-DanaDemiBold text-lg">{ShopName}</h3>
            <p className="text-sm text-gray-500">{selectedShopItems.length} محصول در سبد خرید</p>
          </div>
        </div>
      </div>

      {/* سبد خرید فروشگاه فعلی */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto mb-4">
        {selectedShopItems.length > 0 ? (
          selectedShopItems.map((item) => (
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
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            این سبد خرید خالی است
          </div>
        )}
      </div>

      {/* جمع کل و دکمه پرداخت فروشگاه فعلی */}
      {selectedShopItems.length > 0 && (
        <div className="mt-4 p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-DanaDemiBold">
              جمع کل: {formatter.format(selectedCartTotal)} {baseCurrency.title}
            </h3>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              پرداخت
            </button>
          </div>
        </div>
      )}

      {/* سبدهای خرید سایر فروشگاه‌ها */}
      {otherShops.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-DanaDemiBold mb-4">سایر سبدهای خرید شما</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[30vh] overflow-y-auto">
            {otherShops.map((shop) => (
              <button
                key={shop.shopId}
                onClick={() => handleCartChange(shop.shopId)}
                className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-md text-right hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {shop.shopLogo && (
                    <div className="w-10 h-10 relative flex-shrink-0">
                      <Image
                        src={shop.shopLogo}
                        alt={shop.ShopName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        onError={(e) => { e.target.src = '/images/default-shop.jpg'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-DanaMedium text-md">{shop.ShopName}</h4>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{shop.totalQuantity} محصول</p>
                  <p className="font-DanaMedium text-blue-500">
                    {formatter.format(shop.totalAmount)} {baseCurrency.title}
                  </p>
                </div>
                <div className="mt-2 w-full text-center">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    مشاهده سبد
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* اطلاعات تاریخ به‌روزرسانی */}
      {selectedShopItems.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            آخرین به‌روزرسانی: {
              new Date(groupedCart[selectedCartId]?.lastUpdated).toLocaleDateString('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopingCartPage;
