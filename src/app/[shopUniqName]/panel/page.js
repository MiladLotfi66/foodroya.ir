"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
function page() {
  const params = useParams();
  const { shopUniqName} = params;
 
  return (
    <div>
      <Link className='p-3' href={`/${shopUniqName}/panel/banners`} >بنر ها</Link>
      <Link className='p-3' href={`/${shopUniqName}/panel/roles`} >نقش ها</Link>
    </div>
  )
}

export default page