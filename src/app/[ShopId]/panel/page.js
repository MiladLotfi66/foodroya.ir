"use client";
import FormTemplate from '@/templates/generalcomponnents/formTemplate';
import Link from 'next/link';
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";


function Page() {
  const {
    currentShopId,
    shopPanelImage,

  
  } = useShopInfoFromRedux();
  const ShopId  = currentShopId;
  const BGImage =shopPanelImage;

  return (
    <FormTemplate BGImage={BGImage}>
      <div className="bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl mt-8 md:mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-8 md:mt-36">
          <h1 className="text-2xl md:text-3xl font-MorabbaBold">مدیریت فروشگاه</h1>
       
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16 max-h-[70vh] overflow-y-auto">
      <Link className='p-3' href={`/${ShopId}/panel/banners`} >بنر ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/roles`} >نقش ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/sendMetod`} > روش های ارسال</Link>
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
