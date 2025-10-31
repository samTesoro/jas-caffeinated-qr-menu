"use client";

import { useState, useEffect } from "react";
// import { Button } from "../ui/button";

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

export default function OrderHistory({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  const [order, setOrder] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  // Clear action removed per new requirements

  useEffect(() => {
    // Reset to first page when date filters change
    setPage(1);
  }, [start, end]);

  useEffect(() => {
    const fetchOrders = async () => {
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
        const params = new URLSearchParams({ start, end, page: String(page), pageSize: String(pageSize) });
        const response = await fetch(`/api/history?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch order history");
        const data = await response.json();

        const formatDateTime = (dateStr?: string, timeStr?: string) => {
          if (!dateStr || !timeStr) return "";
          const dateObj = new Date(`${dateStr}T${timeStr}`);
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          });
          const formattedTime = dateObj.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return `${formattedDate} ${formattedTime}`;
        };

        // Transform backend data to match UI
        const items = (data?.items as BackendOrder[]) || (data as BackendOrder[]) || [];
        const orderArr: Order[] = items.map((o) => ({
          id: o.order_id?.toString() || "",
          tableNo: o.customer_id?.toString() || "N/A",
          time: formatDateTime(o.date_ordered, o.time_ordered), // formatted output // dreame
          items:
            o.cart?.cartitem?.map((item) => ({
              name: item.menuitem?.name || "Unknown Item",
              quantity: item.quantity || 0,
            })) || [],
        }));

        setOrder(orderArr);
        setTotal(typeof data?.total === 'number' ? data.total : orderArr.length);
      } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) message = err.message;
        setError(message);
        setOrder([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [start, end, page, pageSize]);

  // Clear action removed

  return (
    <div className="flex flex-col w-full min-h-screen py-3 pb-1">
      {/* Title is now provided by the parent container (HistoryAndSales) */}

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

      {/* Pagination: numeric pages + Next */}
      <div className="flex items-center justify-center gap-2 mt-4 select-none">
        {Array.from({ length: Math.min(10, Math.max(1, Math.ceil(total / pageSize))) }).map((_, idx) => {
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          // Sliding window of up to 10 pages around current page
          let startPage = Math.max(1, page - 4);
          const endPage = Math.min(totalPages, startPage + 9);
          startPage = Math.max(1, endPage - 9);
          const current = startPage + idx;
          if (current > endPage) return null;
          const isActive = current === page;
          return (
            <button
              key={current}
              onClick={() => setPage(current)}
              disabled={isActive || loading}
              className={
                isActive
                  ? "text-black font-semibold px-1"
                  : "text-blue-600 hover:underline px-1"
              }
            >
              {current}
            </button>
          );
        })}
        <button
          className="text-blue-600 hover:underline disabled:opacity-50 ml-2"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || page >= Math.max(1, Math.ceil(total / pageSize))}
        >
          Next
        </button>
      </div>

      {/* Clear action removed as per new requirements */}
    </div>
  );
}
