import { apiSlice } from './apiSlice';
import type { AdminUser, Product, Category, AttributeDefinition, InventoryItem, Order, Coupon, Review, DeliveryZone } from '../../types';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<{ success: boolean; admin: AdminUser; message: string }, any>({
      query: (credentials) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['AdminAuth', 'Dashboard'],
    }),
    adminLogout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/admin/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['AdminAuth'],
    }),
    getAdminProfile: builder.query<{ success: boolean; admin: AdminUser }, void>({
      query: () => '/admin/auth/me',
      providesTags: ['AdminAuth'],
    }),
    getAdminDashboard: builder.query<{
      success: boolean;
      stats: {
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        activeProducts: number;
        soldOutProducts: number;
        pendingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        lowStockCount: number;
      };
      charts: {
        monthlyTrends: { label: string; revenue: number; orders: number }[];
        categoryStats: { name: string; slug: string; productCount: number }[];
      };
      recentOrders: Order[];
      topProducts: any[];
    }, void>({
      query: () => '/admin/auth/dashboard',
      providesTags: ['Dashboard'],
    }),

    // Admin Products
    createProduct: builder.mutation<{ success: boolean; product: Product }, any>({
      query: (body) => ({
        url: '/products/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products', 'Inventory', 'Dashboard'],
    }),
    updateProduct: builder.mutation<{ success: boolean; product: Product }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/products/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Products', 'Product', 'Inventory', 'Dashboard'],
    }),
    updateProductAvailability: builder.mutation<{ success: boolean; message: string }, { id: string; status: string; availabilityReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/products/admin/${id}/availability`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Products', 'Product', 'Dashboard'],
    }),
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products', 'Inventory', 'Dashboard'],
    }),

    // Admin Categories & Attributes
    createCategory: builder.mutation<{ success: boolean; category: Category; message?: string }, any>({
      query: (body) => ({
        url: '/categories/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories', 'Dashboard'],
    }),
    updateCategory: builder.mutation<{ success: boolean; category: Category; message?: string }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/categories/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories', 'Products', 'Dashboard'],
    }),
    deleteCategory: builder.mutation<{ success: boolean; message: string; hasProducts?: boolean; productCount?: number }, { id: string; reassignTo?: string } | string>({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const body = typeof arg === 'object' && arg.reassignTo ? { reassignTo: arg.reassignTo } : undefined;
        return {
          url: `/categories/admin/${id}`,
          method: 'DELETE',
          body,
        };
      },
      invalidatesTags: ['Categories', 'Products', 'Dashboard'],
    }),
    addCategoryAttribute: builder.mutation<{ success: boolean; attribute: AttributeDefinition }, { categoryId: string; data: any }>({
      query: ({ categoryId, data }) => ({
        url: `/categories/admin/${categoryId}/attributes`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Admin Inventory
    getAdminInventory: builder.query<{
      success: boolean;
      inventory: InventoryItem[];
      total: number;
      totalPages: number;
      currentPage: number;
    }, Record<string, any>>({
      query: (params) => ({
        url: '/admin/inventory',
        params,
      }),
      providesTags: ['Inventory'],
    }),
    updateStock: builder.mutation<{ success: boolean; inventory: InventoryItem }, {
      id: string;
      type: string;
      quantity: number;
      reason?: string;
      lowStockThreshold?: number;
    }>({
      query: ({ id, ...body }) => ({
        url: `/admin/inventory/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Inventory', 'Products', 'Dashboard'],
    }),
    getInventoryTransactions: builder.query<{ success: boolean; transactions: any[] }, { sku?: string } | void>({
      query: (params) => ({
        url: '/admin/inventory/transactions',
        params: params || {},
      }),
      providesTags: ['Inventory'],
    }),

    // Admin Orders
    getAdminOrders: builder.query<{
      success: boolean;
      orders: Order[];
      total: number;
      totalPages: number;
      currentPage: number;
    }, Record<string, any>>({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      providesTags: ['Orders', 'Dashboard'],
    }),
    updateOrderStatus: builder.mutation<{ success: boolean; message: string; order: Order }, {
      id: string;
      status: string;
      comment?: string;
      shippingCompany?: string;
      trackingId?: string;
      trackingUrl?: string;
      deliveryNotes?: string;
      paymentStatus?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders', 'Dashboard', 'Shipping', 'Inventory'],
    }),
    updatePaymentStatus: builder.mutation<{ success: boolean; message: string; order: Order }, {
      id: string;
      paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
      notes?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `/orders/admin/${id}/payment-status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Orders', 'Dashboard'],
    }),

    // Admin Customers
    getAdminCustomers: builder.query<{
      success: boolean;
      customers: any[];
      total: number;
      totalPages: number;
    }, Record<string, any>>({
      query: (params) => ({
        url: '/admin/customers',
        params,
      }),
      providesTags: ['Customers'],
    }),
    getCustomerDetails: builder.query<{ success: boolean; customer: any; addresses: any[]; orders: Order[]; stats: any }, string>({
      query: (id) => `/admin/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customers', id }],
    }),
    toggleCustomerStatus: builder.mutation<{ success: boolean; message: string; isActive: boolean }, string>({
      query: (id) => ({
        url: `/admin/customers/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Customers'],
    }),

    // Admin Coupons
    getAdminCoupons: builder.query<{ success: boolean; coupons: Coupon[] }, void>({
      query: () => '/coupons/admin',
      providesTags: ['Coupons'],
    }),
    createCoupon: builder.mutation<{ success: boolean; coupon: Coupon }, any>({
      query: (body) => ({
        url: '/coupons/admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupons'],
    }),
    updateCoupon: builder.mutation<{ success: boolean; coupon: Coupon }, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/coupons/admin/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),
    deleteCoupon: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/coupons/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),

    // Admin Reviews
    getAdminReviews: builder.query<{ success: boolean; reviews: Review[] }, void>({
      query: () => '/reviews/admin',
      providesTags: ['Reviews'],
    }),
    toggleReviewVisibility: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/reviews/admin/${id}/visibility`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Reviews'],
    }),
    deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/reviews/admin/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Admin Shipping Delivery Zones
    getAdminDeliveryZones: builder.query<{ success: boolean; zones: DeliveryZone[] }, void>({
      query: () => '/shipping/admin/zones',
      providesTags: ['Shipping'],
    }),
    createDeliveryZone: builder.mutation<{ success: boolean; zone: DeliveryZone }, any>({
      query: (body) => ({
        url: '/shipping/admin/zones',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shipping'],
    }),
    deleteDeliveryZone: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/shipping/admin/zones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shipping'],
    }),

    // Multiple Image Upload
    uploadImages: builder.mutation<{ success: boolean; urls: string[] }, FormData>({
      query: (formData) => ({
        url: '/upload/multiple',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useGetAdminProfileQuery,
  useGetAdminDashboardQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddCategoryAttributeMutation,
  useGetAdminInventoryQuery,
  useUpdateStockMutation,
  useGetInventoryTransactionsQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useGetAdminCustomersQuery,
  useGetCustomerDetailsQuery,
  useToggleCustomerStatusMutation,
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
  useGetAdminDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useUploadImagesMutation,
} = adminApi;
