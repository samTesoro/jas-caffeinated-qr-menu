"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";

type CartItem = {
  cartitem_id?: number;
  quantity: number;
  subtotal_price: number;
  menuitem_id: number;
};
type MenuItem = {
  menuitem_id: number;
  name: string;
  price: number;
  thumbnail?: string | null;
  description?: string | null;
  status?: string | null;
};

export default function ItemDetailModal({
  item,
  onClose,
  cart,
  setCart,
  sessionId,
  tableId: _tableId,
}: {
  item: MenuItem;
  onClose: () => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  sessionId?: string;
  tableId?: string;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [fetchedDescription] = useState<string | null | undefined>(undefined);

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
    if (item.status && item.status !== "Available") return;
    // DB-backed add (ensure/create cart, upsert cartitem); keep quantity adjustments local-only on cart page
    try {
      const sid =
        sessionId ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem("sessionId") ||
            sessionStorage.getItem("session_id") ||
            undefined
          : undefined);
      const key = sid ? `cartItems:${sid}` : "cartItems";
      const supabase = createClient();
      const normalizedNote = note?.trim() ? note.trim() : null;

      if (!sid) throw new Error("No session ID found");

      // Ensure or create open cart
      let cart_id: number | null = null;
      {
        const { data: cartData, error: cartErr } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("session_id", sid)
          .eq("checked_out", false)
          .order("time_created", { ascending: false })
          .maybeSingle();
        if (!cartErr && cartData?.cart_id) {
          cart_id = cartData.cart_id;
        } else {
          const { data: newCart, error: newErr } = await supabase
            .from("cart")
            .insert({
              session_id: sid,
              total_price: 0,
              checked_out: false,
              time_created: new Date().toISOString(),
            })
            .select("cart_id")
            .single();
          if (newErr) throw newErr;
          cart_id = newCart?.cart_id ?? null;
        }
      }
      if (!cart_id) throw new Error("Failed to create or fetch cart");

      // Try to find existing cartitem for same menuitem_id + note
      let existingItem: { cartitem_id: number; quantity: number } | null = null;
      {
        const base = supabase
          .from("cartitem")
          .select("cartitem_id, quantity")
          .eq("cart_id", cart_id)
          .eq("menuitem_id", item.menuitem_id)
          .limit(1);
        const { data } = normalizedNote === null
          ? await base.is("note", null).maybeSingle()
          : await base.eq("note", normalizedNote).maybeSingle();
        if (data?.cartitem_id) existingItem = data as any;
      }

      if (existingItem) {
        const newQty = Math.max(1, Number(existingItem.quantity || 0) + qty);
        const newSubtotal = item.price * newQty;
        await supabase
          .from("cartitem")
          .update({ quantity: newQty, subtotal_price: newSubtotal })
          .eq("cartitem_id", existingItem.cartitem_id);
      } else {
        await supabase.from("cartitem").insert({
          cart_id,
          menuitem_id: item.menuitem_id,
          quantity: qty,
          subtotal_price: item.price * qty,
          note: normalizedNote,
        });
      }

      // Update session-scoped localStorage for badge and quick UI feedback
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const list = Array.isArray(existing) ? existing : [];
        let merged = false;
        const next = list.map((ci: any) => {
          if (ci.menuitem_id === item.menuitem_id && (ci.note ?? null) === normalizedNote) {
            merged = true;
            return { ...ci, quantity: Math.max(1, Number(ci.quantity || 0) + qty) };
          }
          return ci;
        });
        if (!merged) {
          next.push({ menuitem_id: item.menuitem_id, quantity: qty, note: normalizedNote });
        }
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } catch {}

      // Minimal in-memory state nudge
      setCart([
        ...cart,
        {
          menuitem_id: item.menuitem_id,
          quantity: qty,
          subtotal_price: item.price * qty,
        },
      ] as any);

      onClose();
    } catch (e) {
      console.error("Local cart error:", e);
      alert("Failed to add to cart. Please try again.");
    }
  };

  // Mount guard for portals
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalUI = (
    <div className="fixed inset-0 z-[10000] bg-white/50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[90vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl flex flex-col">
        <div className="relative w-full h-[250px] md:h-[300px]">
          <Image
            src={item.thumbnail || "/default-food.png"}
            alt={item.name}
            width={1200}
            height={400}
            className="w-full h-full object-cover"
          />

          <button
            className="absolute top-4 left-4 z-10 flex items-center justify-center rounded-full w-10 h-10 bg-red-400/90 hover:bg-red-500 transition"
            onClick={onClose}
          >
            <BackIcon />
          </button>

          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        <div className="flex-1 flex flex-col px-6 pt-6 pb-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="font-bold text-black text-xl">{item.name}</div>
              <div className="mt-1 text-gray-700 text-xs md:text-sm max-w-[60vw] md:max-w-xs">
                {fetchedDescription ? (
                  fetchedDescription
                ) : (
                  <span className="text-gray-400 italic">
                    No description available
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-black text-lg font-semibold">
                ₱{item.price}.00
              </div>
              <span className="text-xs text-gray-500">Base price</span>
            </div>
          </div>

          <hr className="my-5 border-black" />

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

          <div className="flex items-center justify-center gap-7 mb-6 mt-8">
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

          <button
            className={`w-full py-3 px-3 md:py-3 md:px-2 rounded-xl font-semibold text-lg mt-auto sm:mb-0 ${
              item.status && item.status !== "Available"
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-orange-400 text-white"
            }`}
            onClick={addToCart}
            disabled={!!(item.status && item.status !== "Available")}
            aria-disabled={!!(item.status && item.status !== "Available")}
          >
            {item.status && item.status !== "Available"
              ? "Unavailable"
              : `Add to Cart - ₱${item.price * qty}.00`}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalUI, document.body);
}
