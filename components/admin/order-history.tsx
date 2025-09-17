
"use client";


import { useState, useEffect } from "react";
import NotesModal from "./note-modal";
import { Button } from "../ui/button";
interface OrderItem {
  name: string;
  quantity: number;
  note?: string;
}

interface Order {
  order_id: string;
  tableNo: string;
  time: string;
  items: OrderItem[];
}

export default function OrderHistory() {
<<<<<<< HEAD
  const [orders, setOrders] = useState<Order[]>([]);
  const [modalItem, setModalItem] = useState<OrderItem | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    // Placeholder/mock data
    const mockOrders: Order[] = [
      {
        order_id: "01",
        tableNo: "06",
        time: "5/2/2025 8:13 PM",
        items: [
          {
            name: "Chicken Cordon Bleu",
            quantity: 1,
            note: "No mayo, extra cheese please.",
          },
          { name: "Iced Spanish Latte Venti", quantity: 1 },
        ],
      },
      {
        order_id: "02",
        tableNo: "04",
        time: "5/2/2025 8:11 PM",
        items: [
          { name: "Baked Salmon", quantity: 1 },
          { name: "Iced Caramel Macchiato Grande", quantity: 2 },
          { name: "Hot Vietnamese Latte Grande", quantity: 1 },
          { name: "Pork Sinigang", quantity: 1 },
        ],
      },
    ];
    setOrders(mockOrders);
  }, []);

  const clearHistory = () => {
    setOrders([]);
    setShowClearModal(false);
=======
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
>>>>>>> 7137e7fe9453f573fb92e3a0a69c0333ec43334c
  };

  return (
    <div className="px-8 py-5 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-black">Order History</h2>
        <button
          onClick={() => setShowClearModal(true)}
          className="bg-[#d9d9d9] hover:bg-green-300 transition-colors px-3 border text-black text-md"
        >
          Clear
        </button>
      </div>

      <hr className="border-black my-2" />

<<<<<<< HEAD
      {orders.map((order) => (
        <div key={order.order_id} className="mb-6">
          <div className="grid grid-cols-[65px_90px_100px_60px] gap-2 font-semibold text-black text-sm">
            <div className="text-center">Table No.</div>
            <div className="text-center">Date/Time</div>
            <div className="text-center">Order</div>
            <div className="text-center">Qty.</div>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[65px_90px_100px_60px] gap-2 text-black text-sm">
            <div className="flex justify-center items-center row-span-full">
              {order.tableNo}
            </div>

            <div className="flex justify-center items-center row-span-full text-center">
              <div className="flex flex-col">
                <span>{order.time.split(" ")[0]}</span>
                <span>
                  {order.time.split(" ")[1] + " " + order.time.split(" ")[2]}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`truncate cursor-pointer px-2 py-1 ${
                    item.note
                      ? "bg-[#ebebeb] text-blue-500 font-semibold rounded"
                      : ""
                  }`}
                  title={item.name}
                  onClick={() => item.note && setModalItem(item)}
                >
                  {item.name.length > 22
                    ? item.name.slice(0, 20) + "..."
                    : item.name}
=======
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
>>>>>>> 7137e7fe9453f573fb92e3a0a69c0333ec43334c
                </div>
              </div>

              {/* Qty (aligned center per row) */}
              <div className="text-center">
                {o.items.map((item, idx) => (
                  <div key={idx}>{item.quantity}</div>
                ))}
              </div>
            </div>

<<<<<<< HEAD
            <div className="flex flex-col items-center gap-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="px-2 py-1">
                  {item.quantity}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-black my-2" />
        </div>
      ))}

      {/* Notes Modal */}
      <NotesModal
        open={!!modalItem}
        note={modalItem?.note}
        itemName={modalItem?.name}
        onClose={() => setModalItem(null)}
      />

      {/* Confirmation Modal ito mga siz*/}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-[250px] text-center space-y-4">
            <p className="text-md text-black font-bold mt-3">
              Clear Order History?
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
=======
            <hr className="border-black my-2" />
          </div>
        ))
>>>>>>> 7137e7fe9453f573fb92e3a0a69c0333ec43334c
      )}
    </div>
  );
}
