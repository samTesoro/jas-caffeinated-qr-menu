"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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
}
export default function OrderNotification() {
  const [orders, setOrders] = useState<Order[]>([]);

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
    <div className="px-8 md:px-[500px] py-3 w-full pb-20">
      <div className="mx-auto mb-4">
        <h2 className="text-2xl font-bold text-black md:text-3xl">Orders</h2>
      </div>
      <hr className="border-black my-4" />

      {orders.map((order, index) => (
        <div key={order.order_id} className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-black p-1">
                {index + 1}
              </span>
              <button
                onClick={() => markAsFinished(order.order_id)}
                className="bg-[#A7F586] hover:bg-gray-400 transition-colors px-1 border text-black text-sm md:text-lg"
              >
                Finished
              </button>
            </div>
            <button
              onClick={() => deleteOrder(order.order_id)}
              className="text-black hover:text-red-700"
            >
              <X className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] gap-2 mb-2 font-semibold text-black text-sm md:text-lg">
            <div className="text-center">Table No.</div>
            <div className="text-center">Time</div>
            <div className="text-center">Order</div>
            <div className="text-center">Qty.</div>
          </div>

          <hr className="border-black my-2" />

          <div className="grid grid-cols-[65px_90px_100px_60px] md:grid-cols-[1fr_2fr_3fr_1fr] gap-2 mb-2 text-black text-sm md:text-lg">
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
                    className="truncate px-2 py-1"
                    title={item.name}
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
    </div>
  );
}
