import { apiSlice } from './apiSlice';
import type { Order } from '../../types';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ success: boolean; message: string; order: Order }, {
      addressId: string;
      paymentMethod?: 'COD';
    }>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Cart', 'Inventory', 'Dashboard', 'Notifications'],
    }),
    getMyOrders: builder.query<{ success: boolean; count: number; orders: Order[] }, void>({
      query: () => '/orders/my-orders',
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<{ success: boolean; order: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),
    cancelOrder: builder.mutation<{ success: boolean; message: string; order: Order }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Orders', 'Inventory', 'Dashboard'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} = orderApi;
