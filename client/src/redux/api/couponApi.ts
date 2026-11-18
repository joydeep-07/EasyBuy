import { apiSlice } from './apiSlice';
import type { Coupon } from '../../types';

export const couponApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActiveCoupons: builder.query<{ success: boolean; coupons: Coupon[] }, void>({
      query: () => '/coupons/active',
      providesTags: ['Coupons'],
    }),
  }),
});

export const { useGetActiveCouponsQuery } = couponApi;
