"use client";
import FormTemplate from '@/templates/generalcomponnents/formTemplate';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GetShopLogos } from "@/templates/Shop/ShopServerActions";
import { useCallback, useEffect, useState } from 'react';

function Page() {
  const params = useParams();
  const { ShopId} = params;
  const [BGImage, setbGImage] = useState([]);
  const getShopPanelImage = useCallback(async () => {
    try {
      if (!ShopId) {
        console.error("نام یکتای فروشگاه موجود نیست.");
        return;
      }

      const response = await GetShopLogos(ShopId);

      setbGImage(response.logos.backgroundPanelUrl);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, [ShopId]);

  useEffect(() => {
    getShopPanelImage();
  }, [ShopId]);

  return (
    <FormTemplate BGImage={BGImage}>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت فروشگاه</h1>
       
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
      <Link className='p-3' href={`/${ShopId}/panel/banners`} >بنر ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/roles`} >نقش ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/currency`} >ارز ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/account`} >حساب ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/contact`} >مخاطبین</Link>
      <Link className='p-3' href={`/${ShopId}/panel/priceTemplate`} >قالب قیمت</Link>
      <Link className='p-3' href={`/${ShopId}/panel/products`} >محصولات</Link>
      <Link className='p-3' href={`/${ShopId}/panel/FinancialDocuments`} >اسناد مالی</Link>
      <Link className='p-3' href={`/${ShopId}/panel/DetailedAccount`} > حساب معین </Link>
      <Link className='p-3' href={`/${ShopId}/panel/PurchaseInvoice`} >فاکتور خرید</Link>
      <Link className='p-3' href={`/${ShopId}/panel/SaleInvoice`} >فاکتور فروش</Link>
      <Link className='p-3' href={`/${ShopId}/panel/PurchaseReturnInvoice`} >برگشت از خرید</Link>
      <Link className='p-3' href={`/${ShopId}/panel/SaleReturnInvoice`} >برگشت از فروش</Link>
      <Link className='p-3' href={`/${ShopId}/panel/WasteInvoice`} >ضایعات</Link>
      <Link className='p-3' href={`/${ShopId}/panel/AllInvoice`} >تمام فاکتور ها</Link>
        </div>
      </div>



    </FormTemplate>
  )
}

export default Page
