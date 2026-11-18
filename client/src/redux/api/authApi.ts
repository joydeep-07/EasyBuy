import { apiSlice } from './apiSlice';
import type { User } from '../../types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ success: boolean; user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    login: builder.mutation<{ success: boolean; user: User; message: string }, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Cart', 'Wishlist', 'Orders', 'Addresses', 'Notifications'],
    }),
    register: builder.mutation<{ success: boolean; user: User; message: string }, any>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Cart', 'Wishlist', 'Orders', 'Addresses', 'Notifications'],
    }),
    updateProfile: builder.mutation<{ success: boolean; user: User; message: string }, any>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<{ success: boolean; message: string }, any>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
