import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Image as ImageIcon,
  FolderTree,
  Package,
  Layers,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Sliders,
} from 'lucide-react';
import { AdminBadge } from '../AdminBadge';
import { EmptyState } from '../EmptyState';
import type { Category } from '../../../types';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onSelectCategoryForAttributes?: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
  onSelectCategoryForAttributes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [sortField, setSortField] = useState<'name' | 'products' | 'order' | 'date'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search & Filter
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === 'active') return cat.isActive !== false;
      if (statusFilter === 'inactive') return cat.isActive === false;
      if (statusFilter === 'featured') return Boolean(cat.isFeatured);

      return true;
    });
  }, [categories, searchTerm, statusFilter]);

  // Sorting
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'products') {
        comparison = (a.productCount || 0) - (b.productCount || 0);
      } else if (sortField === 'order') {
        comparison = (a.displayOrder || 0) - (b.displayOrder || 0);
      } else if (sortField === 'date') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredCategories, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCategories.slice(start, start + itemsPerPage);
  }, [sortedCategories, currentPage, itemsPerPage]);

  const handleSort = (field: 'name' | 'products' | 'order' | 'date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 text-[var(--text-secondary)] top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories by name, slug, or keywords..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border theme-border bg-[var(--bg-secondary)] text-[var(--text-main)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border theme-border text-xs shrink-0 self-start sm:self-auto overflow-x-auto">
          {(['all', 'active', 'inactive', 'featured'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setStatusFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border theme-border overflow-hidden bg-[var(--bg-secondary)]/30 backdrop-blur-xs shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b theme-border bg-[var(--bg-secondary)]/80 text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Slug</span>
                    {sortField === 'name' && (<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </div>
                </th>
                <th className="py-3 px-4 hidden md:table-cell">Parent Department</th>
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('products')}>
                  <div className="flex items-center gap-1">
                    <span>Products</span>
                    {sortField === 'products' && (<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 hidden lg:table-cell cursor-pointer select-none" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">
                    <span>Created</span>
                    {sortField === 'date' && (<span>{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y theme-border">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded" />
                          <div className="w-40 h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="w-20 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-3.5 px-4 hidden md:table-cell"><div className="w-16 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-12 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-3.5 px-4"><div className="w-14 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="py-3.5 px-4 hidden lg:table-cell"><div className="w-20 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="w-16 h-6 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={Layers}
                      title={searchTerm ? 'No matching categories' : 'No categories created yet'}
                      description={
                        searchTerm
                          ? `No department found matching "${searchTerm}". Try a different keyword.`
                          : 'Get started by creating your first product category.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => {
                  const productCount = cat.productCount ?? 0;
                  const parentName =
                    typeof cat.parentCategory === 'object' && cat.parentCategory?.name
                      ? cat.parentCategory.name
                      : null;

                  return (
                    <tr
                      key={cat._id}
                      className="hover:bg-[var(--bg-secondary)]/50 transition-colors group"
                    >
                      {/* 1. Category with Thumbnail & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-10 h-10 rounded-xl object-cover border theme-border shrink-0 bg-neutral-100 dark:bg-neutral-800 shadow-2xs group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl border theme-border bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                              <ImageIcon size={18} />
                            </div>
                          )}

                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs text-[var(--text-main)] truncate">
                                {cat.name}
                              </p>
                              {cat.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Sparkles size={9} />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate">
                              {cat.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Slug */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] border theme-border">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* 3. Parent Category */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        {parentName ? (
                          <div className="flex items-center gap-1 text-[var(--text-main)] font-medium text-[11px]">
                            <FolderTree size={12} className="text-[var(--accent-primary)] shrink-0" />
                            <span>{parentName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                            — Top Level —
                          </span>
                        )}
                      </td>

                      {/* 4. Product Count */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border theme-border font-bold text-xs text-[var(--text-main)]">
                          <Package size={12} className="text-[var(--accent-primary)]" />
                          <span>{productCount}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4">
                        <AdminBadge
                          variant={cat.isActive !== false ? 'success' : 'neutral'}
                          dot
                        >
                          {cat.isActive !== false ? 'Active' : 'Inactive'}
                        </AdminBadge>
                      </td>

                      {/* 6. Created Date */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-[11px] text-[var(--text-secondary)] font-mono">
                        {formatDate(cat.createdAt)}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectCategoryForAttributes && (
                            <button
                              type="button"
                              onClick={() => onSelectCategoryForAttributes(cat)}
                              className="p-1.5 rounded-lg border theme-border text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                              title="Inspect Dynamic Attributes"
                            >
                              <Sliders size={13} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onEdit(cat)}
                            className="p-1.5 rounded-lg border theme-border text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(cat)}
                            className="p-1.5 rounded-lg border theme-border text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-3.5 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-secondary)]/50 text-xs">
          <span className="text-[11px] text-[var(--text-secondary)]">
            Showing <strong className="text-[var(--text-main)]">{paginatedCategories.length}</strong> of{' '}
            <strong className="text-[var(--text-main)]">{filteredCategories.length}</strong> categories
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border theme-border bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] text-[var(--text-main)] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border theme-border bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
