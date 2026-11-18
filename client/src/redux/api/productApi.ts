import { apiSlice } from './apiSlice';
import type { Product, ProductVariant } from '../../types';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<{
      success: boolean;
      products: Product[];
      total: number;
      totalPages: number;
      currentPage: number;
      availableBrands: string[];
    }, Record<string, any>>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Products' as const, id: _id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    getProductBySlug: builder.query<{
      success: boolean;
      product: Product;
      variants: ProductVariant[];
      locationStatus: any;
    }, { slug: string; pincode?: string }>({
      query: ({ slug, pincode }) => ({
        url: `/products/${slug}`,
        params: pincode ? { pincode } : undefined,
      }),
      providesTags: (result, error, { slug }) => [{ type: 'Product', id: slug }],
    }),
    getSearchSuggestions: builder.query<{
      success: boolean;
      products: any[];
      brands: string[];
      categories: any[];
    }, string>({
      query: (q) => ({
        url: '/products/search/suggest',
        params: { q },
      }),
    }),
    getRelatedProducts: builder.query<{
      success: boolean;
      frequentlyBoughtTogether: Product[];
      customersAlsoViewed: Product[];
      similarProducts: Product[];
    }, string>({
      query: (id) => `/recommendations/products/${id}/related`,
    }),
    getPersonalizedRecommendations: builder.query<{
      success: boolean;
      recommendations: Product[];
    }, { limit?: number } | void>({
      query: (params) => ({
        url: '/recommendations',
        params: params || {},
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useGetRelatedProductsQuery,
  useGetPersonalizedRecommendationsQuery,
} = productApi;
