"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import DashboardHeader from "@/components/ui/header";
import { Button } from "@/components/ui/button";

export default function CartPage({
  tableId,
  sessionId,
}: {
  tableId?: string;
  sessionId?: string;
}) {
  type CartItem = {
    cartitem_id: number;
    quantity: number;
    subtotal_price: number;
    menuitem_id: number;
    note?: string | null;
    menuitem?: {
      name: string;
      price: number;
      thumbnail?: string;
      description?: string | null;
    };
  };
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<number | null>(null);
  const router = useRouter();

  const clearLocalCart = () => {
    try {
      const sid =
        sessionId ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("sessionId") ||
            sessionStorage.getItem("session_id") ||
            undefined
          : undefined);
      if (sid) localStorage.removeItem(`cartItems:${sid}`);
      // Legacy fallback just in case
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch {}
    setCart([]);
  };

  const BackIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className="w-8 h-8"
    >
      <path
        fillRule="evenodd"
        d="M19 12a1 1 0 0 1-1 1H8.414l3.293 3.293a1 1 0 1 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z"
        clipRule="evenodd"
      />
    </svg>
  );
  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={2}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 
         01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 
         011-1h4a1 1 0 011 1v3"
      />
    </svg>
  );

  useEffect(() => {
    const fetchCart = async () => {
      const supabase = createClient();
      // Resolve a session-scoped key
      const sid =
        sessionId ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("sessionId") ||
            sessionStorage.getItem("session_id") ||
            undefined
          : undefined);
      // Prefer DB cart for accurate cartitem IDs (add/remove are DB-backed)
      let session_id: string;
      if (sid) {
        session_id = sid;
      } else {
        let storedSessionId = sessionStorage.getItem("session_id");
        if (!storedSessionId) {
          storedSessionId = uuidv4();
          sessionStorage.setItem("session_id", storedSessionId);
        }
        session_id = storedSessionId;
      }

      let cart_id = null;
      const { data: cartData } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", session_id)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .maybeSingle();
      cart_id = cartData?.cart_id ?? null;
      if (!cart_id) {
        // Fallback to local storage if no DB cart
        try {
          const localRaw = sid
            ? localStorage.getItem(`cartItems:${sid}`)
            : localStorage.getItem("cartItems");
          const local = JSON.parse(localRaw || "[]");
          if (Array.isArray(local) && local.length > 0) {
            const ids = Array.from(new Set(local.map((x: any) => x.menuitem_id))).filter(Boolean);
            if (ids.length > 0) {
              const { data: itemsData } = await supabase
                .from("menuitem")
                .select("menuitem_id, name, price, thumbnail, description")
                .in("menuitem_id", ids);
              const index = new Map((itemsData || []).map((m: any) => [m.menuitem_id, m]));
              const normalized = local.map((li: any, idx: number) => {
                const mi = index.get(li.menuitem_id) || {};
                const quantity = Math.max(1, Number(li.quantity || 0));
                const price = Number(mi.price || 0);
                return {
                  cartitem_id: Date.now() + idx,
                  quantity,
                  subtotal_price: price * quantity,
                  menuitem_id: li.menuitem_id,
                  note: li.note ?? null,
                  menuitem: {
                    name: mi.name || "Unknown Item",
                    price,
                    thumbnail: mi.thumbnail || null,
                  },
                } as CartItem;
              });
              setCart(normalized);
              return;
            }
          }
        } catch {}
        setCart([]);
        return;
      }

      const { data, error } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, note, menuitem:menuitem_id (name, price, thumbnail, description)"
        )
        .eq("cart_id", cart_id);

      if (error) {
        setCart([]);
        return;
      }

      const normalized = (data || []).map((item) => ({
        ...item,
        menuitem: Array.isArray(item.menuitem)
          ? item.menuitem[0]
          : item.menuitem,
      }));

      setCart(normalized);
      try {
        const simplified = normalized.map((i) => ({
          menuitem_id: i.menuitem_id,
          quantity: i.quantity || 0,
          ...(i.note ? { note: i.note } : {}),
        }));
        if (sid) {
          localStorage.setItem(`cartItems:${sid}`, JSON.stringify(simplified));
        } else {
          localStorage.setItem("cartItems", JSON.stringify(simplified));
        }
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } catch {}
    };
    fetchCart();
    // End fetchCart and useEffect
  }, [sessionId]);

  const updateQty = async (cartitem_id: number, delta: number) => {
    // Local-only update; server sync at checkout
    const idx = cart.findIndex((i) => i.cartitem_id === cartitem_id);
    if (idx === -1) return;
    const item = cart[idx];
    const newQty = Math.max(1, item.quantity + delta);
    const price = item.menuitem?.price || 0;
    const updated: CartItem = { ...item, quantity: newQty, subtotal_price: price * newQty } as CartItem;
    const next = [...cart];
    next[idx] = updated;
    setCart(next);
    try {
      const sid =
        sessionId ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("sessionId") ||
            sessionStorage.getItem("session_id") ||
            undefined
          : undefined);
      const simplified = next.map((i) => ({ menuitem_id: i.menuitem_id, quantity: i.quantity, ...(i.note ? { note: i.note } : {}) }));
      if (sid) {
        localStorage.setItem(`cartItems:${sid}`, JSON.stringify(simplified));
      } else {
        localStorage.setItem("cartItems", JSON.stringify(simplified));
      }
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch {}
  };

  const removeItem = async (cartitem_id: number) => {
    // Delete from DB first, then sync local state
    try {
      const supabase = createClient();
      await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);
      const next = cart.filter((i) => i.cartitem_id !== cartitem_id);
      setCart(next);
      try {
        const sid =
          sessionId ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem("sessionId") ||
              sessionStorage.getItem("session_id") ||
              undefined
            : undefined);
        const simplified = next.map((i) => ({ menuitem_id: i.menuitem_id, quantity: i.quantity, ...(i.note ? { note: i.note } : {}) }));
        if (sid) {
          localStorage.setItem(`cartItems:${sid}`, JSON.stringify(simplified));
        } else {
          localStorage.setItem("cartItems", JSON.stringify(simplified));
        }
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } catch {}
    } catch {}
  };

  // Deprecated local-only deletion (kept for reference, not used)
  // const deleteCartItem = (itemId: string) => {
  //   const updatedCart = cart.filter((item) => item.id !== itemId);
  //   setCart(updatedCart);
  //   localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  // };

  const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col">
      <DashboardHeader mode="customer" tableId={tableId} />
      <div className="flex-1 px-6 pb-32 pt-2 w-full max-w-md mx-auto">
        <h2 className="font-bold text-black text-2xl mb-2 mt-2">Cart</h2>
        <hr className="mb-6 border-black/30" />

        {/* Show message if cart is empty */}
        {cart.length === 0 ? (
          <p className="text-center text-gray-600 py-2 text-sm">
            No items in the cart.
          </p>
        ) : (
          <div className="mb-4">
            {cart.map((i) => (
              <div
                key={i.cartitem_id}
                className="flex items-center justify-between mb-4 bg-white rounded-xl shadow p-3"
              >
                <Image
                  src={i.menuitem?.thumbnail || "/default-food.png"}
                  alt={i.menuitem?.name || "Unknown Item"}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-lg mr-3 flex-shrink-0"
                />

                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-bold text-black text-base break-words leading-snug">
                    {i.menuitem?.name || "Unknown Item"}
                  </div>
                  <div className="text-black text-xs">
                    ₱{i.subtotal_price}.00
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="text-lg font-bold text-black px-1"
                    onClick={() => updateQty(i.cartitem_id, -1)}
                  >
                    -
                  </button>
                  <span className="bg-gray-200 rounded w-10 h-8 flex items-center justify-center font-bold text-black text-lg">
                    {i.quantity}
                  </span>
                  <button
                    className="text-lg font-bold text-black px-1"
                    onClick={() => updateQty(i.cartitem_id, 1)}
                  >
                    +
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors duration-150"
                    onClick={() => {
                      setSelectedCartItem(i.cartitem_id);
                      setShowConfirmModal(true);
                    }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-6 max-w-md mx-auto">
        <hr className="my-2 border-black" />
        <div className="font-bold text-black text-right mb-[50px] text-xl">
          Total: ₱{total}.00
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#393939] border-t h-20">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-12">
          <button
            onClick={() => router.back()}
            className="bg-red-400 hover:bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
          >
            <BackIcon />
          </button>

          {/* Disable check button when cart is empty */}
          <button
            disabled={cart.length === 0}
            className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg ${
              cart.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-400 hover:bg-green-500 text-white"
            }`}
            onClick={() => {
              if (cart.length > 0) setShowPaymentModal(true);
            }}
          >
            <CheckIcon />
          </button>
        </div>
      </div>
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 w-45 max-w-xs flex flex-col items-center shadow-xl relative">
            <button
              className="absolute top-1 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="font-bold text-black text-lg mb-4 text-center w-full">
              Choose Payment Method
            </h3>
            <button
              className="hover:bg-gray-500 transition-colors w-full px-1 py-2 flex items-center justify-center border-none"
              style={{
                background: "#F2F2F2",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
              onClick={async () => {
                setShowPaymentModal(false);
                if (tableId) {
                  try {
                    console.log("Cart data before sending:", cart);
                    console.log("Session ID:", sessionId);
                    console.log("Table ID:", tableId);

                    // Transform cart items to use menu_item_id for backend
                    const menu_items = cart.map(
                      ({ menuitem_id, quantity, subtotal_price, note }) => ({
                        menu_item_id: menuitem_id,
                        quantity,
                        subtotal_price,
                        note: note ?? null,
                      })
                    );

                    // Create the order
                    const orderData = {
                      session_id: sessionId,
                      table_number: tableId,
                      menu_items,
                      payment_method: "gcash",
                      total_price: cart.reduce(
                        (sum, item) => sum + item.subtotal_price,
                        0
                      ),
                    };

                    console.log("Order data being sent:", orderData);

                    const response = await fetch("/api/orders", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(orderData),
                    });

                    console.log("Response status:", response.status);

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error("Response error:", errorText);
                      throw new Error(`Failed to create order: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log("Order creation result:", result);

                    // Store order creation timestamp for countdown timer
                    if (result.order?.order_id && result.orderCreatedAt) {
                      const key = `orderCancelStart:${result.order.order_id}`;
                      try {
                        localStorage.setItem(key, String(result.orderCreatedAt));
                      } catch {}
                    }

                    // Clear local cart then navigate to confirmation page
                    clearLocalCart();
                    const gcashPath = sessionId
                      ? `/customer/${tableId}/session/${sessionId}/gcash-order-confirmation`
                      : `/customer/${tableId}/gcash-order-confirmation`;
                    router.push(gcashPath);
                  } catch (error) {
                    console.error("Error creating order:", error);
                    alert("Failed to create order. Please try again.");
                  }
                } else {
                  alert("No table assigned. Please scan your table QR code.");
                }
              }}
            >
              <Image
                src="/gcash-button.png"
                alt="GCash"
                height={26}
                width={110}
              />
            </button>
            <div className="mb-3" />
            <button
              className="hover:bg-gray-500 transition-colors w-full px-1 py-2 mb-3 flex items-center justify-center border-none"
              style={{
                background: "#F2F2F2",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
              onClick={async () => {
                setShowPaymentModal(false);
                if (tableId) {
                  try {
                    console.log("Cart data before sending:", cart);
                    console.log("Session ID:", sessionId);
                    console.log("Table ID:", tableId);

                    // Transform cart items to use menu_item_id for backend
                    const menu_items = cart.map(
                      ({ menuitem_id, quantity, subtotal_price, note }) => ({
                        menu_item_id: menuitem_id,
                        quantity,
                        subtotal_price,
                        note: note ?? null,
                      })
                    );

                    // Create the order
                    const orderData = {
                      session_id: sessionId,
                      table_number: tableId,
                      menu_items,
                      payment_method: "cash-card",
                      total_price: cart.reduce(
                        (sum, item) => sum + item.subtotal_price,
                        0
                      ),
                    };

                    console.log("Order data being sent:", orderData);

                    const response = await fetch("/api/orders", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(orderData),
                    });

                    console.log("Response status:", response.status);

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error("Response error:", errorText);
                      throw new Error(`Failed to create order: ${errorText}`);
                    }

                    const result = await response.json();
                    console.log("Order creation result:", result);

                    // Store order creation timestamp for countdown timer
                    if (result.order?.order_id && result.orderCreatedAt) {
                      const key = `orderCancelStart:${result.order.order_id}`;
                      try {
                        localStorage.setItem(key, String(result.orderCreatedAt));
                      } catch {}
                    }

                    // Clear local cart then navigate to confirmation page
                    clearLocalCart();
                    const cashCardPath = sessionId
                      ? `/customer/${tableId}/session/${sessionId}/cash-card-order-confirmation`
                      : `/customer/${tableId}/cash-card-order-confirmation`;
                    router.push(cashCardPath);
                  } catch (error) {
                    console.error("Error creating order:", error);
                    alert("Failed to create order. Please try again.");
                  }
                } else {
                  alert("No table assigned. Please scan your table QR code.");
                }
              }}
            >
              <span className="font-bold text-black text-2xl ">Cash/Card</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] md:max-w-[350px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Remove this item from cart?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="border-transparent font-semibold hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                onClick={() => {
                  if (selectedCartItem !== null) removeItem(selectedCartItem);
                  setShowConfirmModal(false);
                }}
                className="border-transparent font-semibold hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
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
