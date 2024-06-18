import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobileMenu: false,
  RightMenu: false,
  RightMenuPosition: { top: 0, left: 0 },
  RightMenuItemId: null,
  isBasketCartOpen: false,
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
    openRightMenu: (state, action) => {
      state.RightMenu = true;
      state.RightMenuPosition = action.payload.position;
      state.RightMenuItemId = action.payload.id;
    },
    closeRightMenu: (state) => {
      state.RightMenu = false;
      state.RightMenuPosition = { top: 0, left: 0 };
      state.RightMenuItemId = null;
    },
  },
});

export const { reversemobileMenu, toggleBasketCart, openRightMenu, closeRightMenu } = mobileMenuSlice.actions;
export default mobileMenuSlice.reducer;

export const selectmobileMenu = (state) => state.mobileMenu.mobileMenu;
export const selectIsBasketCartOpen = (state) => state.mobileMenu.isBasketCartOpen;
export const selectIsRightMenuOpen = (state) => state.mobileMenu.RightMenu;
export const selectRightMenuPosition = (state) => state.mobileMenu.RightMenuPosition;
export const selectRightMenuItemId = (state) => state.mobileMenu.RightMenuItemId;
