"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/ui/header";
import { v4 as uuidv4 } from "uuid";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const BackIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className="w-8 h-8"
    >
      <path
        fillRule="evenodd"
        d="M19 12a1 1 0 0 1-1 1H8.414l3.293 3.293a1 1 0 1 1-1.414 
           1.414l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 0 1 
           1.414 1.414L8.414 11H18a1 1 0 0 1 1 1z"
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

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const supabase = createClient();
      let session_id = sessionStorage.getItem("session_id");
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
        setLoading(false);
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
          setLoading(false);
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
        setLoading(false);
        return;
      }

      setCart(data || []);
      setLoading(false);
    };
    fetchCart();
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

    let session_id = sessionStorage.getItem("session_id");
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

    setCart(newCartItems || []);
    setLoading(false);
  };

  const removeItem = async (cartitem_id: number) => {
    const supabase = createClient();
    await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);

    let session_id = sessionStorage.getItem("session_id");
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

    setCart(newCartItems || []);
    setLoading(false);
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
              <img
                src={i.menuitem?.thumbnail || "/default-food.png"}
                alt={i.menuitem?.name || "Unknown Item"}
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

          <button className="bg-green-400 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
            <CheckIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
