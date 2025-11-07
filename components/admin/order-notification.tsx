"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
interface Order {
  order_id: string;
  status: "Pending" | "Preparing" | "Finished" | "Cancelled";
  tableNo: string;
  time: string;
  items: OrderItem[];
  paymentMethod: string;
  iscancelled?: boolean;
  orderTotal?: number;
}
interface OrderItem {
  name: string;
  quantity: number;
  note?: string | null;
  subtotal_price?: number | null;
}
import NotesModal from "./note-modal";
import { createClient } from "@/lib/supabase/client";
export default function OrderNotification() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState<string | undefined>(undefined);
  const [noteItemName, setNoteItemName] = useState<string | undefined>(
    undefined
  );
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [finishedOrderId, setFinishedOrderId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  useEffect(() => {
      let inFlight: AbortController | null = null;
      const fetchOrders = async () => {
        try {
          // Abort any previous in-flight request to avoid queueing
          if (inFlight) {
            try { inFlight.abort(); } catch {}
          }
          inFlight = new AbortController();
          const response = await fetch("/api/orders", { signal: inFlight.signal });
          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }
          const data = await response.json();
        // Transform API data to match UI structure
        interface Item {
          item_name: string;
          quantity: number;
          note?: string | null;
          subtotal_price?: number | null;
        }
        interface Order {
          order_id: string;
          isfinished: boolean;
          iscancelled?: boolean;
          customer_id: string | number | null;
          time_ordered: string;
          items?: Item[];
          payment_type: string;
        }

        const convertTo12Hour = (timeString: string): string => {
          if (!timeString) return "";
          const [hourStr, minuteStr] = timeString.split(":");
          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);
          const ampm = hour >= 12 ? "PM" : "AM";
          hour = hour % 12 || 12;
          return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
        };

        const transformed = (data as Order[])
          .map((order) => ({
            order_id: order.order_id?.toString() ?? "",
            status: order.iscancelled
              ? "Cancelled"
              : order.isfinished
              ? "Finished"
              : ("Preparing" as "Preparing" | "Finished" | "Cancelled"),
            iscancelled: !!order.iscancelled,
            tableNo: String(order.customer_id ?? "N/A"),
            time: convertTo12Hour(order.time_ordered ?? ""),
            items:
              order.items?.map((item) => ({
                name: item.item_name,
                quantity: item.quantity,
                note: item.note ?? null,
                subtotal_price: item.subtotal_price ?? null,
              })) ?? [],
            paymentMethod: order.payment_type ?? "",
            orderTotal: (order.items || []).reduce(
              (sum, it) => sum + (typeof it.subtotal_price === "number" ? it.subtotal_price : 0),
              0
            ),
          }))
          .sort((a, b) => {
            const to24HourDate = (time: string) => {
              const [timePart, modifier] = time.split(" ");
              const [h, m] = timePart.split(":").map(Number);
              let hour = h;
              if (modifier === "PM" && h !== 12) hour += 12;
              if (modifier === "AM" && h === 12) hour = 0;
              const today = new Date().toISOString().split("T")[0];
              return new Date(
                `${today}T${hour.toString().padStart(2, "0")}:${m
                  .toString()
                  .padStart(2, "0")}:00`
              );
            };
            const dateA = to24HourDate(a.time);
            const dateB = to24HourDate(b.time);
            // earliest first
            return dateA.getTime() - dateB.getTime();
          });

        setOrders(transformed);
      } catch {
        setOrders([]);
      }
    };
  fetchOrders();

    // Start polling as a fallback (every 3s)
    let interval = setInterval(fetchOrders, 3000);

    // Pause polling when tab is hidden; resume when visible
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(interval);
      } else {
        fetchOrders();
        interval = setInterval(fetchOrders, 3000);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Set up Supabase realtime subscription so the list refreshes immediately
    // when orders are inserted or updated.
    try {
  const supabase = createClient();

      const channel = supabase
        .channel("public:order")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "order" },
          () => { fetchOrders(); }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "order" },
          () => { fetchOrders(); }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "order" },
          () => { fetchOrders(); }
        )
        .subscribe();

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', onVis);
        try {
          if (channel && typeof (channel as any).unsubscribe === "function") {
            (channel as any).unsubscribe();
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // If realtime setup fails, just rely on polling
      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', onVis);
      };
    }
  }, []);

  const deleteOrder = async (id: string) => {
    try {
      // Admin "delete" should mark the order as cleared so it forever disappears from lists
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iscleared: true }),
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      setOrders((prev) => prev.filter((order) => order.order_id !== id));
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const markAsFinished = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isfinished: true }),
      });
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      setOrders((prev) => prev.filter((order) => order.order_id !== id));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen py-3 pb-20 px-7 md:px-24 lg:px-[300px] overflow-x-hidden">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-black md:text-3xl">Orders</h2>
      </div>

      <hr className="border-black my-4" />

      {orders.map((order, index) => (
        <div key={order.order_id} className="mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-black p-1">
                {index + 1}
              </span>
              {order.iscancelled ? (
                <div className="bg-red-400 text-black font-normal px-1 border text-sm md:text-lg rounded">
                  Cancelled
                </div>
              ) : (
                <button
                  onClick={() => {
                    setFinishedOrderId(order.order_id);
                    setShowFinishedModal(true);
                  }}
                  className="bg-[#A7F586] hover:bg-gray-400 transition-colors px-1 border text-black text-sm md:text-lg"
                >
                  Mark as finished
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setDeleteOrderId(order.order_id);
                setShowDeleteModal(true);
              }}
              className="text-black hover:text-red-700"
            >
              <X className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[50px_1fr_2fr_auto_auto] md:grid-cols-[1fr_2fr_3fr_1fr_1fr] lg:grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-2 mb-2 font-semibold text-black text-sm md:text-lg">
            <div className="text-center">Table No.</div>
            <div className="text-center">Time</div>
            <div className="text-center">Order</div>
            <div className="text-center pl-4">Subtotal</div>
            <div className="text-center">Qty.</div>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[50px_1fr_2fr_auto_auto] md:grid-cols-[1fr_2fr_3fr_1fr_1fr] lg:grid-cols-[1fr_2fr_3fr_1fr_1fr] gap-2 mb-2 text-black text-sm md:text-lg">
            {order.items.map((item, idx) => (
              <React.Fragment key={`row-${order.order_id}-${idx}`}>
                <div className="flex justify-center items-center text-center" key={`t-${idx}`}>
                  {idx === 0 ? order.tableNo : ""}
                </div>
                <div className="flex justify-center items-center text-center" key={`ti-${idx}`}>
                  {idx === 0 ? order.time : ""}
                </div>
                {/* Item name */}
                <div className="px-2 py-1 truncate md:text-center" key={`n-${idx}`}>
                  <span
                    className={`${item.note ? "text-blue-600 cursor-pointer underline" : ""}`}
                    title={item.note ? "View note" : item.name}
                    onClick={() => {
                      if (item.note) {
                        setNoteText(item.note || undefined);
                        setNoteItemName(item.name);
                        setNoteOpen(true);
                      }
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                {/* Subtotal aligned with name */}
                <div className="px-2 py-1 text-right" key={`s-${idx}`}>
                  {typeof item.subtotal_price === "number"
                    ? new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(item.subtotal_price)
                    : "-"}
                </div>
                {/* Quantity aligned with name */}
                <div className="px-2 py-1 text-center" key={`q-${idx}`}>
                  {item.quantity}
                </div>
              </React.Fragment>
            ))}
          </div>
          <hr className="border-blacks my-2" />

          {/* Bottom summary row centered: Payment then Total (subtotal column unchanged above) */}
          <div className="flex justify-end items-center gap-6 text-black text-sm md:text-lg mb-10 w-full pr-2 md:pr-4">
            <div>
              <span className="font-semibold">Payment: </span>
              <span
                className={
                  order.paymentMethod.toLowerCase() === "gcash"
                    ? "text-blue-600 font-bold"
                    : "text-orange-600 font-bold"
                }
              >
                {order.paymentMethod}
              </span>
            </div>
            <div>
              <span className="font-semibold">Total: </span>
              <span className="font-bold text-red-600">
                {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(order.orderTotal || 0)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {orders.length === 0 && (
        <p className="text-black text-center py-8">No orders available.</p>
      )}

      <NotesModal
        open={noteOpen}
        note={noteText}
        itemName={noteItemName}
        onClose={() => setNoteOpen(false)}
      />

      {/* Finished Confirmation Modal */}
      {showFinishedModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-2">
              Mark order as finished?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowFinishedModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={() => {
                  if (finishedOrderId) markAsFinished(finishedOrderId);
                  setShowFinishedModal(false);
                }}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Delete this order?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={() => {
                  if (deleteOrderId) deleteOrder(deleteOrderId);
                  setShowDeleteModal(false);
                }}
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
