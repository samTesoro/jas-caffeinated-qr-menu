"use client";
import React, { useState, useEffect } from "react";
import MenuItemCard from "../ui/menu-item-card";
import ItemDetailModal from "./item-detail-modal";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

export default function MenuList({
  activeTab,
  cart,
  setCart,
}: {
  activeTab: string;
  cart: any[];
  setCart: (cart: any[]) => void;
}) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSearch("");
    setSelectedItem(null);
    const supabase = createClient();
    supabase
      .from("menuitem")
      .select("*")
      .then(({ data }) => {
        setMenuItems(data || []);
        setLoading(false);
      });
  }, [activeTab]); // Refetch and reset on tab change

  let filtered;
  if (search.trim() !== "") {
    filtered = menuItems.filter(
      (i) =>
        i.status === "Available" &&
        i.name.toLowerCase().includes(search.toLowerCase())
    );
  } else {
    filtered =
      activeTab === "Favorites"
        ? menuItems.filter((i) => i.is_favorites && i.status === "Available")
        : menuItems.filter(
            (i) => i.category === activeTab && i.status === "Available"
          );
  }

  return (
    <div>
      {/* Search + Category */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <div className="flex items-center gap-3">
          <div
            className="relative flex items-center justify-center"
            style={{ width: "45px", height: "45px" }}
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
        <div className="grid grid-cols-2 gap-7 sm:gap-2 place-items-center">
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
        />
      )}
    </div>
  );
}
