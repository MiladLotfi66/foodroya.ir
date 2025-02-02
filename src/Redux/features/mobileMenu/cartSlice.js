import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCartFromDB } from '@/templates/shoppingCart/ShopingCartServerActions'; // فرض بر این است که این تابع در همین فایل یا مسیر صحیح قرار دارد
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getCartFromDB(userId);
      if (!response.success) {
        throw new Error('خطا در دریافت سبد خرید');
      }

      // تبدیل داده‌ها به فرمتی که کامپوننت نیاز دارد
      const formattedItems = response.items.map(item => ({
        
        product: item.product,
        title: item.productTitle,     // تبدیل productTitle به title
        price: item.price,
        quantity: item.quantity,
        shop: item.shop,
        shopInfo: { // اضافه کردن اطلاعات کامل فروشگاه
          // id: item._id,
          LogoUrl: item.LogoUrl,
          ShopName: item.shopName,
          ShopUniqueName: item.ShopUniqueName,
        },
        image: item.image,
      }));
      return formattedItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// تابع برای ارسال اطلاعات سبد خرید به سرور
export const saveCartToServer = createAsyncThunk(
  'cart/saveCartToServer',
  async (cartItems, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
      });

      if (!response.ok) {
        throw new Error('خطا در ذخیره سبد خرید');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // وضعیت درخواست: idle, loading, succeeded, failed
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      
      const { product, quantity, price, shop,image,title } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product=== product && item.shop === shop
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, price, shop,image,title });
      }
    },
    updateQuantity: (state, action) => {
      const { product, quantity, shop } = action.payload;
      const existingItem = state.items.find(
        item => item.product === product && item.shop === shop
      );
      if (existingItem) {
        existingItem.quantity = quantity;
      }
    },
    removeFromCart: (state, action) => {
      const { product, shop } = action.payload;
      state.items = state.items.filter(
        item => !(item.product === product && item.shop === shop)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
    loadCart: (state, action) => {
      state.items = action.payload;
      state.loaded = true;

    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveCartToServer.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveCartToServer.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(saveCartToServer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart,loadCart } = cartSlice.actions;

export default cartSlice.reducer;