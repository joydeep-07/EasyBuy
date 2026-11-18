import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';

import authReducer from './slices/authSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import themeReducer from './slices/themeSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import filterReducer from './slices/filterSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';
import notificationReducer from './slices/notificationSlice';
import couponReducer from './slices/couponSlice';
import adminDashboardReducer from './slices/adminDashboardSlice';
import adminProductReducer from './slices/adminProductSlice';
import inventoryReducer from './slices/inventorySlice';
import adminOrderReducer from './slices/adminOrderSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    adminAuth: adminAuthReducer,
    theme: themeReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productReducer,
    categories: categoryReducer,
    filters: filterReducer,
    orders: orderReducer,
    address: addressReducer,
    notifications: notificationReducer,
    coupon: couponReducer,
    adminDashboard: adminDashboardReducer,
    adminProduct: adminProductReducer,
    inventory: inventoryReducer,
    adminOrder: adminOrderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
