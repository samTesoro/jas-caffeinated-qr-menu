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
                </div>
              ))}
            </div>

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
      )}
    </div>
  );
}
