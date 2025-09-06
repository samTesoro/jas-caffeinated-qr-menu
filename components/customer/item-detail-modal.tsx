"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export default function ItemDetailModal({
  item,
  onClose,
  cart,
  setCart,
}: {
  item: any;
  onClose: () => void;
  cart: any[];
  setCart: (cart: any[]) => void;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const BackIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="white"
      className="w-7 h-7"
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

  const addToCart = async () => {
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
      alert("Failed to fetch cart: " + JSON.stringify(cartError));
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
        alert("Failed to create cart: " + JSON.stringify(newCartError));
        return;
      }
      cart_id = newCart.cart_id;
    }
    const { data: existingItems, error: fetchError } = await supabase
      .from("cartitem")
      .select("*")
      .eq("cart_id", cart_id)
      .eq("menuitem_id", item.menuitem_id);
    if (fetchError) {
      alert("Supabase fetch error: " + JSON.stringify(fetchError));
      return;
    }
    if (existingItems && existingItems.length > 0) {
      const existing = existingItems[0];
      const newQty = existing.quantity + qty;
      const newSubtotal = item.price * newQty;
      const { error: updateError } = await supabase
        .from("cartitem")
        .update({ quantity: newQty, subtotal_price: newSubtotal })
        .eq("cartitem_id", existing.cartitem_id);
      if (updateError) {
        alert("Supabase update error: " + JSON.stringify(updateError));
        return;
      }
      setCart(
        cart.map((i) =>
          i.menuitem_id === item.menuitem_id
            ? { ...i, quantity: newQty, subtotal_price: newSubtotal }
            : i
        )
      );
    } else {
      const cartItem = {
        quantity: qty,
        subtotal_price: item.price * qty,
        menuitem_id: item.menuitem_id,
        cart_id: cart_id,
      };
      const { error: itemError } = await supabase
        .from("cartitem")
        .insert([cartItem]);
      if (itemError) {
        alert("Supabase insert error: " + JSON.stringify(itemError));
        console.error("Supabase insert error:", itemError);
      }
      setCart([...cart, cartItem]);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-30 flex items-center justify-center">
      <div
        className="bg-white w-full h-full max-w-md mx-auto rounded-none md:rounded-lg md:h-auto md:p-8 p-0 relative flex flex-col md:mb-[100px]"
        style={{ maxHeight: "100vh md:max-h-[85vh]" }}
      >
        <button
          className="absolute top-4 left-4 z-10 flex items-center justify-center rounded-full w-10 h-10"
          onClick={onClose}
          style={{ backgroundColor: "#F87171" }}
        >
          <BackIcon />
        </button>

        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-[280px] md:h-[200px] object-cover rounded-b-none md:rounded-sm mb-4"
        />

        <div className="flex-1 flex flex-col px-6 pt-4 pb-3 overflow-y-auto">
          {/* Name + Price */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-black text-xl">{item.name}</div>
            <div className="text-right">
              <div className="text-black text-lg font-semibold">
                ₱{item.price}.00
              </div>
              <span className="text-xs text-gray-500">Base price</span>
            </div>
          </div>

          <hr className="my-5 border-black" />

          {/* Note */}
          <div className="flex items-center justify-between mb-3">
            <label className="block text-black font-bold text-lg">
              Note to restaurant
            </label>
            <span className="text-gray-400 text-xs">Optional</span>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-xl p-3 mb-5 text-md bg-[#f7f7f7] text-black resize-y h-[120px] overflow-y-auto"
            placeholder="Add your request (subject to restaurant’s discretion)"
          />

          {/* Quantity */}
          <div className="flex items-center justify-center gap-7 mb-6">
            <button
              className="bg-green-300 rounded-full w-8 h-8 text-2xl"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="font-bold text-black text-2xl">{qty}</span>
            <button
              className="bg-green-400 rounded-full w-8 h-8 text-2xl"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full bg-orange-400 text-white py-3 px-3 md:py-3 md:px-2 rounded-xl font-semibold text-lg mt-auto mb-[120px] sm:mb-0"
            onClick={addToCart}
          >
            Add to Cart - ₱{item.price * qty}.00
          </button>
        </div>
      </div>
    </div>
  );
}
