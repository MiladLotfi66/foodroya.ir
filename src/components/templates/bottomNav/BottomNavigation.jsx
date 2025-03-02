// components/Navbar.jsx
"use client";
import Link from 'next/link';
import { FaUser, FaShoppingCart, FaCompass, FaBell, FaStore } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toggleBasketCart } from '@/Redux/features/mobileMenu/mobileMenuSlice';

export default function BottomNavigation() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const isActive = (path) => {
    return pathname === path;
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    console.log('Cart button clicked');
    dispatch(toggleBasketCart());
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden shadow-lg">
      <div className="flex justify-between items-center h-16 px-4">
        <Link href="/profile" className="flex flex-col items-center justify-center w-full">
          <FaUser className={`text-xl ${isActive('/profile') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>پروفایل</span>
        </Link>
        
        <button 
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center w-full bg-transparent border-none cursor-pointer"
        >
          <FaShoppingCart className={`text-xl ${isActive('/cart') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/cart') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>سبد خرید</span>
        </button>
        
        <Link href="/browse" className="flex flex-col items-center justify-center w-full">
          <FaCompass className={`text-xl ${isActive('/browse') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/browse') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>نیبرو</span>
        </Link>
        
        <Link href="/notifications" className="flex flex-col items-center justify-center w-full">
          <FaBell className={`text-xl ${isActive('/notifications') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/notifications') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>اعلانات</span>
        </Link>
        
        <Link href="/store" className="flex flex-col items-center justify-center w-full">
          <FaStore className={`text-xl ${isActive('/store') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/store') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>غرفه</span>
        </Link>
      </div>
    </div>
  );
}