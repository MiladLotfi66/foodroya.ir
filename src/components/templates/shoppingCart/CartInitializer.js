// components/CartInitializer.js
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCart } from '@/Redux/features/mobileMenu/cartSlice';
import { getCartFromDB } from './ShopingCartServerActions';

const CartInitializer = ({ userId }) => {
  const dispatch = useDispatch();
  const cartLoaded = useSelector(state => state.cart.loaded);

  useEffect(() => {
    const loadCartData = async () => {
      try {
        // 1. ابتدا از localStorage خواندن (برای نمایش فوری)
        const localCart = localStorage.getItem('cart');
        if (localCart && !cartLoaded) {
          dispatch(loadCart(JSON.parse(localCart)));
        }

        // 2. سپس از سرور دریافت کردن (برای همگام‌سازی)
        if (userId) {
          const { success, items } = await getCartFromDB(userId);
          if (success) {
            dispatch(loadCart(items));
            localStorage.setItem('cart', JSON.stringify(items));
          }
        }
      } catch (error) {
        console.error('خطا در بارگیری سبد خرید:', error);
      }
    };

    loadCartData();
  }, [userId, dispatch, cartLoaded]);

  return null;
};

export default CartInitializer;