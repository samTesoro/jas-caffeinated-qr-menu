"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import DashboardHeader from "@/components/ui/header";

export default function CartPage({ tableId }: { tableId?: string }) {
  type CartItem = {
    cartitem_id: number;
    quantity: number;
    subtotal_price: number;
    menuitem_id: number;
    menuitem?: {
      name: string;
      price: number;
      thumbnail?: string;
    };
  };
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

    const BackIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
        <path fillRule="evenodd" d="M19 12a1 1 0 0 1-1 1H8.414l3.293 3.293a1 1 0 1 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z" clipRule="evenodd" />
      </svg>
    );
    const CheckIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );

    useEffect(() => {
      const fetchCart = async () => {
        const supabase = createClient();
        let session_id = sessionStorage.getItem("session_id") || undefined;
        if (!session_id) {
          session_id = uuidv4();
          sessionStorage.setItem("session_id", session_id);
        }

        let cart_id = null;
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("session_id", session_id)
          .eq("checked_out", false)
          .order("time_created", { ascending: false })
          .maybeSingle();

        if (cartError) {
          setCart([]);
          return;
        }

        if (cartData && cartData.cart_id) {
          cart_id = cartData.cart_id;
        } else {
          const { data: newCart, error: newCartError } = await supabase
            .from("cart")
            .insert({ session_id, total_price: 0, checked_out: false })
            .select("cart_id")
            .single();

          if (newCartError || !newCart) {
            setCart([]);
            return;
          }
          cart_id = newCart.cart_id;
        }

        const { data, error } = await supabase
          .from("cartitem")
          .select(
            "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
          )
          .eq("cart_id", cart_id);

        if (error) {
          setCart([]);
          return;
        }

        setCart(
          (data || []).map((item) => ({
            ...item,
            menuitem: Array.isArray(item.menuitem) ? item.menuitem[0] : item.menuitem,
          }))
        );
      };
      fetchCart();
  // End fetchCart and useEffect
  }, []);

    const updateQty = async (cartitem_id: number, delta: number) => {
      const supabase = createClient();
      const item = cart.find((i) => i.cartitem_id === cartitem_id);
      if (!item) return;

      const newQty = Math.max(1, item.quantity + delta);
      const newSubtotal = item.menuitem?.price ? item.menuitem.price * newQty : 0;

      await supabase
        .from("cartitem")
        .update({ quantity: newQty, subtotal_price: newSubtotal })
        .eq("cartitem_id", cartitem_id);

  const session_id = sessionStorage.getItem("session_id");
      if (!session_id) return;

      const { data: cartData } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", session_id)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .maybeSingle();

      if (!cartData) return;
      const cart_id = cartData.cart_id;

      const { data: items } = await supabase
        .from("cartitem")
        .select("subtotal_price")
        .eq("cart_id", cart_id);

      const newTotal = (items || []).reduce(
        (sum, i) => sum + (i.subtotal_price || 0),
        0
      );

      await supabase
        .from("cart")
        .update({ total_price: newTotal })
        .eq("cart_id", cart_id);

      const { data: newCartItems } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);

      setCart(
        (newCartItems || []).map((item) => ({
          ...item,
          menuitem: Array.isArray(item.menuitem) ? item.menuitem[0] : item.menuitem,
        }))
      );
    };

    const removeItem = async (cartitem_id: number) => {
      const supabase = createClient();
      await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);

  const session_id = sessionStorage.getItem("session_id");
      if (!session_id) return;

      const { data: cartData } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", session_id)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .maybeSingle();

      if (!cartData) return;
      const cart_id = cartData.cart_id;

      const { data: items } = await supabase
        .from("cartitem")
        .select("subtotal_price")
        .eq("cart_id", cart_id);

      const newTotal = (items || []).reduce(
        (sum, i) => sum + (i.subtotal_price || 0),
        0
      );

      await supabase
        .from("cart")
        .update({ total_price: newTotal })
        .eq("cart_id", cart_id);

      const { data: newCartItems } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);

      setCart(
        (newCartItems || []).map((item) => ({
          ...item,
          menuitem: Array.isArray(item.menuitem) ? item.menuitem[0] : item.menuitem,
        }))
      );
    };

    const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

    return (
      <div className="min-h-screen bg-[#ebebeb] flex flex-col">
        <DashboardHeader mode="customer" />
        <div className="flex-1 px-6 pb-32 pt-2 w-full max-w-md mx-auto">
          <h2 className="font-bold text-black text-2xl mb-2 mt-2">Cart</h2>
          <hr className="mb-6 border-black/30" />
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
                  className="w-16 h-16 object-cover rounded-lg mr-3"
                />
                <div>
                  <div className="font-bold text-black text-base">
                    {i.menuitem?.name || "Unknown Item"}
                  </div>
                  <div className="text-black text-xs">₱{i.subtotal_price}.00</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-gray-200 rounded w-8 h-8 text-lg"
                    onClick={() => updateQty(i.cartitem_id, -1)}
                  >
                    -
                  </button>
                  <span className="font-bold text-black text-lg">
                    {i.quantity}
                  </span>
                  <button
                    className="bg-gray-200 rounded w-8 h-8 text-lg"
                    onClick={() => updateQty(i.cartitem_id, 1)}
                  >
                    +
                  </button>
                  <button
                    className="bg-red-400 text-white rounded w-8 h-8 flex items-center justify-center ml-2"
                    onClick={() => removeItem(i.cartitem_id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="fixed bottom-20 left-0 right-0 px-6 max-w-md mx-auto">
            <hr className="my-2 border-black" />
            <div className="font-bold text-black text-right mb-[50px] text-xl">
              Total: ₱{total}.00
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-[#393939] border-t h-20">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-12">
            <button
              onClick={() => router.back()}
              className="bg-red-400 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
            >
              <BackIcon />
            </button>
            <button
              className="bg-green-400 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
              onClick={() => setShowPaymentModal(true)}
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
                className="w-full px-1 py-2 flex items-center justify-center border-none"
                style={{background: '#F2F2F2', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'}}
                  onClick={() => {
                    setShowPaymentModal(false);
                    if (tableId) {
                      router.push(`/customer/${tableId}/gcash-order-confirmation`);
                    } else {
                      alert("No table assigned. Please scan your table QR code.");
                    }
                  }}
              >
                <Image src="/gcash-button.png" alt="GCash" height={26} width={110} />
              </button>
              <div className="mb-3" />
              <button
                className="w-full px-1 py-2 mb-3 flex items-center justify-center border-none"
                style={{background: '#F2F2F2', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)'}}
                onClick={() => {
                  setShowPaymentModal(false);
                  if (tableId) {
                    router.push(`/customer/${tableId}/cash-card-order-confirmation`);
                  } else {
                    alert("No table assigned. Please scan your table QR code.");
                  }
                }}
              >
                <span className="font-bold text-black text-2xl">Cash/Card</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
