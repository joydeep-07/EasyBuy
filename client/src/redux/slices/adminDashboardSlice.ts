import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminDashboardState {
  timeframe: '7d' | '30d' | '90d' | '1y';
  activeTab: string;
}

const initialState: AdminDashboardState = {
  timeframe: '30d',
  activeTab: 'overview',
};

export const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setTimeframe: (state, action: PayloadAction<'7d' | '30d' | '90d' | '1y'>) => {
      state.timeframe = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setTimeframe, setActiveTab } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
