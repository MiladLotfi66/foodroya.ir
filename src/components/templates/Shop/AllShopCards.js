"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import ShopCard from "./ShopCard";
import { GetAllEnableShops, authenticateUser,GetUserbyUserId } from "@/components/signinAndLogin/Actions/ShopServerActions";

function AllShopCards() {
  const [Shops, setShops] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndShops = async () => {
      try {
        // احراز هویت کاربر
        const userData = await authenticateUser();
        const userFullData=await GetUserbyUserId(userData.id)
        setUser(userFullData);

        // دریافت لیست فروشگاه‌ها
        const response = await GetAllEnableShops();
        setShops(response.Shops);
      } catch (error) {
        console.error("Error fetching shops or user:", error);
      }
    };
    fetchUserAndShops();
  }, []);

  return (
    <FormTemplate>
      <div className="bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold"> فروشگاه ها</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {Shops.map((Shop) => (
            <ShopCard
              className="p-2 md:p-4"
              key={Shop._id}
              Shop={Shop}
              user={user.user} // ارسال اطلاعات کاربر به ShopCard
              editable={false}
              followable={true}
            />
            
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default AllShopCards;