"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/generalcomponnents/formTemplate";
import ShopCard from "./ShopCard";
import { GetAllShops } from "@/components/signinAndLogin/Actions/ShopServerActions";


function AllShopCards() {

  const [Shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await GetAllShops();
        setShops(response.Shops);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };
    fetchShops();
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
