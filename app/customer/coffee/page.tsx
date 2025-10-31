"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Taskbar from "@/components/customer/taskbar-customer";
import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  menuitem_id: number | string;
  name: string;
  price: number;
  thumbnail?: string | null;
  [k: string]: unknown;
};

export default function CoffeePage() {
  const [coffees, setCoffees] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function fetchCoffees() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("menuitem")
        .select("*")
        .eq("category", "Coffee")
        .eq("status", "Available");

      if (error) console.error("Error fetching coffees:", error);
      else setCoffees(data || []);
    }
    fetchCoffees();
  }, []);

  const addToCart = async (item: MenuItem) => {
    try {
      const sid =
        typeof window !== "undefined"
          ? sessionStorage.getItem("sessionId") ||
            sessionStorage.getItem("session_id") ||
            undefined
          : undefined;
      const key = sid ? `cartItems:${sid}` : "cartItems";
      const supabase = createClient();
      const id = (item as any).menuitem_id ?? (item as any).id ?? item.menuitem_id;

      if (!sid) throw new Error("No session ID found");

      // Ensure or create open cart
      let cart_id: number | null = null;
      {
        const { data: cartData } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("session_id", sid)
          .eq("checked_out", false)
          .order("time_created", { ascending: false })
          .maybeSingle();
        if (cartData?.cart_id) cart_id = cartData.cart_id;
        else {
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

      // Upsert cart item (no note)
      let existingItem: { cartitem_id: number; quantity: number } | null = null;
      {
        const { data } = await supabase
          .from("cartitem")
          .select("cartitem_id, quantity")
          .eq("cart_id", cart_id)
          .eq("menuitem_id", id)
          .is("note", null)
          .maybeSingle();
        if (data?.cartitem_id) existingItem = data as any;
      }
      if (existingItem) {
        const newQty = Math.max(1, Number(existingItem.quantity || 0) + 1);
        const price = Number(item.price || 0);
        await supabase
          .from("cartitem")
          .update({ quantity: newQty, subtotal_price: price * newQty })
          .eq("cartitem_id", existingItem.cartitem_id);
      } else {
        await supabase.from("cartitem").insert({
          cart_id,
          menuitem_id: id,
          quantity: 1,
          subtotal_price: Number(item.price || 0) * 1,
          note: null,
        });
      }

      // Update local badge store
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const list = Array.isArray(existing) ? existing : [];
        let found = false;
        const next = list.map((ci: any) => {
          if (ci.menuitem_id === id && (ci.note ?? null) === null) {
            found = true;
            return { ...ci, quantity: Math.max(1, Number(ci.quantity || 0) + 1) };
          }
          return ci;
        });
        if (!found) next.push({ menuitem_id: id, quantity: 1, note: null });
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } catch {}
    } catch {
      // best-effort UI signal
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] pb-24">
      <div className="grid grid-cols-2 gap-4 p-4">
        {coffees.map((meal) => (
          <div
            key={meal.menuitem_id}
            className="bg-white rounded-lg shadow p-3 flex flex-col items-center"
          >
            {meal.thumbnail ? (
              <Image
                src={meal.thumbnail}
                alt={meal.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-[150px] h-[150px] bg-gray-200 rounded-lg" />
            )}
            <h3 className="font-semibold mt-2">{meal.name}</h3>
            <p className="text-gray-700">₱{meal.price}</p>
            <button
              onClick={() => addToCart(meal)}
              className="bg-orange-500 text-white px-4 py-1 rounded mt-2"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <Taskbar />
    </div>
  );
}
