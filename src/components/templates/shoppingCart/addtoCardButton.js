'use client'; // اگر از Next.js 13 به بالا استفاده می‌کنید، این خط را اضافه کنید

import { useDispatch } from 'react-redux';
import { addToCart, removeFromCart } from '@/Redux/features/mobileMenu/cartSlice';
import { addToCartAction } from './ShopingCartServerActions';
import {  useSession } from "next-auth/react";



const AddToCartButton = ({ product, price, shop, quantity }) => {
  const { data: session, status } = useSession();
  const userId=session?.user?.id

  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    try {
      // 1. افزودن به Redux
      dispatch(addToCart({
        product: product._id,
        quantity,
        price,
        shop,
        image:product.images[0],
        title:product.title
      }));

      // 2. ارسال درخواست به سرور با Server Action
      const result = await addToCartAction(userId, {
        productId:product._id,
        quantity,
        price,
      },shop);

      if (!result.success) {
        throw new Error(result.message);
      }

      // Optional: نمایش پیام موفقیت
      alert(result.message);
    } catch (error) {
      console.error('خطا:', error);
      // در صورت خطا، تغییرات Redux را بازگردانید
      dispatch(removeFromCart({ product: productId, shop }));
      alert(error.message || 'خطا در افزودن به سبد خرید');
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className="flexCenter w-full bg-blue-500 hover:bg-blue-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded transition-colors"
    >
      افزودن به سبد خرید
      <svg className="h-4 w-4 md:h-[22px] md:w-[22px] m-2">
        <use href="#Basketsvg"></use>
      </svg>
    </button>
  );
};

export default AddToCartButton;