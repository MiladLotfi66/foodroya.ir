'use client';

import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, fetchCart } from '@/Redux/features/mobileMenu/cartSlice';
import { updateCartItemAction, removeCartItemAction } from './ShopingCartServerActions';
import Link from 'next/link';
import { useShopInfoFromRedux } from '@/utils/getShopInfoFromREdux';
import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image'; // وارد کردن Image از Next.js
import CloseSvg from "@/module/svgs/CloseSvg";
import { toggleBasketCart } from '@/Redux/features/mobileMenu/mobileMenuSlice';

const ShopingCartPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartStatus = useSelector((state) => state.cart.status);
  const cartError = useSelector((state) => state.cart.error);
  const userId = session?.user?.id;
  const { baseCurrency } = useShopInfoFromRedux();
  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(userId));
    }
  }, [dispatch, userId]);
  const handleToggleBasketMenu = () => {
    
    dispatch(toggleBasketCart());
  };

 

  // تابع فرمت‌کننده قیمت
  const formatter = new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: baseCurrency.decimalPlaces,
    maximumFractionDigits: baseCurrency.decimalPlaces,
  });

  // محاسبه جمع کل سبد خرید
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // تغییر تعداد محصول
  const handleQuantityChange = async (productId, shopId, newQuantity) => {
    try {
      // به‌روزرسانی Redux
      dispatch(updateQuantity({ product: productId, quantity: newQuantity, shop: shopId }));

      // به‌روزرسانی دیتابیس با Server Action
      await updateCartItemAction(userId, productId, newQuantity);
    } catch (error) {
      console.error('خطا در به‌روزرسانی تعداد:', error);
    }
  };

  // حذف محصول
  const handleRemoveItem = async (productId, shopId) => {
    try {
      // حذف از Redux
      dispatch(removeFromCart({ product: productId, shop: shopId }));

      // حذف از دیتابیس با Server Action
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
    <div className={"min-h-screen p-1 max-w-4xl mx-auto"}>
      <div className="hidden">
      <CloseSvg />
      </div>
      <div className="flex text-center">

      <button
          aria-label="close"
          className="hover:text-orange-300 md:hidden"
            onClick={handleToggleBasketMenu}
          >
          <svg
            width="34"
            height="34"
            >
            <use href="#CloseSvg"
            ></use>
          </svg>
        </button>
        </div>


      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={`${item.product}-${item.shop}`}
            className="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex items-center justify-between"
          >
            {/* بخش تصویر محصول */}
            <div className="w-24 h-24 relative flex-shrink-0">
              <Image
                src={item.image || '/images/default-product.jpg'} // مسیر تصویر یا تصویر پیش‌فرض
                alt={item.title || item.productTitle}
                width={80}
                height={80}
                className="object-cover w-full h-full shadow-md rounded-lg"
                onError={(e) => { e.target.src = '/images/default-product.jpg'; }} // جایگزینی تصویر در صورت خطا
                quality={20}
                priority={true}
             />
            </div>

            {/* اطلاعات محصول */}
            <div className="flex-1 mr-4 flex-row gap-3">
              <h3 className="font-DanaMedium text-lg mb-2">{item.title || item.productTitle}</h3>
              <p className="text-gray-500 mb-1">
                قیمت واحد: {formatter.format(item.price)} {baseCurrency.title}
              </p>
               {/* کنترل تعداد */}
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => handleQuantityChange(item.product, item.shop, item.quantity - 1)}
                className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-md "
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

            {/* قیمت کل و دکمه حذف */}
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

      {/* جمع کل و دکمه پرداخت */}
      <div className="mt-8 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-DanaDemiBold">
            جمع کل: {formatter.format(totalAmount)} {baseCurrency.title}
          </h3>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            پرداخت
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopingCartPage;
