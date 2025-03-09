"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { GetAllShopsEnableProducts } from "@/templates/panel/Product/ProductActions";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import ShopMicroInfo from "@/templates/Shop/ShopMicroInfo";
import Link from "next/link";



// کامپوننت ProductCard به صورت memo شده
const ProductCard = memo(({ product }) => {
  return (
    <div
      className="bg-white dark:bg-zinc-800 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden flex flex-col"
    >
              {/* نمایش اطلاعات فروشگاه */}
              <div className="p-2">
        <ShopMicroInfo shop={product.ShopId} size="small" className="mt-1 mb-1" />
      </div>

      <div className="relative w-full h-48"> {/* فاصله از لبه‌ها با p-4 */}
  <div className="relative w-full h-full rounded-sm overflow-hidden">
    <Image
      src={product.images[0] || "/placeholder.png"}
      alt={`${product.title} محصول`}
      quality={50}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover"
      placeholder="blur"
      blurDataURL="/placeholder.png"
    />
  </div>
</div>




      <div className="p-4 flex flex-col flex-1">
      <Link href={`/product/${product._id}`}>

        <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-lg lg:text-xl mb-2 flex-1">
          {product.title || "محصول بدون عنوان"}
        </h4>
      </Link>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

function AllShopsProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // استفاده از useInView برای بررسی مشاهده شدن المنت
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  
  // استفاده از useRef برای کنترل درخواست‌های همزمان
  const isLoadingRef = React.useRef(false);
  const currentPageRef = React.useRef(1);
  
  // بهینه‌سازی fetchProducts با استفاده از useCallback
  const fetchProducts = useCallback(async (page, limit) => {
    // جلوگیری از درخواست‌های همزمان
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError("");

      const response = await GetAllShopsEnableProducts(page, limit);
      console.log("response", response);

      if (response.status === 200) {
        if (page === 1) {
          // برای صفحه اول، داده‌ها را جایگزین کنید
          // اطمینان از اینکه هر محصول یک شناسه منحصر به فرد داشته باشد
          const productsWithIds = response.data.products.map((product, index) => ({
            ...product,
            // اگر id وجود نداشت، یک id یکتا ایجاد می‌کنیم
            uniqueId: product._id || `generated-${Date.now()}-${index}`
          }));
          setProducts(productsWithIds);
        } else {
          // برای صفحات بعدی، داده‌ها را اضافه کنید با جلوگیری از تکرار
          setProducts(prevProducts => {
            // بررسی وجود محصولات تکراری با توجه به ID واقعی یا ID تولید شده
            const existingIds = new Set(prevProducts.map(p => p._id || p.uniqueId));
            const newProducts = response.data.products
              .filter(p => !existingIds.has(p._id))
              .map((product, index) => ({
                ...product,
                uniqueId: product._id || `generated-${Date.now()}-${index + prevProducts.length}`
              }));
            return [...prevProducts, ...newProducts];
          });
        }
        
        // به‌روزرسانی پاگینیشن و مرجع صفحه فعلی
        setPagination(response.data.pagination);
        currentPageRef.current = page;
      } else {
        setError(
          response.message || "خطایی در دریافت محصولات رخ داده است."
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("خطایی در دریافت محصولات رخ داده است.");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // لود داده‌های اولیه فقط یک بار
  useEffect(() => {
    fetchProducts(1, pagination.limit);
  }, [fetchProducts, pagination.limit]);

  // جدا کردن useEffect برای افزودن صفحه با کنترل دقیق‌تر
  useEffect(() => {
    if (
      inView && 
      !isLoadingRef.current && 
      currentPageRef.current < pagination.totalPages
    ) {
      const nextPage = currentPageRef.current + 1;
      fetchProducts(nextPage, pagination.limit);
    }
  }, [inView, pagination.totalPages, pagination.limit, fetchProducts]);

  if (loading && products.length === 0) {
    return <div className="text-center">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="relative bg-white p-4 md:p-6 lg:p-8 mt-5 md:mt-10 dark:bg-zinc-700 shadow-lg rounded-2xl max-h-[87vh] overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={`product-${product._id || product.uniqueId}`}
            product={product}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center mt-4">
          <span className="text-gray-600 dark:text-gray-300">در حال بارگذاری...</span>
        </div>
      )}

      {!loading && pagination.currentPage < pagination.totalPages && (
        <div ref={ref} className="h-10"></div>
      )}
    </div>
  );
}

export default AllShopsProducts;

