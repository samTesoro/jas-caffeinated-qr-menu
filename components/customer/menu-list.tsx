"use client";
import React, { useState, useEffect } from "react";
import MenuItemCard from "../ui/menu-item-card";
import ItemDetailModal from "./item-detail-modal";
import { createClient } from "@/lib/supabase/client";

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
    <div className="px-4 pt-4 pb-24">
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[350px] h-[45px] px-4 py-2 rounded-3xl border-white bg-white text-black text-sm"
        />
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading items...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
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
