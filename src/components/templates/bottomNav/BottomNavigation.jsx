// components/Navbar.jsx
"use client";
import Link from 'next/link';
import { FaUser, FaShoppingCart, FaCompass, FaBell, FaStore } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path;
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50  shadow-lg">
      <div className="flex justify-between items-center h-16 px-4">
        <Link href="/profile" className="flex flex-col items-center justify-center w-full">
          <FaUser className={`text-xl ${isActive('/profile') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/profile') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>پروفایل</span>
        </Link>
        
        <button 

          className="flex flex-col items-center justify-center w-full bg-transparent border-none cursor-pointer"
        >
                <Link href="/ShopingCart" className="flex flex-col items-center justify-center w-full">
          <FaShoppingCart className={`text-xl ${isActive('/cart') ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isActive('/cart') ? 'text-green-600 font-medium' : 'text-gray-600'}`}>سبد خرید</span>
          </Link>

        </button>
        
        <Link href="/allProducts" className="flex flex-col items-center justify-center w-full">
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