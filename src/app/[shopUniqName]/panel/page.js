"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
function Page() {
  const params = useParams();
  const { shopUniqName} = params;
 
  return (
    <div>
      <Link className='p-3' href={`/${shopUniqName}/panel/banners`} >بنر ها</Link>
      <Link className='p-3' href={`/${shopUniqName}/panel/roles`} >نقش ها</Link>
      <Link className='p-3' href={`/${shopUniqName}/panel/currency`} >ارز ها</Link>
    </div>
  )
}

export default Page
