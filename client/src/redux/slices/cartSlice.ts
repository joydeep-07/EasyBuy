import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartData, CartItem } from '../../types';

interface CartState {
  cart: CartData | null;
  itemCount: number;
  isOpenDrawer: boolean;
}

const initialState: CartState = {
  cart: null,
  itemCount: 0,
  isOpenDrawer: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartData: (state, action: PayloadAction<CartData | null>) => {
      state.cart = action.payload;
      state.itemCount = action.payload?.totalItems || 0;
    },
    toggleCartDrawer: (state) => {
      state.isOpenDrawer = !state.isOpenDrawer;
    },
    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpenDrawer = action.payload;
    },
    clearCartState: (state) => {
      state.cart = null;
      state.itemCount = 0;
    },
  },
});

export const { setCartData, toggleCartDrawer, setCartDrawerOpen, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
