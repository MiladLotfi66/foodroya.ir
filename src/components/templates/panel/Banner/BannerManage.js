"use client";
import { useEffect, useState } from "react";
import FormTemplate from "@/templates/formTemplate";
import BannerCard from './BannerCard';
import { GetAllBanners } from "@/components/signinAndLogin/Actions/BannerServerActions";
import AddBanner from "./AddBanner";

function BannerManage() {
    const [banners, setBanners] = useState([]);
    const [isOpenAddBanner, setIsOpenAddBanner] = useState(false);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await GetAllBanners();
                setBanners(response.banners);
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();
    }, []);

    const handleOverlayClick = (e) => {
        // اگر کلیک بر روی خود لایه شفاف بود، مدال بسته شود
        if (e.target === e.currentTarget) {
            setIsOpenAddBanner(false);
        }
    };

    return (
        <FormTemplate>
            {isOpenAddBanner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                     onClick={handleOverlayClick}>
                    <div className="relative bg-white dark:bg-zinc-700 shadow-normal rounded-2xl w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] p-4"
                         onClick={(e) => e.stopPropagation()}>
                        <AddBanner />
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-700 shadow-normal rounded-2xl mt-36">
                <div className="flex justify-between p-2 md:p-5 mt-10 md:mt-36">
                    <h1 className="text-3xl font-MorabbaBold">مدیریت بنر ها</h1>
                    <button
                        className="h-11 md:h-14 bg-teal-600 rounded-xl hover:bg-teal-700 text-white mt-4 p-4"
                        aria-label="add baner"
                        onClick={() => setIsOpenAddBanner(true)}
                    >
                        افزودن بنر
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-16">
                    {banners.map((banner, index) => (
                        <BannerCard
                            className="p-2 md:p-4"
                            key={banner._id}
                            banner={banner}
                        >
                        </BannerCard>
                    ))}
                </div>
            </div>
        </FormTemplate>
    );
}

export default BannerManage;
