"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MenuTaskbar from "./taskbar-customer";
import MenuList from "./menu-list";
import Cart from "./cart";
import ConfirmModal from "./confirm-modal";
import DashboardHeader from "../ui/header";

type CustomerMenuProps = {
  tableId: string;
  initialTab?: "Meals" | "Coffee" | "Drinks" | "Favorites";
};

export default function CustomerMenu({
  tableId,
  initialTab = "Meals",
}: CustomerMenuProps) {
  const [activeTab, setActiveTab] = useState<
    "Meals" | "Coffee" | "Drinks" | "Favorites"
  >(initialTab);
  const [cart, setCart] = useState<any[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle tab from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as
        | "Meals"
        | "Coffee"
        | "Drinks"
        | "Favorites";
      if (tab && tab !== activeTab) setActiveTab(tab);
    }
  }, [activeTab]);

  // Ensure cart exists for this session/tableId
  useEffect(() => {
    const supabase = createClient();
    const ensureCart = async () => {
      const { data: existing, error } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", tableId)
        .eq("checked_out", false)
        .order("time_created", { ascending: false })
        .limit(1)
        .maybeSingle();
      let cart_id;
      if (existing && existing.cart_id) {
        cart_id = existing.cart_id;
      } else {
        const { data: created, error: createError } = await supabase
          .from("cart")
          .insert([
            {
              total_price: 0,
              session_id: tableId,
              time_created: new Date().toISOString(),
            },
          ])
          .select("cart_id")
          .single();
        if (createError || !created) {
          alert("Failed to create cart: " + JSON.stringify(createError));
          return;
        }
        cart_id = created.cart_id;
      }
      setCartId(cart_id);
      const { data: items, error: itemsError } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);
      setCart(items || []);
    };
    ensureCart();
  }, [tableId]);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader mode="customer" tableId={tableId} />
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuList
          activeTab={activeTab}
          cart={cart}
          setCart={setCart as (cart: any[]) => void}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
      <MenuTaskbar />
    </div>
  );
}
