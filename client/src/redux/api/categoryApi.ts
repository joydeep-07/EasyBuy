import { apiSlice } from './apiSlice';
import type { Category, AttributeDefinition } from '../../types';

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<{ success: boolean; categories: Category[] }, { all?: boolean } | void>({
      query: (params) => ({
        url: '/categories',
        params: params?.all ? { all: 'true' } : undefined,
      }),
      providesTags: ['Categories'],
    }),
    getCategoryBySlug: builder.query<{
      success: boolean;
      category: Category;
      subcategories: Category[];
      attributes: AttributeDefinition[];
    }, string>({
      query: (slug) => `/categories/${slug}`,
    }),
    getCategoryAttributes: builder.query<{ success: boolean; attributes: AttributeDefinition[] }, string>({
      query: (categoryId) => `/categories/${categoryId}/attributes`,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryAttributesQuery,
} = categoryApi;
