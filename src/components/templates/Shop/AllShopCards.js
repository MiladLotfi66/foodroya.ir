"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import ShopCard from "./ShopCard";
import { GetAllEnableShops, authenticateUser } from "@/templates/Shop/ShopServerActions";
import { GetUserbyUserId } from "@/components/signinAndLogin/Actions/UsersServerActions";
import { GetFilteredShops } from "@/templates/Shop/ShopServerActions";

function AllShopCards() {
  const [shops, setShops] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [additionalFilters, setAdditionalFilters] = useState({});

  // دریافت داده‌ها با استفاده از سرور اکشن
  const fetchFilteredShops = async () => {
    setLoading(true);
    try {
      const response = await GetFilteredShops(activeFilter, searchTerm, additionalFilters);
      
      if (response.status === 200) {
        setShops(response.shops);
      } else {
        console.error("خطا در دریافت غرفه‌ها:", response.error || response.message);
      }
    } catch (error) {
      console.error("خطا در دریافت غرفه‌ها:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserAndShops = async () => {
      try {
        // احراز هویت کاربر
        const userData = await authenticateUser();
        if (userData) {
          const userFullData = await GetUserbyUserId(userData.id);
          setUser(userFullData);
        }

        // در ابتدا همه غرفه‌ها را دریافت می‌کنیم
        await fetchFilteredShops();
      } catch (error) {
        console.error("خطا در دریافت اطلاعات کاربر:", error);
        setLoading(false);
      }
    };
    
    fetchUserAndShops();
  }, []);

  // هر زمان که فیلتر یا متن جستجو تغییر کرد، درخواست جدید ارسال می‌شود
  useEffect(() => {
    // از زمان‌بندی برای جلوگیری از ارسال درخواست‌های متعدد استفاده می‌کنیم
    const timer = setTimeout(() => {
      fetchFilteredShops();
    }, 500); // تاخیر 500 میلی‌ثانیه‌ای برای جلوگیری از درخواست‌های مکرر هنگام تایپ

    return () => clearTimeout(timer);
  }, [activeFilter, searchTerm ,additionalFilters]);

  // تغییر فیلتر فعال
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // تغییر عبارت جستجو
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
    // اضافه کردن یا به روزرسانی فیلترهای اضافی
    const updateAdditionalFilter = (key, value) => {
      setAdditionalFilters(prev => ({
        ...prev,
        [key]: value
      }));
    };
  

  return (
    <FormTemplate>
      <div className="bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl mt-6">
        <div className="flex flex-col md:flex-row justify-between p-2 md:p-5 mt-6">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold mb-4 md:mb-0">فروشگاه‌ها</h1>
          
          {/* بخش فیلترها */}
          <div className="flex flex-col w-full md:w-auto space-y-4">
            {/* نوار جستجو */}
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در غرفه‌ها..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white dark:bg-zinc-800"
                dir="rtl"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            {/* دکمه‌های فیلتر */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                همه غرفه‌ها
              </button>
              <button
                onClick={() => handleFilterChange("yourRoles")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "yourRoles"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                غرفه‌هایی که در آنها نقش دارید
              </button>
              <button
                onClick={() => handleFilterChange("yourAccounts")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "yourAccounts"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                غرفه‌هایی که در آنها حساب دارید
              </button>
              <button
                onClick={() => handleFilterChange("yourContacts")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "yourContacts"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                غرفه‌هایی که در آنها مخاطب هستید
              </button>
              <button
                onClick={() => handleFilterChange("yourShops")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "yourShops"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                غرفه‌های شما
              </button>
              <button
                onClick={() => handleFilterChange("following")}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  activeFilter === "following"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                غرفه‌هایی که دنبال می‌کنید
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[78vh] overflow-y-auto">
            {shops.map((shop) => (
              <ShopCard
                className="p-2 md:p-4"
                key={shop._id}
                Shop={shop}
                user={user?.user}
                editable={false}
                followable={true}
              />
            ))}
          </div>
        ) : (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-xl font-semibold">غرفه‌ای یافت نشد</p>
            <p className="mt-2 text-center">
              با معیارهای فیلتر فعلی هیچ غرفه‌ای یافت نشد. لطفا معیارهای جستجو را تغییر دهید.
            </p>
          </div>
        )}
      </div>
    </FormTemplate>
  );
}

export default AllShopCards;
