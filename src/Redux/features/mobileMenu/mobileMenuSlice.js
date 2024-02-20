
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mobileMenu: false,
    isBasketCartOpen: false,

};

const mobileMenuSlice = createSlice({
    name: "mobileMenu",
    initialState,
    reducers: {
        reversemobileMenu: (state) => {
            state.mobileMenu =!state.mobileMenu;
        },
        toggleBasketCart: (state) => {
            state.isBasketCartOpen = !state.isBasketCartOpen;
        },
    },
 
});

export const { reversemobileMenu, toggleBasketCart } = mobileMenuSlice.actions;
export default mobileMenuSlice.reducer;

export const selectmobileMenu = (state) => state.mobileMenu.mobileMenu;
export const selectIsBasketCartOpen = (state) => state.mobileMenu.isBasketCartOpen;
