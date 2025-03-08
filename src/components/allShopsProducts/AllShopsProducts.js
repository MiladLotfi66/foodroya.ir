"use client";
import React, { useCallback, useEffect, useState, useRef } from 'react';
import NewProductBody from "@/module/home/NewProductBody";
import { GetAllShopsEnableProducts } from "@/templates/panel/Product/ProductActions";

function NewProductAllShops() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const observer = useRef();

  const fetchProducts = useCallback(
    async (page = 1, limit = 10) => {
      try {
        setLoading(true);
        setError('');
        const response = await GetAllShopsEnableProducts(page, limit);
        console.log("response", response);

        if (response.status === 200) {
          setProducts(prevProducts => [...prevProducts, ...response.data.products]);
          setPagination(response.data.pagination);
        } else {
          setError(response.message || "خطایی در دریافت محصولات رخ داده است.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("خطایی در دریافت محصولات رخ داده است.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(pagination.currentPage, pagination.limit);
  }, [fetchProducts, pagination.currentPage, pagination.limit]);

  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.currentPage < pagination.totalPages) {
        setPagination(prev => ({
          ...prev,
          currentPage: prev.currentPage + 1
        }));
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, pagination.currentPage, pagination.totalPages]);

  // هندلر تغییر تعداد آیتم‌ها در هر صفحه
  const handleLimitChange = (newLimit) => {
    setPagination({
      currentPage: 1,
      limit: newLimit,
      totalPages: 1,
      totalItems: 0,
    });
    setProducts([]);
    fetchProducts(1, newLimit);
  };

  return (
    // استفاده از استایل اینلاین برای تنظیم تصویر پس‌زمینه
    <section
      data-aos='fade-up'
      className="bg-no-repeat bg-cover bg-center w-full"
    >
      <div className="lightlinergradient dark:darklinergradient w-full ">
        <div className="container flex items-end justify-between">
          <h3 className="section_title">جدید ترین محصولات</h3>
          {/* انتخاب تعداد آیتم‌ها در هر صفحه */}
       
        </div>

        {/* نمایش وضعیت بارگذاری و خطا */}
        <div className="container mt-8">
          {error && <p className="text-red-500">{error}</p>}
          <NewProductBody products={products} />

          {loading && <p>در حال بارگذاری...</p>}

          <div ref={lastProductElementRef} style={{ height: '1px' }}></div>
        </div>
      </div>
    </section>
  );
}

export default NewProductAllShops;
