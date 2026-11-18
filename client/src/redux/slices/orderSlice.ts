import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../types';

interface OrderState {
  currentOrder: Order | null;
  selectedPaymentMethod: 'COD';
  orderTracking: any | null;
}

const initialState: OrderState = {
  currentOrder: null,
  selectedPaymentMethod: 'COD',
  orderTracking: null,
};

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<'COD'>) => {
      state.selectedPaymentMethod = action.payload;
    },
    setOrderTracking: (state, action: PayloadAction<any>) => {
      state.orderTracking = action.payload;
    },
  },
});

export const { setCurrentOrder, setSelectedPaymentMethod, setOrderTracking } = orderSlice.actions;
export default orderSlice.reducer;
