import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface AdminProductState {
  selectedProduct: Product | null;
  formStep: number;
  generatedVariants: any[];
  searchFilter: string;
}

const initialState: AdminProductState = {
  selectedProduct: null,
  formStep: 1,
  generatedVariants: [],
  searchFilter: '',
};

export const adminProductSlice = createSlice({
  name: 'adminProduct',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setFormStep: (state, action: PayloadAction<number>) => {
      state.formStep = action.payload;
    },
    setGeneratedVariants: (state, action: PayloadAction<any[]>) => {
      state.generatedVariants = action.payload;
    },
    setProductSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
    resetProductForm: (state) => {
      state.selectedProduct = null;
      state.formStep = 1;
      state.generatedVariants = [];
    },
  },
});

export const {
  setSelectedProduct,
  setFormStep,
  setGeneratedVariants,
  setProductSearchFilter,
  resetProductForm,
} = adminProductSlice.actions;
export default adminProductSlice.reducer;
