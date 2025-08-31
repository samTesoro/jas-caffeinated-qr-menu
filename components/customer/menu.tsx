"use client";
import React, { useState, useEffect } from "react";
import MenuTabs from "./menu-tabs";
import MenuTaskbar from "./menu-taskbar";
import MenuList from "./menu-list";
import Cart from "./cart";
import ConfirmModal from "./confirm-modal";

function getTabFromUrl() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as
      | "Meals"
      | "Coffee"
      | "Drinks"
      | "Favorites";
    return tab || "Meals";
  }
  return "Meals";
}

export default function CustomerMenu({ tableId }: { tableId: string }) {
  const [activeTab, setActiveTab] = useState<
    "Meals" | "Coffee" | "Drinks" | "Favorites"
  >(getTabFromUrl());
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Always sync activeTab with URL changes
  useEffect(() => {
    const updateTabFromUrl = () => {
      setActiveTab(getTabFromUrl());
    };
    window.addEventListener("popstate", updateTabFromUrl);
    window.addEventListener("pushstate", updateTabFromUrl);
    window.addEventListener("replacestate", updateTabFromUrl);
    return () => {
      window.removeEventListener("popstate", updateTabFromUrl);
      window.removeEventListener("pushstate", updateTabFromUrl);
      window.removeEventListener("replacestate", updateTabFromUrl);
    };
  }, []);

  // When tab is changed via MenuTabs, update both state and URL
  const handleTabChange = (tab: "Meals" | "Coffee" | "Drinks" | "Favorites") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = tab === "Meals" ? "/customer" : `/customer?tab=${tab}`;
      window.history.pushState({}, "", url);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col relative" style={{paddingBottom:'160px'}}>
      {/* Dashboard-style header */}
      <div className="relative w-full" style={{ height: "170px" }}>
        <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53]" />
        <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb]" />
        <div className="absolute top-4 right-6 text-black text-xs font-normal">
          Table: {tableId}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo-caffeinated.png"
            alt="Logo"
            width={200}
            height={75}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuList
          activeTab={activeTab}
          cart={cart}
          setCart={setCart as (cart: any[]) => void}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
  {/* Unified menu-taskbar with tabs and cart button */}
  <MenuTaskbar activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}
