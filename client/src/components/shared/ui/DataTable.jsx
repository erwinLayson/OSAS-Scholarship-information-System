import React from 'react';

/**
 * DataTable Component
 * Reusable table with consistent styling, sorting capability, and action buttons
 * 
 * @param {Array} columns - Column definitions: { key, label, render?, sortable?, width? }
 * @param {Array} data - Array of data objects
 * @param {function} onRowClick - Optional row click handler
 * @param {boolean} loading - Show loading state
 * @param {string} emptyMessage - Message when no data
 * @param {string} className - Additional CSS classes
 */
const DataTable = ({ 
  columns = [],
  data = [],
  onRowClick = null,
  loading = false,
  emptyMessage = 'No data available',
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider
                    ${column.width ? column.width : ''}
                  `}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    hover:bg-gray-50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className="px-4 py-4 text-sm text-gray-700"
                    >
                      {column.render 
                        ? column.render(row[column.key], row) 
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
