import { apiSlice } from './apiSlice';

export const shippingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkPincode: builder.query<{
      success: boolean;
      data: {
        pincode: string;
        isServiceable: boolean;
        city: string;
        state: string;
        estimatedDays: number;
        deliveryFee: number;
        isCodAvailable: boolean;
        isExpressAvailable: boolean;
        expressFee?: number;
        statusText: string;
      };
    }, string>({
      query: (pincode) => `/shipping/check-pincode/${pincode}`,
    }),
    getOrderTracking: builder.query<{
      success: boolean;
      orderNumber: string;
      orderStatus: string;
      estimatedDelivery: string;
      deliveredAt?: string;
      addressSnapshot: any;
      shipment: any;
      statusHistory: any[];
      stages: { key: string; label: string; completed: boolean; current?: boolean }[];
    }, string>({
      query: (orderId) => `/shipping/track/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Shipping', id }],
    }),
  }),
});

export const { useCheckPincodeQuery, useLazyCheckPincodeQuery, useGetOrderTrackingQuery } = shippingApi;
