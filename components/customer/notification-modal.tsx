"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  open,
  onClose,
}: NotificationModalProps) {
  if (!open) return null;

  const mockOrders = [
    {
      id: 1,
      items: [
        { name: "Chicken Cordon Bleu with Extra Cheese Topping", qty: 1 },
        { name: "Iced Spanish Latte (Venti)", qty: 1 },
      ],
      status: "Preparing",
      time: "8:13 PM",
      canCancel: true,
    },
    {
      id: 2,
      items: [
        { name: "French Fries", qty: 1 },
        { name: "Iced Spanish Latte (Grande)", qty: 1 },
      ],
      status: "Finished",
      time: "8:11 PM",
      canCancel: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 mx-5 w-[95%] max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-black">My Orders</h2>
        <hr className="border-black mb-4" />

        {/* Orders */}
        <div className="space-y-6">
          {mockOrders.map((order) => (
            <div key={order.id} className="border-b border-black pb-2">
              <div className="grid grid-cols-[2fr_1fr_2fr] gap-0 text-black text-sm items-start">
                {/* Column 1: Items */}
                <div className="flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="truncate w-full max-w-[150px]" //(...)
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>

                {/* Column 2: Quantities */}
                <div className="flex flex-col gap-1 items-center">
                  {order.items.map((item, idx) => (
                    <span key={idx}>{item.qty}</span>
                  ))}
                </div>

                {/* Column 3: Status + Button (same space always) */}
                <div className="flex flex-col items-start gap-2 min-h-[60px]">
                  <span className="text-xs">
                    Status:{" "}
                    {order.status === "Preparing" ? (
                      <span className="text-orange-500 font-medium">
                        Preparing
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        Finished
                      </span>
                    )}
                  </span>

                  {order.canCancel ? (
                    <Button
                      variant="red"
                      size="default"
                      className="w-full text-xs py-1"
                    >
                      Cancel Order
                    </Button>
                  ) : (
                    <div className="h-8" /> // placeholder keeps column aligned
                  )}
                </div>
              </div>

              {/* Time (always bottom right) */}
              <p className="text-xs text-right text-black mt-1">{order.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
