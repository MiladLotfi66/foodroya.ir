// store.js
import {create} from 'zustand';

const useStore = create((set) => ({
  mobileMenu: false,
  RightMenu: false,
  RightMenuPosition: { top: 0, left: 0 },
  RightMenuItemId: null,
  isBasketCartOpen: false,
  menuItems: [],
  
  toggleMobileMenu: () => set((state) => ({ mobileMenu: !state.mobileMenu })),
  toggleBasketCart: () => set((state) => ({ isBasketCartOpen: !state.isBasketCartOpen })),
  toggleRightMenu: () => set((state) => ({ RightMenu: !state.RightMenu })),
  openRightMenu: (position, itemId, menuItems) => set(() => ({
    RightMenu: true,
    RightMenuPosition: position,
    RightMenuItemId: itemId,
    menuItems: menuItems,
  })),
  closeRightMenu: () => set(() => ({
    RightMenu: false,
    RightMenuItemId: null,
    menuItems: [],
  })),

  editItem:  (itemId) => {
     console.log(`Editing item with id: ${itemId}`);
    // انتقال به صفحه ویرایش
    window.location.href = `/edit/${itemId}`;
  },
}));

export default useStore;
