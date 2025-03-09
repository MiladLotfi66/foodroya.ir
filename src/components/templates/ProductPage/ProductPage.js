"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ShopMicroInfo from "@/templates/Shop/ShopMicroInfo";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "../panel/Product/ProductActions";
import Link from "next/link";
import { toast } from "react-hot-toast"; // اضافه کردن toast برای نمایش پیام‌ها

function ProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1); // مقدار پیش‌فرض برای تعداد محصول
  const [addingToCart, setAddingToCart] = useState(false); // وضعیت اضافه کردن به سبد خرید
  const params = useParams();
  const { ProductId } = params;
  const router = useRouter();

  useEffect(() => {
    if (ProductId) {
      fetchProductDetails(ProductId);
    }
  }, [ProductId]);

  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true);
      const res = await getProductById(ProductId);
      console.log(res);
      
      if (res && res.product) {
        setProduct(res.product);
        setError("");
      } else {
        setError("اطلاعات محصول یافت نشد");
      }
    } catch (error) {
      console.error("خطا در دریافت اطلاعات محصول:", error);
      setError("متأسفانه خطایی در دریافت اطلاعات محصول رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // بررسی موجودی محصول
    if (!product.isSaleable) {
      toast.error("این محصول قابل فروش نیست");
      return;
    }

    if (product.stock < quantity) {
      toast.error(`موجودی محصول کافی نیست. موجودی فعلی: ${product.stock} ${product.unit}`);
      return;
    }

    try {
      setAddingToCart(true);
      
      // اینجا باید API اضافه کردن به سبد خرید را فراخوانی کنید
      // به عنوان مثال:
      // await addToCart(product._id, quantity);
      
      // شبیه‌سازی API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("محصول با موفقیت به سبد خرید اضافه شد");
      
      // در صورت نیاز، کاربر را به صفحه سبد خرید هدایت کنید
      // router.push('/cart');
    } catch (error) {
      console.error("خطا در افزودن به سبد خرید:", error);
      toast.error("متأسفانه خطایی در افزودن محصول به سبد خرید رخ داده است");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen max-h-[87vh] overflow-y-auto">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2">در حال بارگذاری اطلاعات محصول...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen max-h-[87vh] overflow-y-auto">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen max-h-[87vh] overflow-y-auto">
        <div className="text-center">
          <p>محصول مورد نظر یافت نشد.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-h-[87vh] overflow-y-auto">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        {/* هدر محصول و اطلاعات فروشگاه */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {product.ShopId && (
            <ShopMicroInfo shop={product.ShopId} size="medium" className="mb-4" />
          )}
          <h1 className="text-2xl font-DanaBold text-gray-800 dark:text-white mb-2">
            {product.title}
          </h1>
          
          {/* نمایش تگ‌ها */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {product.tags.map(tag => (
                <span key={tag._id} className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-xs rounded-full text-gray-600 dark:text-gray-300">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:flex">
          {/* گالری تصاویر */}
          <div className="md:w-1/2 p-4">
            <div className="relative h-80 mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={product.images[0] || "/placeholder.png"}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
                quality={80}
              />
            </div>
            
            {/* تصاویر کوچک */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <div key={index} className="relative h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={img || "/placeholder.png"}
                      alt={`${product.title} - تصویر ${index + 1}`}
                      fill
                      sizes="25vw"
                      className="object-cover cursor-pointer"
                      quality={50}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* اطلاعات قیمت و توضیحات */}
          <div className="md:w-1/2 p-4">
            {/* قیمت و خرید */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg">
              <h2 className="text-xl font-DanaMedium text-gray-700 dark:text-gray-300 mb-4">
                قیمت و موجودی
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">قیمت فروش:</span>
                  <span className="text-xl font-DanaBold text-primary">
                    {product.price?.toLocaleString() || 0} تومان
                  </span>
                </div>
                
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">آخرین قیمت خرید:</span>
                  <span className="text-lg font-DanaMedium text-gray-700 dark:text-gray-300">
                    {product.lastPurchasePrice?.toLocaleString() || 0} تومان
                  </span>
                </div>
                
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">موجودی:</span>
                  <span className="text-lg font-DanaMedium text-gray-700 dark:text-gray-300">
                    {product.stock} {product.unit}
                  </span>
                </div>
                
                <div>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">حداقل موجودی:</span>
                  <span className="text-lg font-DanaMedium text-gray-700 dark:text-gray-300">
                    {product.minStock} {product.unit}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${product.isSaleable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                    {product.isSaleable ? 'قابل فروش' : 'غیرقابل فروش'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${product.isMergeable ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {product.isMergeable ? 'قابل ادغام' : 'غیرقابل ادغام'}
                  </span>
                </div>
              </div>

              {/* قسمت انتخاب تعداد محصول */}
              <div className="mt-4 flex items-center">
                <label htmlFor="quantity" className="ml-2 text-gray-600 dark:text-gray-300">تعداد:</label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-x border-gray-300 dark:border-gray-600 py-1 bg-transparent text-gray-800 dark:text-white"
                  />
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-600"
                  >
                    +
                  </button>
                </div>
                <span className="mr-2 text-gray-500 dark:text-gray-400">{product.unit}</span>
              </div>

              {/* دکمه افزودن به سبد خرید */}
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart || !product.isSaleable || product.stock < 1}
                className={`w-full mt-4 py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                  product.isSaleable && product.stock > 0
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {addingToCart ? (
                  <>
                    <span className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></span>
                    در حال افزودن...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    افزودن به سبد خرید
                  </>
                )}
              </button>
            </div>
            
            {/* محل نگهداری */}
            {product.storageLocation && (
              <div className="mb-6">
                <h2 className="text-xl font-DanaMedium text-gray-700 dark:text-gray-300 mb-2">
                  محل نگهداری
                </h2>
                <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.storageLocation}
                  </p>
                </div>
              </div>
            )}
            
            {/* توضیحات محصول */}
            {product.description && (
              <div className="mb-6">
                <h2 className="text-xl font-DanaMedium text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات محصول
                </h2>
                <div className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                    {product.description || "توضیحاتی برای این محصول ثبت نشده است."}
                  </p>
                </div>
              </div>
            )}
            
            {/* ویژگی‌های محصول */}
            {product.Features && product.Features.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-DanaMedium text-gray-700 dark:text-gray-300 mb-2">
                  ویژگی‌های محصول
                </h2>
                <div className="border rounded-lg overflow-hidden">
                  {product.Features.map((feature, index) => (
                    <div 
                      key={feature._id} 
                      className={`flex p-3 ${
                        index % 2 === 0 ? 'bg-gray-50 dark:bg-zinc-700' : 'bg-white dark:bg-zinc-800'
                      }`}
                    >
                      <span className="font-DanaMedium text-gray-700 dark:text-gray-300 w-1/3">
                        {feature.featureKey?.title || feature.featureKey}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 w-2/3">
                        {feature.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* اطلاعات اضافی */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between mb-1">
                <span>ایجاد شده در: {new Date(product.createdAt).toLocaleDateString('fa-IR')}</span>
                <span>توسط: {product.createdBy?.name || "نامشخص"}</span>
              </div>
              {product.updatedAt && (
                <div className="flex justify-between">
                  <span>آخرین بروزرسانی: {new Date(product.updatedAt).toLocaleDateString('fa-IR')}</span>
                  <span>توسط: {product.updatedBy?.name || "نامشخص"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* بخش دکمه‌ها */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <Link href={`/panel/Product/EditProduct/${product._id}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
            ویرایش محصول
          </Link>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors">
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
