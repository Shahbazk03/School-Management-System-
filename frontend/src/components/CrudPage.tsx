'use client';

import { Loader2, Plus, Search, Trash2, Edit2, X } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from './ui';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface CrudPageProps<T> {
  title: string;
  subtitle?: string;
  data: T[] | null;
  loading: boolean;
  columns: Column<T>[];
  onAddClick?: () => void;
  onEditClick?: (row: T) => void;
  onDeleteClick?: (id: string) => void;
  searchPlaceholder?: string;
  renderForm?: () => React.ReactNode;
  isFormOpen?: boolean;
  onCloseForm?: () => void;
  onBulkImport?: (file: File) => void;
  bulkImportLoading?: boolean;
}

export function CrudPage<T extends { id: string }>({
  title,
  subtitle,
  data,
  loading,
  columns,
  onAddClick,
  onEditClick,
  onDeleteClick,
  searchPlaceholder = 'Search...',
  renderForm,
  isFormOpen = false,
  onCloseForm,
  onBulkImport,
  bulkImportLoading = false,
}: CrudPageProps<T>) {
  const [search, setSearch] = useState('');

  // Very basic search filter over serialized row values
  const filteredData = data?.filter((row) =>
    columns.some((col) => {
      const val = col.accessor(row);
      return typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase());
    })
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {onBulkImport && (
            <div>
              <input 
                type="file" 
                id="bulkUpload" 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onBulkImport(file);
                    e.target.value = '';
                  }
                }} 
                disabled={bulkImportLoading} 
              />
              <label 
                htmlFor="bulkUpload" 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors text-sm cursor-pointer opacity-90 disabled:opacity-50"
              >
                {bulkImportLoading ? 'Uploading...' : 'Bulk Import (CSV)'}
              </label>
            </div>
          )}
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors text-sm"
            >
              <Plus size={18} /> Add New
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Section */}
        <div className={`space-y-4 ${isFormOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div className="text-sm font-medium text-slate-500 px-3">
              {filteredData?.length ?? 0} records
            </div>
          </div>

          {/* Table container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {columns.map((col, i) => (
                      <th key={i} className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {col.header}
                      </th>
                    ))}
                    {(onEditClick || onDeleteClick) && (
                      <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-24">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        {columns.map((_, j) => (
                          <td key={j} className="py-4 px-4"><Skeleton className="h-5 w-24" /></td>
                        ))}
                        {(onEditClick || onDeleteClick) && <td className="py-4 px-4"><Skeleton className="h-5 w-12 ml-auto" /></td>}
                      </tr>
                    ))
                  ) : !filteredData || filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + (onEditClick || onDeleteClick ? 1 : 0)} className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                          <Search size={20} className="text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-900">No records found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, i) => (
                      <tr key={row.id || i} className="hover:bg-slate-50/80 transition-colors group">
                        {columns.map((col, j) => (
                          <td key={j} className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">
                            {col.accessor(row)}
                          </td>
                        ))}
                        {(onEditClick || onDeleteClick) && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              {onEditClick && (
                                <button
                                  onClick={() => onEditClick(row)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                              {onDeleteClick && (
                                <button
                                  onClick={() => onDeleteClick(row.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Form */}
        {isFormOpen && renderForm && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden sticky top-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-base">Record Details</h2>
              <button onClick={onCloseForm} className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
              {renderForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
