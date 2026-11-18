import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  keyword: string;
  category: string;
  subcategory: string;
  brand: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  rating: number | undefined;
  inStock: boolean;
  sort: string;
  page: number;
}

const initialState: FilterState = {
  keyword: '',
  category: '',
  subcategory: '',
  brand: [],
  minPrice: undefined,
  maxPrice: undefined,
  rating: undefined,
  inStock: false,
  sort: 'newest',
  page: 1,
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setKeyword: (state, action: PayloadAction<string>) => {
      state.keyword = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.subcategory = '';
      state.page = 1;
    },
    setSubcategory: (state, action: PayloadAction<string>) => {
      state.subcategory = action.payload;
      state.page = 1;
    },
    toggleBrand: (state, action: PayloadAction<string>) => {
      const brand = action.payload;
      if (state.brand.includes(brand)) {
        state.brand = state.brand.filter((b) => b !== brand);
      } else {
        state.brand.push(brand);
      }
      state.page = 1;
    },
    setPriceRange: (state, action: PayloadAction<{ min?: number; max?: number }>) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
      state.page = 1;
    },
    setRating: (state, action: PayloadAction<number | undefined>) => {
      state.rating = action.payload;
      state.page = 1;
    },
    setInStockOnly: (state, action: PayloadAction<boolean>) => {
      state.inStock = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setKeyword,
  setCategory,
  setSubcategory,
  toggleBrand,
  setPriceRange,
  setRating,
  setInStockOnly,
  setSort,
  setPage,
  resetFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
