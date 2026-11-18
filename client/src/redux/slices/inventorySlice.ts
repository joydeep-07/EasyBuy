import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InventoryItem } from '../../types';

interface InventoryState {
  selectedItem: InventoryItem | null;
  stockFilter: string;
  isAdjustModalOpen: boolean;
}

const initialState: InventoryState = {
  selectedItem: null,
  stockFilter: 'ALL',
  isAdjustModalOpen: false,
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<InventoryItem | null>) => {
      state.selectedItem = action.payload;
    },
    setStockFilter: (state, action: PayloadAction<string>) => {
      state.stockFilter = action.payload;
    },
    setAdjustModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAdjustModalOpen = action.payload;
    },
  },
});

export const { setSelectedItem, setStockFilter, setAdjustModalOpen } = inventorySlice.actions;
export default inventorySlice.reducer;
