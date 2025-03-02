// Redux Slice
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpenMobileMenu: false,
    isOpenBasketCart: false,
};

export const mobileMenuSlice = createSlice({
    name: "mobileMenu",
    initialState,
    reducers: {
        reversemobileMenu: (state) => {
            state.isOpenMobileMenu = !state.isOpenMobileMenu;
        },
        toggleBasketCart: (state) => {
            state.isOpenBasketCart = !state.isOpenBasketCart;
        },
    },
});

export const {
    reversemobileMenu,
    toggleBasketCart,
} = mobileMenuSlice.actions;

export const selectMobileMenu = (state) => state.mobileMenu.isOpenMobileMenu;
export const selectBasketCart = (state) => state.mobileMenu.isOpenBasketCart;

export default mobileMenuSlice.reducer;
