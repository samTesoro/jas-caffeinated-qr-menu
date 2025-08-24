"use client";
<<<<<<< HEAD
import React, { useState } from "react";
import MenuTabs from "./menu-tabs";
import CustomerTaskbar from "./taskbar";
import MenuList from "./menu-list";
import Cart from "./cart";
import ConfirmModal from "./confirm-modal";

export default function CustomerMenu({ tableId }: { tableId: string }) {
  const [activeTab, setActiveTab] = useState<
    "Meals" | "Coffee" | "Drinks" | "Favorites"
  >("Meals");
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
=======
import React, { useState } from 'react';
import MenuTabs from './menu-tabs';
import CustomerTaskbar from './taskbar';
import MenuList from './menu-list';
import Cart from './cart';
import ConfirmModal from './confirm-modal';

export default function CustomerMenu({ tableId }: { tableId: string }) {
  const [activeTab, setActiveTab] = useState<'Meals'|'Coffee'|'Drinks'|'Favorites'>('Meals');
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as 'Meals'|'Coffee'|'Drinks'|'Favorites';
      if (tab && tab !== activeTab) setActiveTab(tab);
    }
  }, [typeof window !== 'undefined' && window.location.search]);
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      {/* Dashboard-style header */}
<<<<<<< HEAD
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
=======
      <div className="relative w-full" style={{ height: '170px' }}>
        <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53]" />
        <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb]" />
        <div className="absolute top-4 right-6 text-black text-xs font-normal">Table: {tableId}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-caffeinated.png" alt="Logo" width={200} height={75} style={{objectFit:'contain'}} />
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
        </div>
      </div>
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuTabs activeTab={activeTab} setActiveTab={setActiveTab} />
<<<<<<< HEAD
        <MenuList
          activeTab={activeTab}
          cart={cart}
          setCart={setCart as (cart: any[]) => void}
        />
        {showConfirm && <ConfirmModal onClose={() => setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
      <CustomerTaskbar />
=======
        <MenuList activeTab={activeTab} cart={cart} setCart={setCart as (cart: any[]) => void} />
        {showConfirm && <ConfirmModal onClose={()=>setShowConfirm(false)} />}
      </div>
      {/* Dashboard-style taskbar */}
  <CustomerTaskbar />
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
    </div>
  );
}
