import { apiSlice } from './apiSlice';
import type { Review } from '../../types';

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{ success: boolean; reviews: Review[] }, string>({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: (result, error, id) => [{ type: 'Reviews', id }],
    }),
    addReview: builder.mutation<{ success: boolean; message: string; review: Review }, {
      productId: string;
      rating: number;
      title?: string;
      comment: string;
      images?: string[];
    }>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reviews', 'Product', 'Products'],
    }),
  }),
});

export const { useGetProductReviewsQuery, useAddReviewMutation } = reviewApi;
