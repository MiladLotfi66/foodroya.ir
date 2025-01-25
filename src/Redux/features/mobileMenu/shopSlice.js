// store/shopSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchShopInfo } from "src/Redux/shopThunks";

const initialState = {
    id: "",
    BaseCurrency: {
        id: "",
        shortName: "",
        title: "",
        exchangeRate: 1.0,
        decimalPlaces: 0,
        // سایر فیلدهای مورد نیاز را اضافه کنید
    },
    ShopName: "",
    LogoUrl: "",
    TextLogoUrl: "",
    BackGroundpanelUrl: "",
    BackGroundShopUrl: "",
    ShopUniqueName: "",
    loading: false,      // وضعیت بارگذاری
    error: null,         // پیام خطا
};

const shopSlice = createSlice({
    name: "shop",
    initialState,
    reducers: {
        setShopInfo: (state, action) => {
            const {
                id,
                BaseCurrency,
                ShopName,
                LogoUrl,
                TextLogoUrl,
                BackGroundpanelUrl,
                BackGroundShopUrl,
                ShopUniqueName,
            } = action.payload;
            state.id = id;
            state.BaseCurrency = BaseCurrency;
            state.ShopName = ShopName;
            state.LogoUrl = LogoUrl;
            state.TextLogoUrl = TextLogoUrl;
            state.BackGroundpanelUrl = BackGroundpanelUrl;
            state.BackGroundShopUrl = BackGroundShopUrl;
            state.ShopUniqueName = ShopUniqueName;
        },
        updateId: (state, action) => {
            state.id = action.payload;
        },
        updateBaseCurrency: (state, action) => {
            state.BaseCurrency = { ...state.BaseCurrency, ...action.payload };
        },
        updateShopName: (state, action) => {
            state.ShopName = action.payload;
        },
        updateLogoUrl: (state, action) => {
            state.LogoUrl = action.payload;
        },
        updateTextLogoUrl: (state, action) => {
            state.TextLogoUrl = action.payload;
        },
        updateBackGroundpanelUrl: (state, action) => {
            state.BackGroundpanelUrl = action.payload;
        },
        updateBackGroundShopUrl: (state, action) => {
            state.BackGroundShopUrl = action.payload;
        },
        updateShopUniqueName: (state, action) => {
            state.ShopUniqueName = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        // در صورت نیاز می‌توانید ردیوسرهای بیشتری اضافه کنید
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchShopInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchShopInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.id = action.payload.id;
                state.BaseCurrency = action.payload.BaseCurrency;
                state.ShopName = action.payload.ShopName;
                state.LogoUrl = action.payload.LogoUrl;
                state.TextLogoUrl = action.payload.TextLogoUrl;
                state.BackGroundpanelUrl = action.payload.BackGroundpanelUrl;
                state.BackGroundShopUrl = action.payload.BackGroundShopUrl;
                state.ShopUniqueName = action.payload.ShopUniqueName;
            })
            .addCase(fetchShopInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "خطا در دریافت اطلاعات فروشگاه";
            });
    },
});

export const {
    setShopInfo,
    updateId,
    updateBaseCurrency,
    updateShopName,
    updateLogoUrl,
    updateTextLogoUrl,
    updateBackGroundpanelUrl,
    updateBackGroundShopUrl,
    updateShopUniqueName,
    setLoading,
    setError,
} = shopSlice.actions;

export default shopSlice.reducer;

// سلکتورها
export const selectShopId = (state) => state.shop.id;
export const selectBaseCurrency = (state) => state.shop.BaseCurrency;
export const selectShopName = (state) => state.shop.ShopName;
export const selectLogoUrl = (state) => state.shop.LogoUrl;
export const selectShopTextLogoUrl = (state) => state.shop.TextLogoUrl;
export const selectShopBackGroundpanelUrl = (state) => state.shop.BackGroundpanelUrl;
export const selectBackGroundShopUrl = (state) => state.shop.BackGroundShopUrl;
export const selectShopUniqueName = (state) => state.shop.ShopUniqueName;
export const selectShopLoading = (state) => state.shop.loading;
export const selectShopError = (state) => state.shop.error;
