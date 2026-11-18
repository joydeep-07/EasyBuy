import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../types';

interface AdminOrderState {
  selectedOrder: Order | null;
  statusFilter: string;
  isStatusModalOpen: boolean;
  isTrackingModalOpen: boolean;
}

const initialState: AdminOrderState = {
  selectedOrder: null,
  statusFilter: 'ALL',
  isStatusModalOpen: false,
  isTrackingModalOpen: false,
};

export const adminOrderSlice = createSlice({
  name: 'adminOrder',
  initialState,
  reducers: {
    setSelectedAdminOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setAdminStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setStatusModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isStatusModalOpen = action.payload;
    },
    setTrackingModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isTrackingModalOpen = action.payload;
    },
  },
});

export const {
  setSelectedAdminOrder,
  setAdminStatusFilter,
  setStatusModalOpen,
  setTrackingModalOpen,
} = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
