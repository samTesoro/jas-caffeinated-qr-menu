"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import EstimatedTimeDisplay from "./estimated-time";
import NotesModal from "../admin/note-modal";

interface OrderItem {
  item_name: string;
  quantity: number;
  note?: string | null;
  est_time?: number | null;
  subtotal_price?: number | null;
}
interface Order {
  order_id: string;
  status: "preparing" | "finished" | "cancelled" | string;
  time_ordered: string;
  items: OrderItem[];
  estimated?: number;
  range?: { min: number; max: number };
  prepMinutes?: number;
}
interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
}

export default function NotificationModal({
  open,
  onClose,
  sessionId,
}: NotificationModalProps) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingCancelId, setPendingCancelId] = React.useState<string | null>(
    null
  );
  const [now, setNow] = React.useState<number>(Date.now());
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState<string | undefined>(undefined);
  const [noteItemName, setNoteItemName] = React.useState<string | undefined>(
    undefined
  );

  // Utility to get the cancel window start time from localStorage
  // No longer creates a timestamp if missing - it should have been set at order creation
  const getCancelStart = React.useCallback((orderId: string) => {
    const key = `orderCancelStart:${orderId}`;
    const existing =
      typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (existing) {
      const timestamp = parseInt(existing, 10);
      // Validate timestamp is reasonable (not too far in past/future)
      if (!isNaN(timestamp) && timestamp > 0) {
        return timestamp;
      }
    }
    // If no timestamp found or invalid, use current time as fallback
    // (This shouldn't normally happen if order creation properly set it)
    return Date.now();
  }, []);

  const getRemainingMs = React.useCallback(
    (orderId: string) => {
      const start = getCancelStart(orderId);
      const end = start + 2 * 60 * 1000; // 2 minutes
      return Math.max(0, end - now);
    },
    [getCancelStart, now]
  );

  const formatRemaining = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  React.useEffect(() => {
    if (!open || !sessionId) return;
    let active = true;
    const fetchOrders = async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setInitialLoad(true);
      }
      setError(null);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(`/api/orders?sessionId=${sessionId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (active) setOrders(data);
      } catch (err: any) {
        if (!active) return;
        const aborted = err?.name === "AbortError";
        setError(
          aborted
            ? "Timed out fetching orders. Please try again."
            : err instanceof Error
            ? err.message
            : "Error fetching orders"
        );
      } finally {
        clearTimeout(timeout);
        if (active && isInitial) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };
    fetchOrders(true);
    const interval = setInterval(() => fetchOrders(false), 5000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      active = false;
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [open, sessionId]);

  const handleCancel = async (orderId: string) => {
    setShowConfirm(true);
    setPendingCancelId(orderId);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    try {
      const res = await fetch(`/api/orders/${pendingCancelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iscancelled: true }),
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      setShowConfirm(false);
      setPendingCancelId(null);
      // Refetch orders after cancel
      setTimeout(() => {
        fetch(`/api/orders?sessionId=${sessionId}`)
          .then((r) => r.json())
          .then((data) => setOrders(data))
          .catch(() => {});
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cancelling order");
      setShowConfirm(false);
      setPendingCancelId(null);
    }
  };

  const cancelCancel = () => {
    setShowConfirm(false);
    setPendingCancelId(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 mx-5 w-[98%] max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-black">My Orders</h2>
        <hr className="border-black mb-4" />

        {loading && initialLoad ? (
          <div className="text-center text-gray-500 py-8">
            Loading orders...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No orders found.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="border-b border-black pb-2">
                <div className="grid grid-cols-[2fr_1fr_2fr] gap-0 text-black text-sm items-start">
                  {/* Names column */}
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="w-full max-w-[150px]">
                        <div className="truncate">
                          <div
                            className={`${
                              item.note
                                ? "text-blue-600 cursor-pointer underline"
                                : "text-black"
                            }`}
                            title={item.note ? "View note" : item.item_name}
                            onClick={() => {
                              if (item.note) {
                                setNoteText(item.note || undefined);
                                setNoteItemName(item.item_name);
                                setNoteOpen(true);
                              }
                            }}
                          >
                            {item.item_name}
                          </div>
                        </div>
                        {/* Subtotal under item name (merged change) */}
                        <div className="text-xs text-gray-700">
                          {typeof (item as any).subtotal_price === "number"
                            ? new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              }).format((item as any).subtotal_price as number)
                            : "-"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Qty column */}
                  <div className="flex flex-col gap-1 items-center">
                    {order.items.map((item, idx) => (
                      <span key={idx}>{item.quantity}</span>
                    ))}
                  </div>

                  {/* Status/actions column */}
                  <div className="flex flex-col items-start gap-2 min-h-[60px]">
                    <span className="text-xs">
                      Status:{" "}
                      {order.status === "preparing" ? (
                        <span className="text-orange-500 font-medium">
                          Preparing
                        </span>
                      ) : order.status === "finished" ? (
                        <span className="text-green-600 font-medium">
                          Finished
                        </span>
                      ) : order.status === "cancelled" ? (
                        <span className="text-red-600 font-medium">
                          Cancelled
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          Unknown
                        </span>
                      )}
                    </span>

                    {order.status === "preparing" ? (
                      <Button
                        variant="red"
                        size="default"
                        className={`w-full text-xs py-1 ${
                          getRemainingMs(order.order_id) <= 0
                            ? "opacity-50 cursor-not-allowed bg-gray-300 border-gray-300 text-gray-600"
                            : ""
                        }`}
                        onClick={() =>
                          getRemainingMs(order.order_id) > 0 &&
                          handleCancel(order.order_id)
                        }
                        disabled={getRemainingMs(order.order_id) <= 0}
                      >
                        Cancel Order
                      </Button>
                    ) : (
                      <div className="h-8" />
                    )}
                    {order.status === "preparing" && (
                      <div className="text-[10px] text-gray-600 mt-1">
                        {getRemainingMs(order.order_id) > 0 ? (
                          <>
                            Cancel available for{" "}
                            <span className="font-semibold">
                              {formatRemaining(getRemainingMs(order.order_id))}
                            </span>
                          </>
                        ) : (
                          <>Cancel window expired</>
                        )}

                        {/* ETA shown on its own line below the cancel message */}
                        <div className="text-[10px] text-gray-700 mt-1 leading-none">
                          {typeof (order as any).estimated === "number" &&
                          (order as any).range ? (
                            (order as any).range.min ===
                            (order as any).range.max ? (
                              <>Est. ~{(order as any).estimated} min</>
                            ) : (
                              <>
                                Est. ~{(order as any).range.min}–
                                {(order as any).range.max} min
                              </>
                            )
                          ) : (
                            <EstimatedTimeDisplay
                              orderId={order.order_id}
                              small
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider below subtotals */}
                <hr className="border-black mt-2" />

                {/* Total (shown below divider) */}
                <div className="flex items-center justify-end mt-1 pr-1 text-black">
                  <span className="text-xs mr-2 font-semibold">Total:</span>
                  <span className="text-sm font-bold">
                    {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
                      (order.items || []).reduce(
                        (sum, it: any) => sum + (typeof it?.subtotal_price === "number" ? (it.subtotal_price as number) : 0),
                        0
                      )
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-xs text-black leading-none">
                      {order.time_ordered}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Cancel confirmation modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-xs shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4 text-black text-center">
                Are you sure you want to cancel this order?
              </h3>
              <div className="flex flex-row items-center gap-4 mt-2 w-full justify-center">
                <Button
                  variant="red"
                  onClick={cancelCancel}
                  className="border-transparent min-w-[100px] text-md font-semibold py-2"
                >
                  No
                </Button>
                <Button
                  variant="green"
                  onClick={confirmCancel}
                  className="border-transparent min-w-[100px] text-md font-semibold py-2"
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        )}
        <NotesModal
          open={noteOpen}
          note={noteText}
          itemName={noteItemName}
          onClose={() => setNoteOpen(false)}
        />
      </div>
    </div>
  );
}
