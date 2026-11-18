import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface WishlistState {
  items: { product: Product; addedAt: string }[];
  wishlistIds: string[];
}

const initialState: WishlistState = {
  items: [],
  wishlistIds: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<{ product: Product; addedAt: string }[]>) => {
      state.items = action.payload;
      state.wishlistIds = action.payload.map((i) => i.product._id);
    },
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistIds = [];
    },
  },
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
