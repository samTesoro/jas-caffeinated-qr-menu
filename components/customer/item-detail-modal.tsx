"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ItemDetailModalProps {
  item: any;
  onClose: () => void;
  cart: any[];
  setCart: (cart: any[]) => void;
  customerId?: number | null;
}

export default function ItemDetailModal({
  item,
  onClose,
  cart,
  setCart,
  customerId,
}: ItemDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const addToCart = async () => {
    const supabase = createClient();
    let cid = customerId;
    if (!cid) {
      alert("No customer ID found. Please refresh or scan the QR code again.");
      return;
    }
    // Always fetch or create open cart for this customer
    let cart_id: number | null = null;
    const { data: existingCart, error: cartFetchError } = await supabase
      .from("cart")
      .select("cart_id")
      .eq("customer_id", cid)
      .eq("checked_out", false)
      .maybeSingle();
    if (cartFetchError) {
      alert("Failed to fetch cart: " + JSON.stringify(cartFetchError));
      return;
    }
    if (existingCart && existingCart.cart_id) {
      cart_id = existingCart.cart_id;
    } else {
      // Create a new cart in Supabase for this customer
      const { data, error } = await supabase
        .from("cart")
        .insert([{ total_price: 0, time_created: new Date().toISOString(), customer_id: cid, checked_out: false }])
        .select("cart_id")
        .single();
      if (error || !data || !data.cart_id) {
        alert("Failed to create cart: " + JSON.stringify(error));
        return;
      }
      cart_id = data.cart_id;
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
        <div className="flex-1 flex flex-col px-6 pt-4 pb-6 overflow-y-auto" style={{ minHeight: 0 }}>
          <div className="font-bold text-black text-xl mb-1">{item.name}</div>
          <div className="text-black mb-2 text-lg">
            ₱{item.price}.00 <span className="text-xs">Base price</span>
          </div>
          {item.description && (
            <div className="text-black/70 mb-2 text-base">
              {item.description}
            </div>
          )}
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
        </div>
        <div className="flex justify-center p-4 bg-white sticky bottom-0 left-0 w-full z-10 mb-32 md:mb-0">
          <button
            className="w-11/12 max-w-xs bg-orange-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
            onClick={addToCart}
          >
            Add to Cart - ₱{item.price * qty}.00
          </button>
        </div>
      </div>
    </div>
  );
}
