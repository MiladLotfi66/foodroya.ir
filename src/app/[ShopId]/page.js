"use client"
import React from "react";
import { useShopInfoFromRedux } from "@/utils/getShopInfoFromREdux";
import ShopPage from "@/templates/ShopPage/ShopPage";

function Page() {
  const {
    shopName,
    shopLogo,
    shopTextLogo,
    shopPanelImage,
    shopImage,
    shopUniqName,
    baseCurrency,
    loading,
    error
  } = useShopInfoFromRedux();

  if (loading) {
    return <div>در حال بارگذاری اطلاعات فروشگاه...</div>;
  }

  if (error) {
    return <div>خطا در بارگذاری: {error}</div>;
  }

  if (!shopName) {
    return <div>اطلاعات فروشگاه موجود نیست.</div>;
  }

  return (
    <div>
      <ShopPage shopInfo={{ shopName, shopLogo, shopTextLogo, shopPanelImage, shopImage, shopUniqName, baseCurrency }} />
    </div>
  );
}

export default Page;
