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
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "01",
        tableNo: "06",
        time: "5/2/2025 8:13 PM",
        items: [
          { name: "Chkn CrdnBlu.", quantity: 1 },
          { name: "Iced SpnLat. Vnti", quantity: 1 },
        ],
      },
      {
        id: "02",
        tableNo: "04",
        time: "5/2/2025 8:11 PM",
        items: [
          { name: "Baked Sal.", quantity: 1 },
          { name: "Iced CrmMac. Grnd", quantity: 2 },
          { name: "Hot VietLat. Gnd", quantity: 1 },
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
      {orders.map((order) => (
        <div key={order.id} className="mb-3">
          <div className="grid grid-cols-[2fr_3fr_3fr_1fr] gap-2 text-sm text-black">
            {/* Table No. */}
            <div className="text-center">{order.tableNo}</div>

            {/* Date + Time (separate lines) */}
            <div className="flex flex-col items-center">
              <span>{order.time.split(" ")[0]}</span> {/* date */}
              <span>
                {order.time.split(" ")[1]} {order.time.split(" ")[2]}
              </span>{" "}
              {/* time + AM/PM */}
            </div>

            {/* Orders (aligned left) */}
            <div className="text-left">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="truncate overflow-hidden whitespace-nowrap"
                  title={item.name}
                >
                  {item.name}
                </div>
              ))}
            </div>

            {/* Qty (aligned center per row) */}
            <div className="text-center">
              {order.items.map((item, idx) => (
                <div key={idx}>{item.quantity}</div>
              ))}
            </div>
          </div>

          <hr className="border-black my-2" />
        </div>
      ))}

      {orders.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-4">
          No order history available.
        </p>
      )}
    </div>
  );
}
