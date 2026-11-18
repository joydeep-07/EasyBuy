import { apiSlice } from './apiSlice';
import type { Address } from '../../types';

export const addressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<{ success: boolean; addresses: Address[] }, void>({
      query: () => '/addresses',
      providesTags: ['Addresses'],
    }),
    addAddress: builder.mutation<{ success: boolean; message: string; address: Address }, Partial<Address>>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Addresses', 'User'],
    }),
    updateAddress: builder.mutation<{ success: boolean; message: string; address: Address }, { id: string; data: Partial<Address> }>({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Addresses', 'User'],
    }),
    deleteAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Addresses', 'User'],
    }),
    setDefaultAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Addresses', 'User'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
