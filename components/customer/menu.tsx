"use client";
import React, { useState } from "react";
import MenuTaskbar from "./taskbar-customer";
import MenuList from "./menu-list";
import Cart from "./cart";
import ConfirmModal from "./confirm-modal";

interface CustomerMenuProps {
  tableId: string;
  customerId?: number | null;
  initialTab?: "Meals" | "Coffee" | "Drinks" | "Favorites";
}

export default function CustomerMenu({ tableId, customerId, initialTab = "Meals" }: CustomerMenuProps) {
  const [activeTab, setActiveTab] = useState<
    "Meals" | "Coffee" | "Drinks" | "Favorites"
  >(initialTab);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as
        | "Meals"
        | "Coffee"
        | "Drinks"
        | "Favorites";
      if (tab && tab !== activeTab) setActiveTab(tab);
    }
  }, [typeof window !== "undefined" && window.location.search]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
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
          customerId={customerId}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
      <MenuTaskbar />
    </div>
  );
}
