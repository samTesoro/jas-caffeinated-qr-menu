"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";


interface OrderItem {
  item_name: string;
  quantity: number;
  note?: string | null;
}
interface Order {
  order_id: string;
  status: "preparing" | "finished" | "cancelled" | string;
  time_ordered: string;
  items: OrderItem[];
}
interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
}

export default function NotificationModal({ open, onClose, sessionId }: NotificationModalProps) {
  // ...existing code...

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pendingCancelId, setPendingCancelId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !sessionId) return;
    let active = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders?sessionId=${sessionId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (active) setOrders(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error fetching orders");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => {
      active = false;
      clearInterval(interval);
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
          .then(setOrders);
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
      <div className="bg-white rounded-lg p-6 mx-5 w-[95%] max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-black">My Orders</h2>
        <hr className="border-black mb-4" />

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading orders...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No orders found.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="border-b border-black pb-2">
                <div className="grid grid-cols-[2fr_1fr_2fr] gap-0 text-black text-sm items-start">
                  <div className="flex flex-col gap-1">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="truncate w-full max-w-[150px]"
                        title={item.item_name}
                      >
                        {item.item_name}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1 items-center">
                    {order.items.map((item, idx) => (
                      <span key={idx}>{item.quantity}</span>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-2 min-h-[60px]">
                    <span className="text-xs">
                      Status: {order.status === "preparing" ? (
                        <span className="text-orange-500 font-medium">Preparing</span>
                      ) : order.status === "finished" ? (
                        <span className="text-green-600 font-medium">Finished</span>
                      ) : order.status === "cancelled" ? (
                        <span className="text-red-600 font-medium">Cancelled</span>
                      ) : (
                        <span className="text-gray-500 font-medium">Unknown</span>
                      )}
                    </span>

                    {order.status === "preparing" ? (
                      <Button
                        variant="red"
                        size="default"
                        className="w-full text-xs py-1"
                        onClick={() => handleCancel(order.order_id)}
                      >
                        Cancel Order
                      </Button>
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-right text-black mt-1">{order.time_ordered}</p>
              </div>
            ))}
          </div>
        )}
        {/* Cancel confirmation modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-xs shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4 text-black text-center">Are you sure you want to cancel this order?</h3>
              <div className="flex flex-row items-center gap-4 mt-2 w-full justify-center">
                <Button variant="green" onClick={confirmCancel} className="min-w-[100px] text-lg py-2">Yes</Button>
                <Button variant="red" onClick={cancelCancel} className="min-w-[100px] text-lg py-2">No</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
