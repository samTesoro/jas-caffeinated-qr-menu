"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
interface Order {
  order_id: string;
  status: "Pending" | "Preparing" | "Finished";
  tableNo: string;
  time: string;
  items: OrderItem[];
  paymentMethod: string;
}
interface OrderItem {
  name: string;
  quantity: number;
  note?: string | null;
}
import NotesModal from "./note-modal";
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
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        // Transform API data to match UI structure
        interface Item {
          item_name: string;
          quantity: number;
          note?: string | null;
        }
        interface Order {
          order_id: string;
          isfinished: boolean;
          customer_id: string | number | null;
          time_ordered: string;
          items?: Item[];
          payment_type: string;
        }
        const transformed = (data as Order[])
          .map((order) => ({
            order_id: order.order_id?.toString() ?? "",
            status: order.isfinished
              ? "Finished"
              : ("Preparing" as "Preparing" | "Finished"),
            tableNo: String(order.customer_id ?? "N/A"),
            time: order.time_ordered ?? "",
            items:
              order.items?.map((item) => ({
                name: item.item_name,
                quantity: item.quantity,
                note: item.note ?? null,
              })) ?? [],
            paymentMethod: order.payment_type ?? "",
          }))
          .sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
          );
        setOrders(transformed);
      } catch {
        setOrders([]);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.order_id !== id));
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
    <div className=" md:px-24 lg:px-[600px] py-3 w-full pb-20 px-6">
      <div className="mx-auto mb-4">
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
              <button
                onClick={() => {
                  setFinishedOrderId(order.order_id);
                  setShowFinishedModal(true);
                }}
                className="bg-[#A7F586] hover:bg-gray-400 transition-colors px-1 border text-black text-sm md:text-lg"
              >
                Finished
              </button>
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

          <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] lg:grid-cols-[1fr_2fr_3fr_1fr] gap-2 mb-2 font-semibold text-black text-sm md:text-lg">
            <div className="text-center">Table No.</div>
            <div className="text-center">Time</div>
            <div className="text-center">Order</div>
            <div className="text-center">Qty.</div>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] lg:grid-cols-[1fr_2fr_3fr_1fr] gap-2 mb-2 text-black text-sm md:text-lg">
            <div className="flex justify-center items-center row-span-full text-center">
              {order.tableNo}
            </div>
            <div className="flex justify-center items-center row-span-full text-center">
              {order.time}
            </div>
            <div className="flex flex-col gap-1 md:text-center">
              <div>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`truncate px-2 py-1 ${
                      item.note ? "text-blue-600 cursor-pointer underline" : ""
                    }`}
                    title={item.name}
                    onClick={() => {
                      if (item.note) {
                        setNoteText(item.note || undefined);
                        setNoteItemName(item.name);
                        setNoteOpen(true);
                      }
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="px-2 py-1">
                  {item.quantity}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-blacks my-2" />

          <div className="flex justify-end items-center text-black text-sm md:text-lg mb-10">
            <span>Payment: </span>
            <span
              className={`ml-2 ${
                order.paymentMethod.toLowerCase() === "gcash"
                  ? "text-blue-600 font-bold"
                  : "text-black font-bold"
              }`}
            >
              {order.paymentMethod}
            </span>
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