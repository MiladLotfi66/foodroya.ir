"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GetAllShopsEnableProducts } from "@/templates/panel/Product/ProductActions";
import Image from "next/image";
import AddToCartButton from "@/templates/shoppingCart/addtoCardButton";
import { useInView } from "react-intersection-observer";
import Basketsvg from "@/module/svgs/Basketsvg";
import Chatsvg from "@/module/svgs/ChatSVG";
import Star from "@/module/svgs/Star";

function AllShopsProducts() {
  console.log("111111111aaaaaaaaaaaaaaaaaa22222222222222222222");
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantities, setQuantities] = useState({});

  // استفاده از useInView برای بررسی مشاهده شدن المنت
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const GetAllShopsEnableProductsHandler = useCallback(
    async (page = 1, limit = 15) => {
      try {
        setLoading(true);
        setError("");

        const response = await GetAllShopsEnableProducts(page, limit);

        if (response.status === 200) {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...response.data.products,
          ]);
          setPagination(response.data.pagination);

          // تنظیم تعداد اولیه برای هر محصول در صورت لود صفحه اول
          if (page === 1) {
            const initialQuantities = {};
            response.data.products.forEach((product) => {
              initialQuantities[product.id] = 1; // مقدار پیش‌فرض
            });
            setQuantities(initialQuantities);
          }
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
      }
    },
    []
  );

  useEffect(() => {
    GetAllShopsEnableProductsHandler(pagination.currentPage, pagination.limit);
  }, [GetAllShopsEnableProductsHandler, pagination.currentPage, pagination.limit]);

  // لود صفحه جدید هنگام مشاهده شدن المنت
  useEffect(() => {
    if (inView && !loading && pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }, [inView, loading, pagination.currentPage, pagination.totalPages]);

  const handleIncrease = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: prev[productId] + 1,
    }));
  };

  const handleDecrease = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: prev[productId] > 1 ? prev[productId] - 1 : 1,
    }));
  };

  if (loading && products.length === 0) {
    return <div className="text-center">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="relative bg-white p-4 md:p-6 lg:p-8 mt-10 md:mt-12 dark:bg-zinc-700 shadow-lg rounded-2xl">
      <div className="hidden">
        <Basketsvg />
        <Chatsvg />
        <Star />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const currentShopId = product.shopId;

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-800 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-48">
                <Image
                  className="object-cover w-full h-full"
                  src={product.images[0]}
                  alt={`${product.title} محصول`}
                  // width={100}
                  // height={100}
                  quality={50}
                  fill // استفاده از پراپ fill به جای layout
                  placeholder="blur"
                  blurDataURL="/placeholder.png" // یک تصویر placeholder کوچک

                  // className="w-36 h-32 mx-auto md:w-48 md:h-48 rounded-md"
                  // src={product?.images[0]}
                  // alt="signalmobile procuct"
                 
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h4 className="text-center text-zinc-700 dark:text-white font-DanaMedium text-lg lg:text-xl mb-2 flex-1">
                  {product.title}
                </h4>

                {/* <div className="mb-4">
                  {Number(product.stock) > 0 ? (
                    <div className="text-teal-600 dark:text-emerald-500 text-xl font-DanaDemiBold">
                      {new Intl.NumberFormat("fa-IR", {
                        style: "currency",
                        currency: "IRT",
                      }).format(userPrice)}{" "}
                      <span className="text-sm">{baseCurrency.title}</span>
                    </div>
                  ) : (
                    <div className="text-red-600 font-DanaDemiBold text-xl">
                      ناموجود
                    </div>
                  )}
                </div> */}

                {/* {Number(product.stock) > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDecrease(product.id)}
                        className="text-lg md:text-xl px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg md:text-xl text-gray-700 dark:text-white">
                        {quantities[product.id]} {product.unit}
                      </span>
                      <button
                        onClick={() => handleIncrease(product.id)}
                        className="text-lg md:text-xl px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded-full hover:bg-teal-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )} */}

                {/* <div className="mt-auto">
                  <AddToCartButton
                    product={product}
                    price={userPrice}
                    shop={currentShopId}
                    quantity={quantities[product.id]}
                    disabled={Number(product.stock) === 0}
                    className="w-full"
                  />
                </div> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loader برای بارگذاری صفحات جدید */}
      {loading && (
        <div className="text-center mt-4">
          <span className="text-gray-600 dark:text-gray-300">در حال بارگذاری...</span>
        </div>
      )}

      {/* المنت مشاهده برای Trigger لود صفحه جدید */}
      {pagination.currentPage < pagination.totalPages && (
        <div ref={ref} className="h-10"></div>
      )}
    </div>
  );
}

export default AllShopsProducts;
