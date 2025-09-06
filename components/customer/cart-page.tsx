"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/header";

import { createClient } from "@/lib/supabase/client";

interface CartPageProps {
  tableId?: string | string[];
}

export default function CartPage({ tableId }: CartPageProps = {}) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const supabase = createClient();
      // 1. Get customer_id for this table
      let customer_id: number | null = null;
      if (tableId) {
        const { data: customerData, error: customerError } = await supabase
          .from("customer")
          .select("customer_id")
          .eq("table_num", Number(tableId))
          .single();
        if (customerError || !customerData) {
          setCart([]);
          setLoading(false);
          return;
        }
        customer_id = customerData.customer_id;
      }
      if (!customer_id) {
        setCart([]);
        setLoading(false);
        return;
      }
      // 2. Find or create open cart for this customer
      let cart_id: number | null = null;
      const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("customer_id", customer_id)
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
        // No open cart, create one
        const { data: newCart, error: newCartError } = await supabase
          .from("cart")
          .insert({ customer_id, total_price: 0 })
          .select("cart_id")
          .single();
        if (newCartError || !newCart) {
          setCart([]);
          setLoading(false);
          return;
        }
        cart_id = newCart.cart_id;
      }
      // 3. Fetch cart items for this cart
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
  }, [tableId]);

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
    // Refetch cart and items from Supabase
    if (tableId) {
      // Re-run fetchCart logic
      setLoading(true);
      const { data: customerData } = await supabase
        .from("customer")
        .select("customer_id")
        .eq("table_num", Number(tableId))
        .single();
      if (!customerData) return;
      const customer_id = customerData.customer_id;
      const { data: cartData } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("customer_id", customer_id)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .maybeSingle();
      if (!cartData) return;
      const cart_id = cartData.cart_id;
      // Update total_price in cart table
      const { data: items } = await supabase
        .from("cartitem")
        .select("subtotal_price")
        .eq("cart_id", cart_id);
      const newTotal = (items || []).reduce((sum, i) => sum + (i.subtotal_price || 0), 0);
      await supabase
        .from("cart")
        .update({ total_price: newTotal })
        .eq("cart_id", cart_id);
      // Refetch cart items
      const { data: newCartItems } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);
      setCart(newCartItems || []);
      setLoading(false);
    }
  };

  const removeItem = async (cartitem_id: number) => {
    const supabase = createClient();
    await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);
    // Refetch cart and items from Supabase
    if (tableId) {
      setLoading(true);
      const { data: customerData } = await supabase
        .from("customer")
        .select("customer_id")
        .eq("table_num", Number(tableId))
        .single();
      if (!customerData) return;
      const customer_id = customerData.customer_id;
      const { data: cartData } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("customer_id", customer_id)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .maybeSingle();
      if (!cartData) return;
      const cart_id = cartData.cart_id;
      // Update total_price in cart table
      const { data: items } = await supabase
        .from("cartitem")
        .select("subtotal_price")
        .eq("cart_id", cart_id);
      const newTotal = (items || []).reduce((sum, i) => sum + (i.subtotal_price || 0), 0);
      await supabase
        .from("cart")
        .update({ total_price: newTotal })
        .eq("cart_id", cart_id);
      // Refetch cart items
      const { data: newCartItems } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);
      setCart(newCartItems || []);
      setLoading(false);
    }
  };
  const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col">
      <DashboardHeader mode="customer" />

      <div className="flex-1 px-6 pb-8 pt-2 w-full max-w-md mx-auto">
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
        <hr className="my-6 border-black/30" />
        <div className="font-bold text-black text-right mb-6 text-xl">
          Total: ₱{total}.00
        </div>
        <div className="flex justify-center gap-7 mb-8">
          <button
            className="bg-red-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl"
            onClick={() => router.back()}
          >
            ←
          </button>
          <button className="bg-green-300 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl">
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}
