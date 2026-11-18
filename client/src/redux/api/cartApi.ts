import { apiSlice } from './apiSlice';
import type { CartData } from '../../types';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<{ success: boolean; cart: CartData }, void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<{ success: boolean; message: string; cart: CartData }, {
      productId: string;
      variantId?: string;
      quantity: number;
      selectedAttributes?: Record<string, string>;
    }>({
      query: (body) => ({
        url: '/cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<{ success: boolean; cart: CartData }, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/cart/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: builder.mutation<{ success: boolean; message: string; cart: CartData }, string>({
      query: (itemId) => ({
        url: `/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: builder.mutation<{ success: boolean; message: string; cart: CartData }, string>({
      query: (code) => ({
        url: '/cart/coupon',
        method: 'POST',
        body: { code },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCoupon: builder.mutation<{ success: boolean; message: string; cart: CartData }, void>({
      query: () => ({
        url: '/cart/coupon/remove',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
} = cartApi;
