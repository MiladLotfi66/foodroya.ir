"use client";
import NewProductBody from "@/module/home/NewProductBody";
import ChevronDown from "@/module/svgs/ChevronDown";
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { GetAllShopEnableProducts } from "@/templates/panel/Product/ProductActions";

function NewProduct() {
 
  const {
    currentShopId,
    shopName,
    shopLogo,
    shopTextLogo,
    shopPanelImage,
    shopImage,
    shopUniqName,
    baseCurrency,
     } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
  const BGImage=shopImage;

  // تغییر وضعیت به یک رشته خالی
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const GetAllShopEnableProductsHandler = useCallback(
    async (page = 1, limit = 10) => {
      try {
        if (!ShopId) {
          console.error("نام یکتای فروشگاه موجود نیست.");
          setError("شناسه فروشگاه موجود نیست.");
          return;
        }

        setLoading(true);
        setError('');

        const response = await GetAllShopEnableProducts(ShopId, page, limit);

        if (response.status === 200) {
          setProducts(response.data.products);
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
    [ShopId]
  );

  useEffect(() => {
    if (ShopId) {
      GetAllShopEnableProductsHandler(pagination.currentPage, pagination.limit);
    }
  }, [GetAllShopEnableProductsHandler, ShopId]);

  // هندلر تغییر صفحه
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      GetAllShopEnableProductsHandler(newPage, pagination.limit);
    }
  };

  // هندلر تغییر تعداد آیتم‌ها در هر صفحه
  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      currentPage: 1, // بازنشانی به صفحه اول
    }));
    GetAllShopEnableProductsHandler(1, newLimit);
  };

  return (
    // استفاده از استایل اینلاین برای تنظیم تصویر پس‌زمینه
    <section
      data-aos='fade-up'
      className="bg-no-repeat bg-cover bg-center w-full"
      style={{
        backgroundImage: BGImage ? `url(${BGImage})` : undefined,
        // اضافه کردن یک پیش‌زمینه پیش‌فرض در صورت عدم وجود BGImage می‌تواند مفید باشد
        backgroundColor: BGImage ? undefined : '#f0f0f0',
      }}
    >
      <div className="lightlinergradient dark:darklinergradient w-full ">
        <div className="container flex items-end justify-between">
          <div className="pt-10 md:pt-48">
            <h3 className="section_title">جدید ترین محصولات</h3>
            <h3 className="section_Sub_title">آماده ارسال</h3>
          </div>
          <a href="#" className="section_showmore">
            <span className="hidden md:inline-block"> مشاهده همه محصولات</span>
            <span className="inline-block md:hidden "> مشاهده همه </span>

            <svg className="w-4 h-4 rotate-90">
              <ChevronDown />
            </svg>
          </a>
        </div>

        {/* نمایش وضعیت بارگذاری و خطا */}
        <div className="container mt-8">
          {loading ? (
            <p>در حال بارگذاری...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {/* نمایش محصولات */}
              <NewProductBody products={products}  ShopId={ShopId}/>

              {/* اجزای صفحه‌بندی */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-1 border rounded ${
                      pagination.currentPage === 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    قبلی
                  </button>
                  <span className="mx-2">
                    صفحه {pagination.currentPage} از {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-1 border rounded ${
                      pagination.currentPage === pagination.totalPages
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    بعدی
                  </button>
                </div>
                <div className="flex items-center">
                  <label htmlFor="limit" className="mr-2">
                    تعداد در هر صفحه:
                  </label>
                  <select
                    id="limit"
                    value={pagination.limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
                    className="border rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default NewProduct;
