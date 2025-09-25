"use client";
import React, { useState, useEffect } from "react";
import MenuItemCard from "../ui/menu-item-card";
import ItemDetailModal from "./item-detail-modal";
import NotificationModal from "./notification-modal"; // ✅ import
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

interface MenuListProps {
  activeTab: string;
  cart: any[];
  setCart: (cart: any[]) => void;
  customerId?: number | null;
  sessionId?: string;
  tableId?: string;
}

export default function MenuList({
  activeTab,
  cart,
  setCart,
  customerId,
  sessionId,
  tableId,
}: MenuListProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false); //state for modal

  useEffect(() => {
    setLoading(true);
    setSearch("");
    setSelectedItem(null);
    const supabase = createClient();
    let query = supabase.from("menuitem").select("*");
    if (activeTab === "Favorites") {
      query = query.eq("is_favorites", true).eq("status", "Available");
    } else {
      query = query.eq("category", activeTab).eq("status", "Available");
    }
    query.then(({ data }) => {
      setMenuItems(data || []);
      setLoading(false);
    });
  }, [activeTab]); // Refetch and reset on tab change

  let filtered;
  if (search.trim() !== "") {
    filtered = menuItems.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    filtered = menuItems;
  }

  return (
    <div>
      {/* Search + Category */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div
            className="relative flex items-center justify-center cursor-pointer"
            style={{ width: "45px", height: "45px" }}
            onClick={() => setNotifOpen(true)} // ✅ open modal on click
          >
            <div
              className="bg-gray-300 rounded-full flex items-center justify-center"
              style={{ width: "45px", height: "45px" }}
            >
              <img
                src="/notifications-icon.png"
                alt="Notifications"
                width={25}
                height={25}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-[280px]">
            <Search className="absolute right-4 mx-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[45px] pl-8 pr-4 py-2 rounded-3xl border-white bg-white text-sm text-black"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading items...</div>
      ) : (
        <div className="grid grid-cols-2 gap-7 sm:gap-2 place-items-center mb-40">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.menuitem_id ? String(item.menuitem_id) : item.name}
              item={item}
              setModalItem={setSelectedItem}
              mode="customer"
              onAdd={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          cart={cart}
          setCart={setCart}
          sessionId={sessionId}
          tableId={tableId}
        />
      )}

      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
