"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Filter,
} from "lucide-react";
import "./AdminTable.css";

/**
 * Resolves a dot-notated string accessor (e.g. "device.brand") or calls function accessor
 */
function resolveAccessor(item, accessor) {
  if (!accessor) return "";
  if (typeof accessor === "function") {
    return accessor(item);
  }
  if (typeof accessor === "string") {
    return accessor.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), item);
  }
  return "";
}

export default function AdminTable({
  columns = [],
  data = [],
  loading = false,
  title,
  subtitle,
  actions,
  searchable = true,
  searchPlaceholder = "Search records...",
  searchKeys,
  filters = [], // Array of { key, label, options: [{ value, label }], defaultValue }
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  rowKey = (item, idx) => item._id || item.id || idx,
  emptyMessage = "No matching records found.",
  onRowClick,
  showPagination = true,
  showEntriesCount = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const init = {};
    filters.forEach((f) => {
      init[f.key] = f.defaultValue !== undefined ? f.defaultValue : "all";
    });
    return init;
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter & Search
  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Apply custom dropdown filters
    filters.forEach((f) => {
      const selectedValue = selectedFilters[f.key];
      if (selectedValue && selectedValue !== "all") {
        result = result.filter((item) => {
          if (f.filterFn) {
            return f.filterFn(item, selectedValue);
          }
          const itemVal = resolveAccessor(item, f.key || f.accessor);
          return String(itemVal).toLowerCase() === String(selectedValue).toLowerCase();
        });
      }
    });

    // Apply global text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        // If specific search keys provided
        if (Array.isArray(searchKeys) && searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = resolveAccessor(item, k);
            return String(val || "").toLowerCase().includes(term);
          });
        }

        // Default: search all column accessors + basic item properties
        const matchesColumn = columns.some((col) => {
          if (!col.accessor) return false;
          const val = resolveAccessor(item, col.accessor);
          return String(val || "").toLowerCase().includes(term);
        });

        if (matchesColumn) return true;

        // Fallback string search on raw object
        return Object.values(item).some((v) => {
          if (typeof v === "string" || typeof v === "number") {
            return String(v).toLowerCase().includes(term);
          }
          return false;
        });
      });
    }

    // Apply Sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const valA = resolveAccessor(a, sortConfig.key);
        const valB = resolveAccessor(b, sortConfig.key);

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const isNumeric = !isNaN(Number(valA)) && !isNaN(Number(valB));
        let comparison = 0;
        if (isNumeric) {
          comparison = Number(valA) - Number(valB);
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }

        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, selectedFilters, searchTerm, searchKeys, columns, sortConfig]);

  // Reset to page 1 when search or filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, val) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleSort = (colAccessor) => {
    if (!colAccessor) return;
    setSortConfig((prev) => {
      if (prev.key !== colAccessor) {
        return { key: colAccessor, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: colAccessor, direction: "desc" };
      }
      return { key: null, direction: null };
    });
  };

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    if (!showPagination) return filteredData;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, safeCurrentPage, pageSize, showPagination]);

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div className="admin-table-wrapper">
      {/* Top Toolbar (Title, Search, Filters, Actions) */}
      {(title || searchable || filters.length > 0 || actions) && (
        <div className="admin-table-toolbar">
          {title && (
            <div className="admin-table-title-group">
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
          )}

          <div className="admin-table-controls">
            {/* Custom Dropdown Filters */}
            {filters.map((f) => (
              <select
                key={f.key}
                className="admin-table-filter-select"
                value={selectedFilters[f.key] || "all"}
                onChange={(e) => handleFilterChange(f.key, e.target.value)}
              >
                <option value="all">{f.label || "All"}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

            {/* Global Search Input */}
            {searchable && (
              <div className="admin-table-search">
                <Search size={16} className="admin-table-search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            )}

            {/* Extra Action Buttons slot */}
            {actions && <div className="admin-table-extra-actions">{actions}</div>}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isSortable = !!col.sortable;
                const isSorted = sortConfig.key === (col.accessor || col.header);
                const sortDir = isSorted ? sortConfig.direction : null;

                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "";

                return (
                  <th
                    key={col.header || idx}
                    className={`${isSortable ? "sortable" : ""} ${alignClass} ${col.className || ""}`}
                    style={{ width: col.width || "auto" }}
                    onClick={() => isSortable && handleSort(col.accessor || col.header)}
                  >
                    <div className="admin-table-th-inner">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span>
                          {sortDir === "asc" ? (
                            <ArrowUp size={13} />
                          ) : sortDir === "desc" ? (
                            <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} style={{ opacity: 0.4 }} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="admin-table-loading">
                    <div className="respinner" style={{ width: "32px", height: "32px" }}></div>
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="admin-table-empty">
                    <Inbox size={36} />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <tr
                  key={rowKey(item, rowIndex)}
                  className={onRowClick ? "clickable" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, colIndex) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "";

                    let cellContent;
                    if (col.render) {
                      cellContent = col.render(item, rowIndex);
                    } else if (col.accessor) {
                      cellContent = resolveAccessor(item, col.accessor);
                      if (cellContent === null || cellContent === undefined || cellContent === "") {
                        cellContent = "—";
                      }
                    } else {
                      cellContent = "—";
                    }

                    return (
                      <td key={col.header || colIndex} className={`${alignClass} ${col.className || ""}`}>
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer & Pagination */}
      {showPagination && !loading && totalItems > 0 && (
        <div className="admin-table-footer">
          {/* Entries Indicator */}
          {showEntriesCount ? (
            <div>
              Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of{" "}
              <strong>{totalItems}</strong> entries
            </div>
          ) : (
            <div />
          )}

          {/* Page Size Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="admin-table-page-size">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>

            {/* Navigation Buttons */}
            {totalPages > 1 && (
              <div className="admin-table-pagination-nav">
                <button
                  className="admin-table-page-btn"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="admin-table-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`admin-table-page-btn ${safeCurrentPage === p ? "active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="admin-table-page-btn"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
