import { configureStore } from "@reduxjs/toolkit";
import mobileMenuReducer from "./features/mobileMenu/mobileMenuSlice";

const store = configureStore({
    reducer: {
        mobileMenu: mobileMenuReducer,
    },
    devTools: false, // غیرفعال کردن DevTools
});

export default store;
