// Redux Slice
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mobileMenu: false,
    RightMenu: false,
    RightMenuPosition: { top: 0, left: 0 },
    RightMenuItemId: null,
    isBasketCartOpen: false,
    menuItems: [],
};

const mobileMenuSlice = createSlice({
    name: "mobileMenu",
    initialState,
    reducers: {
        reversemobileMenu: (state) => {
            state.mobileMenu = !state.mobileMenu;
        },
        toggleBasketCart: (state) => {
            state.isBasketCartOpen = !state.isBasketCartOpen;
        },
        toggleRightMenu: (state) => {
            state.RightMenu = !state.RightMenu;
        },
        openRightMenu: (state, action) => {
            state.RightMenu = true;
            state.RightMenuPosition = action.payload.position;
            state.RightMenuItemId = action.payload.itemId;
            state.menuItems = action.payload.menuItems;
        },
        closeRightMenu: (state) => {
            state.RightMenu = false;
            state.RightMenuItemId = null;
            state.menuItems = [];
        },
        //  selectedMenuAction :  (action, itemId) => {
        //     if (action === "edit") {
        //        ProductEditItem(itemId);
        //     } else if (action === "delete") {
        //        ProductDeleteItem(itemId);
        //     } else if (action === "send") {
        //        ProductSendItem(itemId);
        //     }
        //   },
    },
});

export const {
    reversemobileMenu,
    toggleBasketCart,
    toggleRightMenu,
    openRightMenu,
    closeRightMenu
} = mobileMenuSlice.actions;

export default mobileMenuSlice.reducer;

export const selectMobileMenu = (state) => state.mobileMenu.mobileMenu;
export const selectIsBasketCartOpen = (state) => state.mobileMenu.isBasketCartOpen;
export const selectIsRightMenuOpen = (state) => state.mobileMenu.RightMenu;
export const selectRightMenuPosition = (state) => state.mobileMenu.RightMenuPosition;
export const selectRightMenuItemId = (state) => state.mobileMenu.RightMenuItemId;
export const selectMenuItems = (state) => state.mobileMenu.menuItems;
