"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from 'uuid';

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

  const addToCart = async () => {
    const supabase = createClient();
    // Get or create session_id for this browser session
    let session_id = sessionStorage.getItem('session_id');
    if (!session_id) {
      session_id = uuidv4();
      sessionStorage.setItem('session_id', session_id);
    }
    // Find or create open cart for this session
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
      // No open cart, create one
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
    // Check for existing cartitem with same menuitem_id and cart_id
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
      // Merge: update quantity and subtotal_price
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
      // Insert new cartitem
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
        className="bg-white w-full h-full max-w-md mx-auto rounded-none md:rounded-lg md:h-auto md:p-8 p-0 relative flex flex-col"
        style={{ maxHeight: "100vh" }}
      >
        <button
          className="absolute top-4 left-4 text-orange-400 text-2xl z-10"
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: "50%",
            padding: "6px",
          }}
        >
          ←
        </button>
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-48 object-cover rounded-b-none md:rounded-lg mb-0"
        />
        <div className="flex-1 flex flex-col px-6 pt-4 pb-6">
          <div className="font-bold text-black text-xl mb-1">{item.name}</div>
          <div className="text-black mb-2 text-lg">
            ₱{item.price}.00 <span className="text-xs">Base price</span>
          </div>
          <hr className="my-3 border-black/30" />
          <label className="block text-black font-bold text-base mb-1">
            Note to restaurant{" "}
            <span className="text-gray-400 text-xs">Optional</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-xl p-3 mb-5 text-base bg-[#f7f7f7]"
            placeholder="Add your request (subject to restaurant’s discretion)"
          />
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              className="bg-green-300 rounded-full w-10 h-10 text-2xl"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="font-bold text-black text-2xl">{qty}</span>
            <button
              className="bg-green-400 rounded-full w-10 h-10 text-2xl"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <button
            className="w-full bg-orange-400 text-white py-4 rounded-xl font-bold text-lg mt-auto"
            onClick={addToCart}
          >
            Add to Cart - ₱{item.price * qty}.00
          </button>
        </div>
      </div>
    </div>
  );
}
