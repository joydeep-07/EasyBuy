import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProductsPage } from './ProductsPage';
import { useGetCategoryBySlugQuery } from '../../redux/api/categoryApi';

export const CategoryProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: categoryData } = useGetCategoryBySlugQuery(slug || '');

  return (
    <div className="w-full">
      {/* Category Header Banner */}
      {categoryData?.category && (
        <div className="w-full bg-[var(--bg-secondary)] border-b theme-border py-8 px-6 mb-2">
          <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--accent-primary)] font-bold uppercase tracking-wider mb-1">
                <Link to="/" className="hover:underline">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:underline">Departments</Link>
                <span>/</span>
                <span>{categoryData.category.name}</span>
              </div>
              <h1 className="text-3xl font-black text-[var(--text-main)]">
                {categoryData.category.name}
              </h1>
              {categoryData.category.description && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                  {categoryData.category.description}
                </p>
              )}
            </div>

            {/* Subcategories Pills */}
            {categoryData.subcategories && categoryData.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categoryData.subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    to={`/products?category=${slug}&subcategory=${sub.slug}`}
                    className="px-3.5 py-1.5 rounded-xl border theme-border theme-surface text-xs font-semibold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors shadow-sm"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Products page filtered to this category */}
      <ProductsPage />
    </div>
  );
};
