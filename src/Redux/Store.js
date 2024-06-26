import { configureStore } from "@reduxjs/toolkit";
import mobileMenuReducer from "./features/mobileMenu/mobileMenuSlice"
import { DevTool } from "@hookform/devtools";

const store = configureStore({
    reducer: {
        mobileMenu: mobileMenuReducer,
        devtools:false
    },
});

export default store



