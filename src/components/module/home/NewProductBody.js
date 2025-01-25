"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard"
import { GetUserRolesInShop } from "@/templates/panel/Contact/contactsServerActions";

function NewProductBody({ products ,ShopId}) {
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // استفاده از useEffect برای فراخوانی تابع دریافت نقش‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    async function fetchRoles() {
      try {
        const roles = await GetUserRolesInShop(ShopId); // اطمینان حاصل کنید که این تابع نقش‌ها را بازمی‌گرداند
        setUserRoles(roles);
      } catch (err) {
        console.error('خطا در دریافت نقش‌های کاربر:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  // فیلتر کردن محصولات نامعتبر
  const validProducts = products.filter(product => product && product._id);

  if (loading) {
    return <div>در حال بارگذاری نقش‌ها...</div>;
  }


  if (validProducts.length === 0) {
    return <div>هیچ محصولی برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-3.5 md:gap-5 pb-5">
      {validProducts.map((product) => (
        <ProductCard key={product._id} product={product} userRoles={userRoles}/>
      ))}
    </div>
  )
}

export default NewProductBody
