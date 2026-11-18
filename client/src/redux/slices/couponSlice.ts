import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Coupon } from '../../types';

interface CouponState {
  availableCoupons: Coupon[];
  appliedCouponCode: string | null;
}

const initialState: CouponState = {
  availableCoupons: [],
  appliedCouponCode: null,
};

export const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    setAvailableCoupons: (state, action: PayloadAction<Coupon[]>) => {
      state.availableCoupons = action.payload;
    },
    setAppliedCouponCode: (state, action: PayloadAction<string | null>) => {
      state.appliedCouponCode = action.payload;
    },
  },
});

export const { setAvailableCoupons, setAppliedCouponCode } = couponSlice.actions;
export default couponSlice.reducer;
