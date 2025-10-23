"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";

interface Order {
  id: string;
  tableNo: string;
  time: string;
  items: OrderItem[];
}

interface OrderItem {
  name: string;
  quantity: number;
}

export default function OrderHistory() {
  const [order, setOrder] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  // Sales report state
  const [showReport, setShowReport] = useState(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<{ totalSales: number; items: { name: string; quantity: number; sales: number }[] } | null>(null);
  const salesViewActive = useMemo(() => !!salesData, [salesData]);

  const fetchOrders = async (params?: { from?: string; to?: string; includeCleared?: boolean }) => {
      type BackendOrder = {
        order_id?: string | number;
        date_ordered?: string;
        time_ordered?: string;
        customer_id?: string | number;
        cart?: {
          table_number?: string;
          cartitem?: Array<{
            quantity?: number;
            menuitem?: {
              name?: string;
            };
          }>;
        };
      };
    setLoading(true);
    setError(null);
    try {
      let url = "/api/history";
      const qs = new URLSearchParams();
      if (params?.from) qs.set("from", params.from);
      if (params?.to) qs.set("to", params.to);
      if (params?.includeCleared) qs.set("includeCleared", String(!!params.includeCleared));
      const query = qs.toString();
      if (query) url += `?${query}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch order history");
      const data = await response.json();
      const orderArr: Order[] = ((data as BackendOrder[]) || []).map((o) => ({
        id: o.order_id?.toString() || "",
        tableNo: o.customer_id?.toString() || "N/A",
        time:
          o.date_ordered && o.time_ordered
            ? `${o.date_ordered} ${o.time_ordered}`
            : "",
        items:
          o.cart?.cartitem?.map((item) => ({
            name: item.menuitem?.name || "Unknown Item",
            quantity: item.quantity || 0,
          })) || [],
      }));
      setOrder(orderArr);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      setOrder([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load - uncleared history
    fetchOrders();
  }, []);

  const clearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'PATCH' });
      const body = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const message = (body && (body.error || body.message)) || 'Failed to clear history';
        console.error('Clear history error:', res.status, message);
        alert(message);
        return;
      }
      // After clearing, refetch to update UI
      setOrder([]);
    } catch (err) {
      console.error(err);
    } finally {
      setShowClearModal(false);
    }
  };

  // Helpers to compute date ranges
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const setThisWeek = () => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (day === 0 ? -6 : 1) - day; // ISO week start on Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setFromDate(toISODate(monday));
    setToDate(toISODate(sunday));
  };
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(toISODate(start));
    setToDate(toISODate(end));
  };
  const setThisYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    setFromDate(toISODate(start));
    setToDate(toISODate(end));
  };
  const setToday = () => {
    const now = new Date();
    const today = toISODate(now);
    setFromDate(today);
    setToDate(today);
  };

  // (Filter helpers removed; using sales report panel instead)

  return (
    <div className="flex flex-col w-full min-h-screen py-3 pb-[150px] px-7 md:px-24 lg:px-[300px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Order History
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReport((s) => !s)}
            className={`bg-[#d9d9d9] transition-colors px-3 border text-black text-md md:text-lg hover:bg-gray-300`}
            type="button"
          >
            Display Sales Report
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            disabled={order.length === 0 || salesViewActive}
            title={salesViewActive ? "Clear is disabled while viewing sales report" : undefined}
            className={`bg-[#d9d9d9] transition-colors px-3 border text-black text-md md:text-lg ${
              order.length === 0 || salesViewActive
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "hover:bg-red-500"
            }`}
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
      {showReport && (
        <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-md border border-black shadow-lg p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-black">Sales Report</h3>
              <Button type="button" variant="orange" onClick={() => setShowReport(false)}>Close</Button>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Controls */}
              <div>
                <div className="text-black font-semibold mb-3">Select period</div>
                {/* Row 1: From / To (centered, compact) */}
                <div className="flex flex-wrap justify-center items-end gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className="block text-xs text-black mb-1 text-center">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-[140px] border-2 border-black bg-white text-black h-9 px-2 rounded-md"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs text-black mb-1 text-center">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-[140px] border-2 border-black bg-white text-black h-9 px-2 rounded-md"
                    />
                  </div>
                </div>
                {/* Row 2: Presets */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Button type="button" size="sm" variant="outline" onClick={setToday}>Today</Button>
                  <Button type="button" size="sm" variant="outline" onClick={setThisWeek}>This Week</Button>
                  <Button type="button" size="sm" variant="outline" onClick={setThisMonth}>This Month</Button>
                  <Button type="button" size="sm" variant="outline" onClick={setThisYear}>This Year</Button>
                </div>
                {/* Row 3: Actions (side-by-side, centered) */}
                <div className="flex flex-row flex-wrap items-center gap-3 justify-center">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="min-w-[140px]"
                    onClick={() => { setFromDate(""); setToDate(""); setSalesData(null); setSalesError(null); }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="green"
                    className="min-w-[140px]"
                    onClick={async () => {
                      setSalesError(null);
                      setSalesLoading(true);
                      setSalesData(null);
                      try {
                        const qs = new URLSearchParams();
                        if (fromDate) qs.set('from', fromDate);
                        if (toDate) qs.set('to', toDate);
                        const res = await fetch(`/api/history/sales?${qs.toString()}`);
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || 'Failed to load sales report');
                        setSalesData({ totalSales: Number(data.totalSales) || 0, items: Array.isArray(data.items) ? data.items : [] });
                      } catch (e: any) {
                        setSalesError(e?.message || 'Failed to load sales report');
                      } finally {
                        setSalesLoading(false);
                      }
                    }}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              {/* Results */}
              <div className="min-h-[200px]">
                {salesLoading && (
                  <div className="text-sm text-gray-600">Generating report...</div>
                )}
                {salesError && (
                  <div className="text-sm text-red-600">{salesError}</div>
                )}
                {salesData && (
                  <div className="space-y-4">
                    <div className="text-black text-lg font-semibold">
                      Total Sales: <span className="font-bold">₱{salesData.totalSales.toFixed(2)}</span>
                    </div>
                    <div>
                      <div className="text-black font-semibold mb-2">Sales per item</div>
                      {/* Responsive bar graph */}
                      <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
                        {(() => {
                          const maxSales = Math.max(1, ...salesData.items.map(i => Number(i.sales) || 0));
                          return salesData.items.map((i, idx) => {
                            const ratio = (Number(i.sales) || 0) / maxSales;
                            const widthPct = Math.max(3, Math.round(ratio * 100));
                            return (
                              <div key={idx} className="text-sm text-black">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="truncate max-w-[60%]" title={i.name}>{i.name}</span>
                                  <span className="ml-2 whitespace-nowrap text-xs md:text-sm">₱{Number(i.sales).toFixed(2)} · x{i.quantity}</span>
                                </div>
                                <div className="h-3 bg-gray-200 border border-black">
                                  <div className="h-full bg-orange-400" style={{ width: `${widthPct}%` }}></div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <hr className="border-black my-2" />

      {/* Table header */}
      <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] gap-2 font-semibold text-black text-sm md:text-lg">
        <div className="text-center">Table No.</div>
        <div className="text-center">Date/Time</div>
        <div className="text-center">Order</div>
        <div className="text-center">Qty.</div>
      </div>

      <hr className="border-black my-2" />

      {/* Orders */}
      {loading ? (
        <p className="text-center text-sm text-gray-600 py-4">
          Loading order history...
        </p>
      ) : error ? (
        <p className="text-center text-sm text-red-600 py-4">{error}</p>
      ) : order.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">
          No order history available.
        </p>
      ) : (
        order.map((o) => (
          <div key={o.id} className="mb-2">
            <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] gap-2 text-black text-sm md:text-lg">
              {/* Table No. */}
              <div className="flex justify-center items-center row-span-full">
                {o.tableNo}
              </div>

              {/* Date + Time */}
              <div className="flex justify-center items-center row-span-full text-center">
                <div className="flex flex-col">
                  <span>{o.time.split(" ")[0]}</span> {/* date */}
                  <span>
                    {o.time.split(" ")[1]} {o.time.split(" ")[2]}
                  </span>
                </div>
              </div>

              {/* Orders */}
              <div className="flex flex-col gap-1 md:text-center">
                {o.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="truncate px-2 py-1"
                    title={item.name}
                  >
                    {item.name.length > 22
                      ? item.name.slice(0, 20) + "..."
                      : item.name}
                  </div>
                ))}
              </div>

              {/* Qty */}
              <div className="flex flex-col items-center gap-1">
                {o.items.map((item, idx) => (
                  <div key={idx} className="px-2 py-1">
                    {item.quantity}
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-black my-2" />
          </div>
        ))
      )}

      {/* Confirm Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Clear all order history?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowClearModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={clearHistory}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
