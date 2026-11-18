import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface ProductState {
  featuredProducts: Product[];
  trendingProducts: Product[];
  bestSellers: Product[];
  recentlyViewed: Product[];
  selectedVariantSku: string | null;
}

const initialState: ProductState = {
  featuredProducts: [],
  trendingProducts: [],
  bestSellers: [],
  recentlyViewed: [],
  selectedVariantSku: null,
};

export const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    setTrendingProducts: (state, action: PayloadAction<Product[]>) => {
      state.trendingProducts = action.payload;
    },
    setBestSellers: (state, action: PayloadAction<Product[]>) => {
      state.bestSellers = action.payload;
    },
    addRecentlyViewed: (state, action: PayloadAction<Product>) => {
      state.recentlyViewed = [
        action.payload,
        ...state.recentlyViewed.filter((p) => p._id !== action.payload._id),
      ].slice(0, 10);
    },
    setSelectedVariantSku: (state, action: PayloadAction<string | null>) => {
      state.selectedVariantSku = action.payload;
    },
  },
});

export const {
  setFeaturedProducts,
  setTrendingProducts,
  setBestSellers,
  addRecentlyViewed,
  setSelectedVariantSku,
} = productSlice.actions;
export default productSlice.reducer;
