import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NotificationItem } from '../../types';

interface NotificationState {
  unreadCount: number;
  notifications: NotificationItem[];
}

const initialState: NotificationState = {
  unreadCount: 0,
  notifications: [],
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsData: (state, action: PayloadAction<{ unreadCount: number; notifications: NotificationItem[] }>) => {
      state.unreadCount = action.payload.unreadCount;
      state.notifications = action.payload.notifications;
    },
    decrementUnread: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const { setNotificationsData, decrementUnread, resetUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
