"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MenuTaskbar from "./taskbar-customer";
import MenuList from "./menu-list";
// Workaround: some TSX prop-resolution in this workspace causes the MenuList
// JSX element to be type-checked against the wrong props. Cast to a generic
// component type so we can pass the expected props without a compile error.
const MenuListAny = MenuList as unknown as React.ComponentType<any>;
import ConfirmModal from "./confirm-modal";
import DashboardHeader from "../ui/header";

type CustomerMenuProps = {
  tableId: string;
  sessionId: string;
  initialTab?: "All" | "Meals" | "Coffee" | "Drinks" | "Favorites" | "Desserts";
};

export default function CustomerMenu({
  tableId,
  sessionId,
  initialTab = "All",
}: CustomerMenuProps) {
  type MenuCartItem = {
    cartitem_id?: number;
    quantity: number;
    subtotal_price: number;
    menuitem_id: number;
    menuitem?: { name: string; price: number; thumbnail?: string } | null;
  };
  const [activeTab, setActiveTab] = useState<
    "All" | "Meals" | "Coffee" | "Drinks" | "Favorites" | "Desserts"
  >(initialTab);
  const [cart, setCart] = useState<MenuCartItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<
    "Meals" | "Coffee" | "Drinks" | "Desserts" | null
  >(null);
  const scrollToCategory = React.useCallback(
    (cat: "Meals" | "Coffee" | "Drinks" | "Desserts") => {
      if (typeof window === "undefined") return;
      const el = document.getElementById(`category-${cat}`);
      if (!el) return;
      // Account for sticky header height (compute sticky bar bottom if available)
      const sticky = document.getElementById("menu-sticky-bar");
      const headerOffset = sticky ? sticky.getBoundingClientRect().bottom : 170; // fallback aligns with sticky top
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset + rect.top - headerOffset;
      window.scrollTo({ top: Math.max(scrollTop, 0), behavior: "smooth" });
      setCurrentCategory(cat);
    },
    []
  );

  // Handle tab from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as
        | "All"
        | "Meals"
        | "Coffee"
        | "Drinks"
        | "Favorites"
        | "Desserts";
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

        let cart_id: number | undefined;
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
                console.warn(
                  "No existing cart found, will create new one if needed"
                );
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

        // Fetch cart items for this cart
        const { data: items } = await supabase
          .from("cartitem")
          .select(
            "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
          )
          .eq("cart_id", cart_id);
        setCart((items || []) as unknown as MenuCartItem[]);
      } catch (error) {
        console.error("Unexpected error in ensureCart:", error);
      }
    };
    ensureCart();
  }, [sessionId, tableId]);

  // If a category tab is indicated (via URL or initialTab), auto-scroll to that section
  useEffect(() => {
    if (activeTab && activeTab !== "All" && activeTab !== "Favorites") {
      const cat = activeTab as "Meals" | "Coffee" | "Drinks" | "Desserts";
      const t = setTimeout(() => scrollToCategory(cat), 50);
      return () => clearTimeout(t);
    }
  }, [activeTab, scrollToCategory]);

  // Track which category section is in view on scroll and highlight the corresponding icon
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cats = ["Meals", "Coffee", "Drinks", "Desserts"] as const;
    const getTargetOffset = () => {
      const sticky = document.getElementById("menu-sticky-bar");
      if (sticky) return sticky.getBoundingClientRect().bottom;
      return 170;
    };

    const getSections = () =>
      cats
        .map((c) => ({ c, el: document.getElementById(`category-${c}`) }))
        .filter(
          (x): x is { c: (typeof cats)[number]; el: HTMLElement } => !!x.el
        );

    const pickCurrent = () => {
      const sections = getSections();
      if (sections.length === 0) return;
      // Choose the section whose top is closest to the header offset
      const target = getTargetOffset();
      let best: { c: (typeof cats)[number]; delta: number } | null = null;
      for (const { c, el } of sections) {
        const rect = el.getBoundingClientRect();
        const delta = Math.abs(rect.top - target);
        if (!best || delta < best.delta) best = { c, delta };
      }
      if (best) setCurrentCategory(best.c);
    };

    const onScroll = () => {
      // Batch updates with rAF for smoothness
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(pickCurrent);
      } else {
        pickCurrent();
      }
    };

    // Attach listeners immediately; sections can appear later after data load
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Fire a few times post-mount to catch late-rendered sections
    pickCurrent();
    const t1 = setTimeout(pickCurrent, 100);
    const t2 = setTimeout(pickCurrent, 300);
    const t3 = setTimeout(pickCurrent, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader mode="customer" tableId={tableId} />
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuListAny
          activeTab={activeTab}
          cart={cart}
          setCart={setCart}
          sessionId={sessionId}
          tableId={tableId}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
      <MenuTaskbar
        tableId={tableId}
        sessionId={sessionId}
        currentCategory={currentCategory || undefined}
        onGoToMeals={() => scrollToCategory("Meals")}
        onGoToCoffee={() => scrollToCategory("Coffee")}
        onGoToDrinks={() => scrollToCategory("Drinks")}
        onGoToDesserts={() => scrollToCategory("Desserts")}
      />
    </div>
  );
}
