import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, AttributeDefinition } from '../../types';

interface CategoryState {
  categories: Category[];
  activeCategory: Category | null;
  activeAttributes: AttributeDefinition[];
}

const initialState: CategoryState = {
  categories: [],
  activeCategory: null,
  activeAttributes: [],
};

export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<Category | null>) => {
      state.activeCategory = action.payload;
    },
    setActiveAttributes: (state, action: PayloadAction<AttributeDefinition[]>) => {
      state.activeAttributes = action.payload;
    },
  },
});

export const { setCategories, setActiveCategory, setActiveAttributes } = categorySlice.actions;
export default categorySlice.reducer;
