import { configureStore } from "@reduxjs/toolkit";
import mobileMenuReducer from "./features/mobileMenu/mobileMenuSlice";
import shopReducer from "./features/mobileMenu/shopSlice"; // ایمپورت Slice جدید
const store = configureStore({
    reducer: {
        mobileMenu: mobileMenuReducer,
        shop: shopReducer, // افزودن Slice جدید به ردیوسرها
    },
    devTools: false, // غیرفعال کردن DevTools
});

export default store;