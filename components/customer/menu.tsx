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
  sessionId: string;
  initialTab?: "Meals" | "Coffee" | "Drinks" | "Favorites";
};

export default function CustomerMenu({
  tableId,
  sessionId,
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

  // Ensure cart exists for this session/sessionId
  useEffect(() => {
    const supabase = createClient();
    const ensureCart = async () => {
      try {
        const { data: existing, error } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("session_id", sessionId)
          .eq("checked_out", false)
          .order("time_created", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching existing cart:", error);
          return;
        }
        
        let cart_id;
        if (existing && existing.cart_id) {
          cart_id = existing.cart_id;
        } else {
          // Try to create a new cart with proper error handling
          const { data: created, error: createError } = await supabase
            .from("cart")
            .insert([
              {
                total_price: 0,
                session_id: sessionId,
                table_number: tableId,
                time_created: new Date().toISOString(),
                checked_out: false,
              },
            ])
            .select("cart_id")
            .single();
            
          if (createError) {
            // If error is duplicate key (23505), another process created the cart
            if (createError.code === "23505") {
              // Retry fetching the cart that was created by another process
              const { data: retryCart, error: retryError } = await supabase
                .from("cart")
                .select("cart_id")
                .eq("session_id", sessionId)
                .eq("checked_out", false)
                .order("time_created", { ascending: false })
                .limit(1)
                .maybeSingle();
                
              if (retryError || !retryCart?.cart_id) {
                console.error("Error retrieving cart after retry:", retryError);
                return;
              }
              cart_id = retryCart.cart_id;
            } else {
              console.error("Error creating cart:", createError);
              return;
            }
          } else if (created && created.cart_id) {
            cart_id = created.cart_id;
          } else {
            console.error("No cart created and no error returned");
            return;
          }
        }
        
        setCartId(cart_id);
        
        // Fetch cart items for this cart
        const { data: items } = await supabase
          .from("cartitem")
          .select(
            "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
          )
          .eq("cart_id", cart_id);
        setCart(items || []);
      } catch (error) {
        console.error("Unexpected error in ensureCart:", error);
      }
    };
    ensureCart();
  }, [sessionId, tableId]);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader mode="customer" tableId={tableId} />
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuList
          activeTab={activeTab}
          cart={cart}
          setCart={setCart as (cart: any[]) => void}
          sessionId={sessionId}
          tableId={tableId}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
      <MenuTaskbar tableId={tableId} sessionId={sessionId} />
    </div>
  );
}
