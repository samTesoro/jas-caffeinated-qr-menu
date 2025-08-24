"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import ItemCard from "@/components/ui/menu-item-card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Trash2 as DeleteIcon, Pencil as EditIcon } from "lucide-react";

export interface MenuItem {
  menuitem_id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  description?: string;
}

export default function MenuItemList({
  onEdit,
  refresh,
}: // setRefresh,
{
  onEdit: (item: MenuItem | null) => void;
  refresh: boolean;
  setRefresh: (r: boolean) => void;
}) {
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('menuitem')
      .select('*')
      .then(({ data }) => {
        setItems(data || []);
        if (data) {
          const uniqueCategories = Array.from(
            new Set(data.map((item) => item.category).filter(Boolean))
          );
          setCategories(["Available", "Unavailable", ...uniqueCategories]);
        }
      });
  }, [refresh]);

  const handleDelete = async (id: number) => {
  const supabase = createClient();
  // First, delete all cartitems referencing this menuitem
  const { error: cartitemError } = await supabase.from('cartitem').delete().eq('menuitem_id', id);
  if (cartitemError) {
    alert('Failed to delete related cartitems: ' + (cartitemError.message || JSON.stringify(cartitemError)));
    console.error('Cartitem delete error:', cartitemError);
    return;
  }
  // Then, delete the menuitem itself
  const { error: menuitemError } = await supabase.from('menuitem').delete().eq('menuitem_id', id);
  if (menuitemError) {
    alert('Delete failed: ' + (menuitemError.message || JSON.stringify(menuitemError)));
    console.error('Delete error:', menuitemError);
    return;
  }
  setRefresh(!refresh);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;
    if (category === "Available" || category === "Unavailable") {
      matchesCategory = item.status === category;
    } else if (category !== "All") {
      matchesCategory = item.category === category;
    }
    return matchesSearch && matchesCategory;
  });

  const displayPrice = (price: number) => price.toFixed(2);

  return (
    <div>
      {/* Search + Category + Add button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <div className="relative w-[350px] mb-3">
          <Search className="absolute right-4 mx-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[45px] pl-8 pr-4 py-2 rounded-3xl border-white bg-white text-sm text-black"
          />
        </div>
        <div className="flex items-center gap-14">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-center py-1 px-2 border-2 border-black bg-white text-black text-xs h-7"
          >
            <option value="All">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <Link href="/dashboard/menu/add">
            <Button type="submit" variant="green" className="w-50 rounded-lg">
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu Item Grid */}
      <div className="grid grid-cols-2 gap-7 sm:gap-2">
        {filteredItems.map((item) => (
          <div key={String(item.menuitem_id)} className="relative bg-gray-100 rounded-xl shadow p-3 flex flex-col h-full">
            <button
              className="absolute top-3 right-3 z-10 text-red-500 bg-white rounded-full p-2 shadow hover:bg-red-100 transition"
              title="Delete"
              onClick={() => handleDelete(item.menuitem_id)}
            >
              <DeleteIcon />
            </button>
            <div className="flex flex-1 flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail || '/default-food.png'}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer"
                onClick={() => setModalItem(item)}
              />
              <div className="flex flex-row items-end gap-3 flex-1">
                <div className="bg-white rounded-lg p-4 flex-1 flex flex-col justify-between min-h-[90px]">
                  <div className="font-bold text-lg text-black mb-1">{item.name}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={
                      item.status === 'Available'
                        ? 'inline-block px-2 py-0.5 text-xs rounded bg-green-200 text-green-800'
                        : 'inline-block px-2 py-0.5 text-xs rounded bg-red-200 text-red-800'
                    }>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">₱{displayPrice(item.price)}</span>
                  </div>
                </div>
                <button
                  className="bg-[#b6f7b0] rounded-full p-3 flex items-center justify-center shadow hover:bg-green-200 transition ml-2"
                  title="Edit"
                  onClick={() => onEdit({ ...item })}
                >
                  <EditIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300"
          aria-hidden={!modalItem}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative transform transition-all duration-300">
            <button
              className="absolute top-2 right-2 z-10 text-red-500 bg-white rounded-full p-2 shadow hover:bg-red-100 transition"
              title="Close"
              onClick={() => setModalItem(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={modalItem.thumbnail || "/default-food.png"}
              alt={modalItem.name}
              width={600}
              height={288}
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="font-bold text-xl mb-2 mt-3 text-black">
              {modalItem.name}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Description</span>
              <br />
              {modalItem.description || (
                <span className="italic text-gray-400"></span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-black">
                ₱{displayPrice(modalItem.price)}
              </span>
              <span
                className={`px-2 text-md rounded-sm whitespace-nowrap ${
                  modalItem.status === "Available"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {modalItem.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
