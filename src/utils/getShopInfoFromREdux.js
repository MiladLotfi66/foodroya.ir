// utils/getShopInfoFromREdux.js
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { fetchShopInfo } from "src/Redux/shopThunks";
import {
    selectShopId,
    selectShopName,
    selectLogoUrl,
    selectShopTextLogoUrl,
    selectShopBackGroundpanelUrl,
    selectBackGroundShopUrl,
    selectShopUniqueName,
    selectBaseCurrency,
    selectShopLoading,
    selectShopError,
} from '@/Redux/features/mobileMenu/shopSlice'
import { useEffect } from "react";

export function useShopInfoFromRedux() {
  const params = useParams();
  const { ShopId } = params;
  const dispatch = useDispatch();
  
  // دسترسی به سلکتورها
  const currentShopId = useSelector(selectShopId);
  const shopName = useSelector(selectShopName);
  const shopLogo = useSelector(selectLogoUrl);
  const shopTextLogo = useSelector(selectShopTextLogoUrl);
  const shopPanelImage = useSelector(selectShopBackGroundpanelUrl);
  const shopImage = useSelector(selectBackGroundShopUrl);
  const shopUniqName = useSelector(selectShopUniqueName);
  const baseCurrency = useSelector(selectBaseCurrency);
  const loading = useSelector(selectShopLoading);
  const error = useSelector(selectShopError);

  useEffect(() => {
      if (ShopId) {
          // صدا زدن Thunk برای دریافت اطلاعات فروشگاه
          dispatch(fetchShopInfo(ShopId));
      }
  }, [ShopId, dispatch]);
  

  return {
      currentShopId,
      shopName,
      shopLogo,
      shopTextLogo,
      shopPanelImage,
      shopImage,
      shopUniqName,
      baseCurrency,
      loading,
      error
  };
}
