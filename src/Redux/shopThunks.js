// store/shopThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetShopInfo } from "@/templates/Shop/ShopServerActions";
import { setShopInfo, setLoading, setError } from  "./features/mobileMenu/shopSlice";

// Thunk برای دریافت اطلاعات فروشگاه
export const fetchShopInfo = createAsyncThunk(
    'shop/fetchShopInfo',
    async (shopId, { getState, dispatch, rejectWithValue }) => {
        const state = getState();
        const currentShopId = state.shop.id;

        // اگر shopId وارد شده برابر با shopId موجود در store باشد، نیازی به دریافت مجدد نیست
        if (shopId === currentShopId) {
            return state.shop; // بازگشت اطلاعات موجود در store
        }

        try {
            dispatch(setLoading(true));   // شروع بارگذاری
            dispatch(setError(null));     // پاک کردن خطاهای قبلی

            const response = await GetShopInfo(shopId);

            if (response.status === 200) {
                dispatch(setShopInfo(response.shop)); // ذخیره اطلاعات در store
                return response.shop;
            } else {
                dispatch(setError(response.message || "خطای ناشناخته")); // ذخیره پیام خطا
                return rejectWithValue(response.message || "خطای ناشناخته");
            }
        } catch (error) {
            dispatch(setError(error.message || "خطای سرور")); // ذخیره پیام خطا
            return rejectWithValue(error.message || "خطای سرور");
        } finally {
            dispatch(setLoading(false)); // پایان بارگذاری
        }
    }
);
