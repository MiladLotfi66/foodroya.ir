"use client";
import { useSelector, useDispatch } from 'react-redux';
import { selectBasketCart, toggleBasketCart } from '@/Redux/features/mobileMenu/mobileMenuSlice';
import ShopingCartPage from './shopingCartPage';
import { useEffect } from 'react';

export default function BasketCartModal() {
  const isOpen = useSelector(selectBasketCart);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('BasketCart is open:', isOpen);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => dispatch(toggleBasketCart())}
      ></div>
      
      {/* Sliding panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white dark:bg-zinc-800 shadow-xl overflow-y-auto">
            <ShopingCartPage />
          </div>
        </div>
      </div>
    </div>
  );
} 