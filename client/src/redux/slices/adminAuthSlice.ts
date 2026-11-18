import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser } from '../../types';

interface AdminAuthState {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  isAdminAuthenticated: false,
  isLoading: false,
  error: null,
};

export const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<AdminUser | null>) => {
      state.admin = action.payload;
      state.isAdminAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setAdminLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAdminError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    adminLogoutSuccess: (state) => {
      state.admin = null;
      state.isAdminAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const { setAdmin, setAdminLoading, setAdminError, adminLogoutSuccess } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
