import { configureStore } from "@reduxjs/toolkit";
import mobileMenuReducer from "./features/mobileMenu/mobileMenuSlice"

const store = configureStore({
    reducer: {
        mobileMenu: mobileMenuReducer
    },
});

export default store