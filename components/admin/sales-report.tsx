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
  summary: { Meals: number; Drinks: number; Coffee: number; Other?: number };
};

export default function SalesReport({
  start,
  end,
}: {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}) {
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (start) params.set('start', start);
        if (end) params.set('end', end);
        const url = `/api/sales${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url);
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || "Failed to load sales report");
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
  }, [start, end]);

  const total = data?.totalSales || 0;

  // Sort items by highest percentage first
  const itemsSorted = useMemo(() => {
    const items = data?.items || [];
    return [...items].sort((a, b) => (b.percent || 0) - (a.percent || 0));
  }, [data]);

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
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Left: Sales per item */}
      <div className="flex-1 bg-white/60 rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-black mb-4">Sales per item</h3>

        {/* Header row */}
        <div className="hidden md:grid md:grid-cols-[3fr_1fr_1.5fr_180px] gap-3 text-black font-semibold text-sm md:text-base">
          <div>Product Description</div>
          <div className="text-right pr-2">Qty sold</div>
          <div className="text-right pr-2">Subtotal</div>
          <div className="text-right pr-2">% of total</div>
        </div>
        <hr className="hidden md:block my-2 border-gray-300" />

        {loading ? (
          <p className="text-sm text-gray-600">Generating report…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (data?.items?.length || 0) === 0 ? (
          <p className="text-sm text-gray-600">No sales for the selected range.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
            {itemsSorted.map((it) => (
              <div key={it.menuitem_id} className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1.5fr_180px] gap-2 items-center text-black">
                {/* Product Description */}
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-xs text-gray-600">{it.category} • ₱{it.price.toFixed(2)}</div>
                </div>
                {/* Qty */}
                <div className="md:text-right text-sm">{it.qty}</div>
                {/* Subtotal */}
                <div className="md:text-right text-sm">₱{it.subtotal.toFixed(2)}</div>
                {/* Percent Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 bg-[#E59C53]"
                      style={{ width: `${Math.min(100, it.percent)}%` }}
                    />
                  </div>
                  <div className="text-sm w-10 text-right">{it.percent}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Totals and Summary */}
      <div className="w-full md:w-[380px] flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-gray-600 text-sm">Total Sales</div>
          <div className="text-4xl md:text-5xl font-extrabold text-black mt-2">
            ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="text-black font-semibold mb-4">Summary</div>
          {/* Simple donut pie chart */}
          <PieChart
            size={220}
            segments={[
              { color: "#E59C53", value: data?.summary?.Meals || 0, label: "Meals" },
              { color: "#B5651D", value: data?.summary?.Drinks || 0, label: "Drinks" },
              { color: "#7A4A2F", value: data?.summary?.Coffee || 0, label: "Coffee" },
            ]}
          />
          <div className="flex items-center gap-4 justify-center mt-4 text-sm text-black">
            <Legend color="#E59C53" label="Meals" />
            <Legend color="#B5651D" label="Drinks" />
            <Legend color="#7A4A2F" label="Coffee" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function PieChart({
  size,
  segments,
}: {
  size: number;
  segments: { color: string; value: number; label: string }[];
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0);
  const center = size / 2;
  const radius = (size / 2) - 10;
  let cumulative = 0;
  const paths = segments.map((seg, i) => {
    const value = seg.value || 0;
    const angle = total > 0 ? (value / total) * Math.PI * 2 : 0;
    const startAngle = cumulative;
    const endAngle = cumulative + angle;
    cumulative = endAngle;

    // Create arc path
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={seg.color} />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={center} cy={center} r={radius} fill="#e5e5e5" />
      {paths}
      <circle cx={center} cy={center} r={radius * 0.55} fill="#ffffff" />
    </svg>
  );
}
