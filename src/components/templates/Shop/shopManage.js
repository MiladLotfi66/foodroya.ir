"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/formTemplate";
import ShopCard from "./ShopCard";
import { GetAllShops } from "@/components/signinAndLogin/Actions/ShopServerActions";
import AddShop from "./AddShop";

function ShopManage() {
  const [Shops, setShops] = useState([]);
  const [isOpenAddShop, setIsOpenAddShop] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedShopFile, setSelectedShopFile] = useState(null); // افزودن استیت جدید

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpenAddShop(false);
      setSelectedShop(null);
      setSelectedShopFile(null); // ریست کردن فایل فروشگاه
    }
  };

  const handleEditClick = (Shop) => {
    setSelectedShop(Shop);
    setSelectedShopFile(null); // ریست کردن فایل فروشگاه در حالت ویرایش
    setIsOpenAddShop(true);
  };

  const handleAddShopClick = () => {
    setIsOpenAddShop(true);
    setSelectedShop(null);
    setSelectedShopFile(null); // ریست کردن فایل فروشگاه در حالت افزودن جدید
  };

  const handleCloseModal = () => {
    setIsOpenAddShop(false);
    setSelectedShop(null);
    setSelectedShopFile(null);
  };

  const handleSubmit = async (formData, ShopId) => {
    console.log("addShop run");
    try {
      const formDataObj = new FormData();
      formDataObj.append("Logo", formData.Logo);
      formDataObj.append("TextLogo", formData.TextLogo);
      formDataObj.append("BackGroundShop", formData.BackGroundShop);
      formDataObj.append("BackGroundpanel", formData.BackGroundpanel);
      formDataObj.append("ShopName", formData.ShopName);
      formDataObj.append("ShopSmallDiscription",formData.ShopSmallDiscription);
      formDataObj.append("ShopDiscription", formData.ShopDiscription);
      formDataObj.append("ShopAddress", formData.ShopAddress);
      formDataObj.append("ShopPhone", formData.ShopPhone);
      formDataObj.append("ShopMobile", formData.ShopMobile);
      formDataObj.append("ShopStatus", formData.ShopStatus);

      const res = await fetch(
        `/api/panel/Shop${ShopId ? `/${ShopId}` : ""}`,
        {
          method: ShopId ? "PATCH" : "PUT",
          body: formDataObj,
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("فروشگاه با موفقیت ثبت شد");
        setSelectedShop(null);
        setSelectedShopFile(null); // ریست کردن فایل فروشگاه پس از ثبت موفقیت‌آمیز
        setIsOpenAddShop(false);
        // Refresh Shops list after successful submission
      } else {
        toast.error(result.message || "خطایی رخ داده است");
      }
    } catch (error) {
      toast.error("خطایی در ارسال درخواست به سرور رخ داد");
    }
  };

  return (
    <FormTemplate>
      {isOpenAddShop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOverlayClick}
        >
          <div
            className="relative bg-white bg-opacity-95 dark:bg-zinc-700 dark:bg-opacity-95 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <AddShop
              Shop={selectedShop}
              ShopFile={selectedShopFile}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}

      <div className="bg-white bg-opacity-90 dark:bg-zinc-700 dark:bg-opacity-90 shadow-normal rounded-2xl mt-36">
        <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
          <h1 className="text-3xl font-MorabbaBold">مدیریت فروشگاه ها</h1>
          <button
            className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
            aria-label="add Shop"
            onClick={handleAddShopClick}
          >
            افزودن فروشگاه
          </button>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
          {Shops.map((Shop) => (
            <ShopCard
              className="p-2 md:p-4"
              key={Shop._id}
              Shop={Shop}
              editfunction={() => handleEditClick(Shop)}
            />
          ))}
        </div>
      </div>
    </FormTemplate>
  );
}

export default ShopManage;
