"use client";
import NewProductBody from "@/module/home/NewProductBody";
import ChevronDown from "@/module/svgs/ChevronDown";
import { useParams } from 'next/navigation';
import { GetShopLogos } from "@/templates/Shop/ShopServerActions";
import { useCallback, useEffect, useState } from 'react';

function NewProduct() {
  const params = useParams();

  const { ShopId } = params;

  // تغییر وضعیت به یک رشته خالی
  const [BGImage, setBGImage] = useState('');

  const getShopPanelImage = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetShopLogos(ShopId);

      // اطمینان از اینکه URL تصویر وجود دارد
      if (response.logos && response.logos.backgroundPanelUrl) {
        setBGImage(response.logos.backgroundShopUrl);
      } else {
        console.warn("URL تصویر پس‌زمینه یافت نشد.");
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    getShopPanelImage();
  }, [getShopPanelImage]);

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
        <NewProductBody />
      </div>
    </section>
  );
}

export default NewProduct;
