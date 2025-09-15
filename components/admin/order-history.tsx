
"use client";


import { useState, useEffect } from "react";

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
        const response = await fetch("/api/history");
        if (!response.ok) throw new Error("Failed to fetch order history");
        const data = await response.json();
        // Transform backend data to match UI
        const orderArr: Order[] = (data as BackendOrder[] || []).map((o) => ({
          id: o.order_id?.toString() || "",
          tableNo: o.customer_id?.toString() || "N/A",
          time: o.date_ordered && o.time_ordered
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
    fetchOrders();
  }, []);

  const clearHistory = () => {
  setOrder([]);
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-black">Order History</h2>
        <button
          onClick={clearHistory}
          className="bg-[#d9d9d9] hover:bg-green-300 transition-colors px-3 border text-black text-md"
        >
          Clear
        </button>
      </div>

      <hr className="border-black my-2" />

      {/* Table header */}
      <div className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-2 mb-1 text-sm font-semibold text-black">
        <div className="text-center">Table No.</div>
        <div className="text-center">Date/Time</div>
  <div className="text-center">Order</div>
        <div className="text-center">Qty.</div>
      </div>

      <hr className="border-black my-2" />

      {/* Orders */}
      {loading ? (
        <p className="text-center text-sm text-gray-600 py-4">Loading order history...</p>
      ) : error ? (
        <p className="text-center text-sm text-red-600 py-4">{error}</p>
      ) : order.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">No order history available.</p>
      ) : (
        order.map((o) => (
          <div key={o.id} className="mb-3">
            <div className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-2 text-sm text-black">
              {/* Table No. */}
              <div className="text-center">{o.tableNo}</div>

              {/* Date + Time (separate lines) */}
              <div className="flex flex-col items-center">
                <span>{o.time.split(" ")[0]}</span> {/* date */}
                <span>
                  {o.time.split(" ")[1]} {o.time.split(" ")[2]}
                </span>{" "}
                {/* time + AM/PM */}
              </div>

              {/* Orders (aligned left) */}
              <div className="text-center">
                <div className="flex flex-col items-center break-words">
                  {o.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full text-center break-words"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Qty (aligned center per row) */}
              <div className="text-center">
                {o.items.map((item, idx) => (
                  <div key={idx}>{item.quantity}</div>
                ))}
              </div>
            </div>

            <hr className="border-black my-2" />
          </div>
        ))
      )}
    </div>
  );
}
