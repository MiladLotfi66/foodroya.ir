
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mobileMenu: false,
};

const mobileMenuSlice = createSlice({
    name: "mobileMenu",
    initialState,
    reducers: {
        reversemobileMenu: (state) => {
            state.mobileMenu =!state.mobileMenu;
        },
    },
});

export const { reversemobileMenu } = mobileMenuSlice.actions;
export default mobileMenuSlice.reducer;

export const selectmobileMenu = (state) => state.mobileMenu.mobileMenu;
