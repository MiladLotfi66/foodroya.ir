import Admin_panel from '@/components/Admin_Panel/Admin_panel'
import React from 'react'
import { AuthUser } from '@/utils/ServerHelper'
import { redirect } from 'next/navigation';


async function page() {
    const user=await AuthUser();
    if (user.role==="Admin") {
        return (
            <div>
                <Admin_panel/>
            </div>
          )
    }else{
        redirect('/');

    }
  
}

export default page
