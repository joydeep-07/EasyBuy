import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Address } from '../../types';

interface AddressState {
  selectedAddressId: string | null;
  selectedPincode: string;
}

const initialState: AddressState = {
  selectedAddressId: null,
  selectedPincode: '713301', // Default demo pincode
};

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddressId: (state, action: PayloadAction<string | null>) => {
      state.selectedAddressId = action.payload;
    },
    setSelectedPincode: (state, action: PayloadAction<string>) => {
      state.selectedPincode = action.payload;
    },
  },
});

export const { setSelectedAddressId, setSelectedPincode } = addressSlice.actions;
export default addressSlice.reducer;
