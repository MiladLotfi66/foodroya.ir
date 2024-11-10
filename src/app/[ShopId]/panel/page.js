"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
function Page() {
  const params = useParams();
  const { ShopId} = params;
 
  return (
    <div>
      <Link className='p-3' href={`/${ShopId}/panel/banners`} >بنر ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/roles`} >نقش ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/currency`} >ارز ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/account`} >حساب ها</Link>
      <Link className='p-3' href={`/${ShopId}/panel/contact`} >مخاطبین</Link>
      <Link className='p-3' href={`/${ShopId}/panel/priceTemplate`} >قالب قیمت</Link>
      <Link className='p-3' href={`/${ShopId}/panel/products`} >محصولات</Link>
    </div>
  )
}

export default Page
