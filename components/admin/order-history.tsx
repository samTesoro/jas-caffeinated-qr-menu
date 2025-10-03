"use client";

import { useState, useEffect } from "react";
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
    fetchOrders();
  }, []);

  const clearHistory = () => {
    setOrder([]);
    setShowClearModal(false);
  };

  return (
    <div className="px-8 md:px-[500px] py-3 w-full pb-20">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Order History
        </h2>
        <button
          onClick={() => setShowClearModal(true)}
          disabled={order.length === 0}
          className={`bg-[#d9d9d9] hover:bg-red-500 transition-colors px-3 border text-black text-md md:text-lg ${
            order.length === 0
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : ""
          }`}
        >
          Clear
        </button>
      </div>

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
          <div className="bg-white rounded-md p-6 w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Clear all order history?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowClearModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={clearHistory}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg"
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
