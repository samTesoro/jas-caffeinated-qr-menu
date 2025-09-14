"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

  useEffect(() => {
    // Placeholder/mock data with one item having a note for testing
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
  };

  return (
    <div className="px-8 py-5 w-full">
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

      {/* Fixed column widths for alignment */}
      <div className="grid grid-cols-[70px_90px_100px_70px] gap-0 mb-2 font-semibold text-black text-sm w-full">
        <div className="text-center">Table No.</div>
        <div className="text-center">Date/Time</div>
        <div className="text-center">Order</div>
        <div className="text-center">Qty.</div>
      </div>
      <hr className="border-black my-2" />

      {orders.map((order) => (
        <div key={order.order_id}>
          {order.items.map((item, idx) => (
            <div
              key={`${order.order_id}-${idx}`}
              className={`grid grid-cols-[70px_90px_100px_80px] gap-0 text-black text-sm items-center w-full`}
              style={{ minHeight: "40px" }}
            >
              <div className="text-center">{order.tableNo}</div>
              <div className="text-center">{order.time}</div>
              <div
                className={`pl-2 py-1 rounded cursor-pointer flex items-center w-full ${
                  item.note ? "bg-[#ebebeb] text-blue-500 font-semibold" : ""
                }`}
                style={{
                  maxWidth: "100%",
                  transition: "background 0.2s",
                }}
                title={item.name}
                onClick={() => item.note && setModalItem(item)}
              >
                <span
                  className="truncate"
                  style={{ maxWidth: "220px", display: "inline-block" }}
                >
                  {item.name.length > 22
                    ? item.name.slice(0, 20) + "..."
                    : item.name}
                </span>
              </div>
              <div className="text-center">{item.quantity}</div>
            </div>
          ))}
          <hr className="border-black my-2" />
        </div>
      ))}

      {/* Notes Modal */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md py-4 px-7 w-[320px] relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-left mt-3 text-black">
                Note
              </h3>
              <button className="text-black" onClick={() => setModalItem(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-1 mb-[50px] text-black text-left text-sm">
              {modalItem.note}
            </div>

            <div className="absolute bottom-3 right-7 text-xs text-gray-500 font-semibold">
              {modalItem.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
