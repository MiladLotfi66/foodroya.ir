import { configureStore } from "@reduxjs/toolkit";
import mobileMenuReducer from "./features/mobileMenu/mobileMenuSlice";
import shopReducer from "./features/mobileMenu/shopSlice"; // ایمپورت Slice جدید
import cartReducer from './features/mobileMenu/cartSlice';

const store = configureStore({
    reducer: {
        mobileMenu: mobileMenuReducer,
        shop: shopReducer, // افزودن Slice جدید به ردیوسرها
        cart: cartReducer,

    },
    devTools: false, // غیرفعال کردن DevTools
});

export default store;