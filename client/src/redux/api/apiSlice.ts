import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include', // Automatically passes HTTP-only cookies
  }),
  tagTypes: [
    'User',
    'AdminAuth',
    'Products',
    'Product',
    'Categories',
    'Cart',
    'Wishlist',
    'Orders',
    'Addresses',
    'Coupons',
    'Reviews',
    'Inventory',
    'Customers',
    'Notifications',
    'Shipping',
    'Dashboard',
  ],
  endpoints: () => ({}),
});
