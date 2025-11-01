"use client";

import React, { useEffect, useMemo, useState } from "react";

type SalesItem = {
  menuitem_id: number;
  name: string;
  category: string;
  price: number;
  qty: number;
  subtotal: number;
  percent: number;
};

type SalesResponse = {
  totalSales: number;
  items: SalesItem[];
  totalItems?: number;
  page?: number;
  pageSize?: number;
  summary: { Meals: number; Drinks: number; Coffee: number; Desserts?: number; Other?: number };
};

export default function SalesReport({
  start,
  end,
}: {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}) {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    // Reset to first page when date filters change
    setPage(1);
  }, [start, end]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (start) params.set("start", start);
        if (end) params.set("end", end);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        const url = `/api/sales${
          params.toString() ? `?${params.toString()}` : ""
        }`;
        const res = await fetch(url);
        const body = await res.json();
        if (!res.ok)
          throw new Error(body?.error || "Failed to load sales report");
        if (!ignore) setData(body);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [start, end, page, pageSize]);

  const total = data?.totalSales || 0;

  // Sort items by highest percentage first
  const itemsSorted = useMemo(() => {
    const items = data?.items || [];
    // API already slices and percent is computed; keep stable ordering
    return items;
  }, [data]);

  // Unique categories from current page of items (plus known defaults)
  const categories = useMemo(() => {
    const set = new Set<string>();
    (data?.items || []).forEach((i) => set.add(i.category));
    // Ensure common ones appear predictably if present in summary
    const ordered: string[] = [];
    ["Meals", "Drinks", "Coffee", "Desserts", "Other"].forEach((c) => {
      if (set.has(c)) ordered.push(c);
    });
    // Add any remaining categories (sorted alpha for stability)
    const remaining = Array.from(set).filter(
      (c) => !ordered.includes(c)
    );
    remaining.sort((a, b) => a.localeCompare(b));
    return ["All", ...ordered, ...remaining];
  }, [data]);

  // Apply in-list filters only to the current page of items
  const itemsFiltered = useMemo(() => {
    let list = itemsSorted;
    if (categoryFilter && categoryFilter !== "All") {
      list = list.filter((i) => i.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [itemsSorted, categoryFilter, search]);

  // Reserved for potential future use (percentages breakdown in header)
  useMemo(() => {
    const meals = data?.summary?.Meals || 0;
    const drinks = data?.summary?.Drinks || 0;
    const coffee = data?.summary?.Coffee || 0;
    const sum = meals + drinks + coffee;
    const pct = (v: number) => (sum > 0 ? (v / sum) * 100 : 0);
    return {
      meals: pct(meals),
      drinks: pct(drinks),
      coffee: pct(coffee),
    };
  }, [data]);

  return (
  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,200px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)] gap-6 items-start">
      {/* Summary column: mobile first, side-by-side from md upwards */}
  <div className="order-1 md:order-none md:col-start-2 md:row-start-1 w-full md:w-auto md:min-w-[200px] lg:min-w-[260px] flex flex-col gap-3">
        <div className="bg-white md:h-[150px] rounded-md border border-gray-200 shadow-sm p-7 flex flex-col items-center justify-center text-center">
          <div className="text-gray-600 text-xs md:text-sm">Total Sales</div>
          <div className="text-3xl md:text-4xl font-bold text-black mt-1">
            ₱
            {total.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5">
          <div className="text-black font-semibold mb-3">Summary</div>
          <div className="flex justify-center items-center">
            <PieChart
              size={220}
              segments={[
                { color: "#E59C53", value: data?.summary?.Meals || 0 },
                { color: "#B5651D", value: data?.summary?.Drinks || 0 },
                { color: "#7A4A2F", value: data?.summary?.Coffee || 0 },
                { color: "#F19C9C", value: data?.summary?.Desserts || 0 },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2 text-sm">
            <Legend color="#E59C53" label="Meals" />
            <Legend color="#B5651D" label="Drinks" />
            <Legend color="#7A4A2F" label="Coffee" />
            <Legend color="#F19C9C" label="Desserts" />
          </div>
        </div>
      </div>
      {/* Sales per item list: mobile below, desktop left */}
  <div className="order-2 md:order-none md:col-start-1 md:row-start-1 flex-1 bg-white/60 rounded-md border border-gray-200 shadow-sm p-4 md:p-6">
        {/* Title + Filters in a single header row */}
        <div className="mb-3 md:mb-4 border-b border-gray-200 pb-3">
          <div className="flex flex-col gap-2 md:flex-col md:items-start md:justify-start lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-xl md:text-2xl font-bold text-black">Sales per item</h3>
            <div className="flex w-full flex-col md:flex-col lg:flex-row md:w-full lg:w-auto items-center md:items-stretch lg:items-center gap-2 md:gap-2 lg:gap-3">
              {/* Search pill with icon on the right (stacked on md) */}
              <div className="relative w-full md:w-full lg:w-56">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search"
                  className="w-full border border-gray-300 rounded-full text-sm pl-4 pr-10 py-2 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E59C53]/40 focus:border-[#E59C53]"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </div>
              {/* Category select pill */}
              <select
                className="w-full md:w-full lg:w-40 text-center py-1 px-2 border-2 border-black bg-white text-black text-xs h-7 rounded-lg"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "Select category" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Header row (desktop only) */}
    <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,64px)_minmax(0,96px)_minmax(0,90px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,72px)_minmax(0,120px)_minmax(0,220px)] gap-1 text-black font-semibold text-sm md:text-base">
      <div>Product Description</div>
    <div className="text-center">Qty sold</div>
    <div className="text-center lg:text-left">Subtotal</div>
    <div className="text-right">% of total</div>
        </div>
        <hr className="hidden md:block my-2 border-gray-300" />

        {loading ? (
          <p className="text-sm text-gray-600">Generating report…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (data?.items?.length || 0) === 0 ? (
          <p className="text-sm text-gray-600">
            No sales for the selected range.
          </p>
        ) : itemsFiltered.length === 0 ? (
          <p className="text-sm text-gray-600">No items matched your filters.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
            {itemsFiltered.map((it) => (
              <div
                key={it.menuitem_id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,64px)_minmax(0,96px)_minmax(0,90px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,72px)_minmax(0,120px)_minmax(0,220px)] gap-1 items-center text-black min-w-0"
              >
                {/* Product + Qty inline on small screens */}
                <div className="flex justify-between items-center w-full">
                  <div>
                    <div className="font-semibold">{it.name}</div>
                    <div className="text-xs text-gray-600">
                      {it.category} • ₱{it.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-800 md:hidden">
                    {it.qty}
                  </div>
                </div>

                {/* Qty (desktop only) */}
                <div className="hidden md:block md:text-center text-sm">
                  {it.qty}
                </div>

                {/* Subtotal */}
                <div className="md:text-center text-sm">
                  ₱{it.subtotal.toFixed(2)}
                </div>

                {/* Percent Bar - make flexible so it doesn't force overflow */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden min-w-0">
                    <div
                      className="h-2 bg-[#E59C53]"
                      style={{ width: `${Math.min(100, it.percent)}%` }}
                    />
                  </div>
                  <div className="text-sm w-8 text-right flex-shrink-0">
                    {Math.round(it.percent)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination for items list: numeric pages + Next */}
        <div className="flex items-center justify-center gap-2 mt-4 select-none">
          {(() => {
            const totalItems = data?.totalItems || 0;
            const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
            const startPage = Math.max(1, Math.min(page - 4, Math.max(1, totalPages - 9)));
            const endPage = Math.min(totalPages, startPage + 9);
            const count = endPage - startPage + 1;
            return Array.from({ length: count }).map((_, idx) => {
              const current = startPage + idx;
              const isActive = current === page;
              return (
                <button
                  key={current}
                  onClick={() => setPage(current)}
                  disabled={isActive || loading}
                  className={isActive ? "text-black font-semibold px-1" : "text-blue-600 hover:underline px-1"}
                >
                  {current}
                </button>
              );
            });
          })()}
          <button
            className="text-blue-600 hover:underline disabled:opacity-50 ml-2"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || page >= Math.max(1, Math.ceil((data?.totalItems || 0) / pageSize))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-black">{label}</span>
    </div>
  );
}

function PieChart({
  size,
  segments,
}: {
  size: number;
  segments: { color: string; value: number }[];
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  const center = size / 2;
  const radius = size / 2 - 10;
  let cumulative = 0;
  const paths = segments.map((seg, i) => {
    const value = seg.value || 0;
    const angle = total > 0 ? (value / total) * Math.PI * 2 : 0;
    const start = cumulative;
    const end = cumulative + angle;
    cumulative = end;

    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={seg.color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="#e5e5e5" />
      {paths}
      <circle cx={center} cy={center} r={radius * 0.55} fill="#fff" />
    </svg>
  );
}
