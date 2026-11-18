import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ProductCard } from '../../components/common/ProductCard';
import { useGetProductsQuery } from '../../redux/api/productApi';
import { useGetCategoriesQuery } from '../../redux/api/categoryApi';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract search params
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') || '';
  const isBestSeller = searchParams.get('isBestSeller') || '';
  const isTrending = searchParams.get('isTrending') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local price input state
  const [priceMinInput, setPriceMinInput] = useState(minPrice);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: productsData, isFetching } = useGetProductsQuery({
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    inStock,
    isBestSeller,
    isTrending,
    sort,
    page,
    limit: 12,
  });

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (priceMinInput) newParams.set('minPrice', priceMinInput);
    else newParams.delete('minPrice');

    if (priceMaxInput) newParams.set('maxPrice', priceMaxInput);
    else newParams.delete('maxPrice');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setPriceMinInput('');
    setPriceMaxInput('');
    setSearchParams(new URLSearchParams());
  };

  const selectedBrandsList = brand ? brand.split(',') : [];

  const toggleBrandFilter = (b: string) => {
    let updated: string[];
    if (selectedBrandsList.includes(b)) {
      updated = selectedBrandsList.filter((item) => item !== b);
    } else {
      updated = [...selectedBrandsList, b];
    }
    updateParam('brand', updated.length > 0 ? updated.join(',') : null);
  };

  const FilterSidebarContent = (
    <div className="space-y-6 text-xs">
      {/* Active filters header */}
      <div className="flex items-center justify-between pb-3 border-b theme-border">
        <span className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
          <SlidersHorizontal size={16} /> Filters
        </span>
        <button
          onClick={resetAllFilters}
          className="text-[var(--accent-primary)] hover:underline flex items-center gap-1 font-semibold"
        >
          <RotateCcw size={12} /> Clear all
        </button>
      </div>

      {/* Category filter */}
      <div>
        <h4 className="font-bold text-sm text-[var(--text-main)] mb-2.5">Department</h4>
        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <li
            onClick={() => updateParam('category', null)}
            className={`cursor-pointer px-2 py-1 rounded-lg transition-colors ${
              !category ? 'bg-[var(--accent-primary)] text-white font-bold' : 'hover:bg-[var(--bg-secondary)]'
            }`}
          >
            All Departments
          </li>
          {categoriesData?.categories?.map((cat) => (
            <li
              key={cat._id}
              onClick={() => updateParam('category', cat.slug)}
              className={`cursor-pointer px-2 py-1 rounded-lg transition-colors truncate ${
                category === cat.slug
                  ? 'bg-[var(--accent-primary)] text-white font-bold'
                  : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
              }`}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Price filter */}
      <div className="pt-2 border-t theme-border">
        <h4 className="font-bold text-sm text-[var(--text-main)] mb-2.5">Price (₹)</h4>
        <form onSubmit={handlePriceApply} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border theme-border theme-card focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border theme-border theme-card focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)] hover:text-white font-bold border theme-border transition-colors text-center"
          >
            Go
          </button>
        </form>
      </div>

      {/* Brand filter */}
      {productsData?.availableBrands && productsData.availableBrands.length > 0 && (
        <div className="pt-2 border-t theme-border">
          <h4 className="font-bold text-sm text-[var(--text-main)] mb-2.5">Brand</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {productsData.availableBrands.map((b) => (
              <label
                key={b}
                className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent-primary)]"
              >
                <input
                  type="checkbox"
                  checked={selectedBrandsList.includes(b)}
                  onChange={() => toggleBrandFilter(b)}
                  className="rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                />
                <span className="truncate">{b}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Customer Rating filter */}
      <div className="pt-2 border-t theme-border">
        <h4 className="font-bold text-sm text-[var(--text-main)] mb-2.5">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => updateParam('rating', rating === String(r) ? null : String(r))}
              className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg transition-colors ${
                rating === String(r) ? 'bg-amber-500/15 font-bold' : 'hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className="flex text-amber-500">
                {[...Array(r)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 stroke-amber-500" />
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-secondary)]">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock filter */}
      <div className="pt-2 border-t theme-border">
        <label className="flex items-center gap-2 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={inStock === 'true'}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
            className="rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
          />
          <span>Include In-Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Page Title & Search context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-main)]">
            {keyword ? `Search results for "${keyword}"` : category ? `Category: ${category}` : 'Explore All Products'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {productsData ? `Showing ${productsData.products.length} of ${productsData.total} products` : 'Loading...'}
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border theme-border theme-card text-xs font-semibold"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-secondary)] font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl border theme-border theme-card text-[var(--text-main)] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
              <option value="popularity">Best Selling</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Layout */}
      <div className="flex items-start gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 p-5 rounded-2xl theme-surface border theme-border sticky top-28 max-h-[85vh] overflow-y-auto">
          {FilterSidebarContent}
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {isFetching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl theme-surface border theme-border animate-pulse p-4" />
              ))}
            </div>
          ) : productsData && productsData.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {productsData.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {productsData.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    className="px-4 py-2 rounded-xl border theme-border theme-card text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {[...Array(productsData.totalPages)].map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => updateParam('page', String(pNum))}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                          pNum === page
                            ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                            : 'border theme-border theme-card hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= productsData.totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                    className="px-4 py-2 rounded-xl border theme-border theme-card text-xs font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center space-y-3 theme-card rounded-3xl p-8 border theme-border">
              <p className="text-lg font-bold text-[var(--text-main)]">No products match your filters</p>
              <p className="text-xs text-[var(--text-secondary)]">Try clearing some filter options or search with other keywords.</p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:opacity-90"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="relative w-80 max-w-full h-full p-5 theme-surface shadow-2xl overflow-y-auto">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-secondary)]"
            >
              <X size={20} />
            </button>
            <div className="mt-6">{FilterSidebarContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};
