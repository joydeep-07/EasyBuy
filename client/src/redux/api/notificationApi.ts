import { apiSlice } from './apiSlice';
import type { NotificationItem } from '../../types';

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }, void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation<{ success: boolean; notification: NotificationItem }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllAsRead: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
