"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Order {
  id: string;
  status: "Pending" | "Preparing" | "Finished";
  tableNo: string;
  time: string;
  items: OrderItem[];
  paymentMethod: string;
}

interface OrderItem {
  name: string;
  quantity: number;
}

export default function OrderNotification() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "01",
        status: "Finished",
        tableNo: "06",
        time: "8:13 PM",
        items: [
          { name: "Chicken CordonBlue.", quantity: 1 },
          { name: "Iced SpnLat. Vnti", quantity: 1 },
        ],
        paymentMethod: "Cash/Card",
      },
      {
        id: "02",
        status: "Preparing",
        tableNo: "04",
        time: "5/2/2025 8:11 PM",
        items: [
          { name: "Baked Sal.", quantity: 1 },
          { name: "Iced CrmMac. Grnd", quantity: 2 },
          { name: "Hot VietLat. Gnd", quantity: 1 },
          { name: "Pork Sinigang", quantity: 1 },
        ],
        paymentMethod: "GCash",
      },
    ];
    setOrders(mockOrders);
  }, []);

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
  };

  const markAsFinished = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4">
        <h2 className="text-2xl font-bold text-black">Orders</h2>
      </div>
      <hr className="border-black my-4"></hr>

      {orders.map((order) => (
        <div key={order.id} className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-black p-1">
                {order.id}
              </span>
              <button
                onClick={() => markAsFinished(order.id)}
                className="bg-[#A7F586] hover:bg-green-300 transition-colors px-1 border text-black text-sm"
              >
                Finished
              </button>
            </div>
            <button
              onClick={() => deleteOrder(order.id)}
              className="text-black hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[2fr_2fr_3fr_1fr] gap-3 mb-2 font-semibold text-black text-sm">
            <div className="text-center">Table No.</div>
            <div className="text-center">Time</div>
            <div className="text-center">Order</div>
            <div className="text-center">Qty.</div>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[2fr_2fr_3fr_1fr] gap-3 mb-2 text-black text-sm p-2">
            <div className="text-center">{order.tableNo}</div>
            <div className="text-center">{order.time}</div>
            <div className="text-left">
              {order.items.map((item, index) => (
                <div key={index}>{item.name}</div>
              ))}
            </div>
            <div className="text-center">
              {order.items.map((item, index) => (
                <div key={index}>{item.quantity}</div>
              ))}
            </div>
          </div>

          <hr className="border-blacks my-2" />

          <div className="flex justify-end items-center text-black text-sm">
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

          <hr className="border-black my-4" />
        </div>
      ))}

      {orders.length === 0 && (
        <p className="text-black text-center py-8">No orders available.</p>
      )}
    </>
  );
}
