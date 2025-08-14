"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Heroicons SVGs for edit and delete
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#22c55e" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303ZM19 7l-2-2" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  description?: string;
}

export default function MenuItemList({ onEdit, refresh, setRefresh }: { onEdit: (item: MenuItem | null) => void; refresh: boolean; setRefresh: (r: boolean) => void; }) {
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('menu_items')
      .select('*')
      .then(({ data }) => {
        setItems(data || []);
        // Extract unique categories
        if (data) {
          const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean)));
          // Add 'Available' and 'Unavailable' as special filter options
          setCategories(["Available", "Unavailable", ...uniqueCategories]);
        }
      });
  }, [refresh]);

  const handleDelete = async (id: number) => {
    const supabase = createClient();
    await supabase.from('menu_items').delete().eq('id', id);
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

  // Ensure price is always a float for display
  const displayPrice = (price: number) => {
    return price.toFixed(2);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <div>
        <input type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[350] h-[45] px-4 py-2 rounded-3xl border-white bg-white text-sm"
        />
        </div>
        <div className="flex items-center gap-14">
  <select
    value={category}
    onChange={e => setCategory(e.target.value)}
    className="w-full text-center py-1 px-2 border-2 border-black bg-white text-black text-xs h-7"
  >
    <option value="All">Select category</option>
    {categories.map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>

  <Link href="/dashboard/menu/add">
    <Button type="submit" variant="green" className="w-50">
      Add New Item
    </Button>
  </Link>
</div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative bg-gray-100 rounded-xl shadow p-3 flex flex-col h-full">
            <button
              className="absolute top-3 right-3 z-10 text-red-500 bg-white rounded-full p-2 shadow hover:bg-red-100 transition"
              title="Delete"
              onClick={() => handleDelete(item.id)}
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
                  onClick={() => onEdit(item)}
                >
                  <EditIcon />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal for full image and details */}
      {modalItem && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${modalItem ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          style={{ background: modalItem ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)' }}
          aria-hidden={!modalItem}
        >
          <div className={`bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative transform transition-all duration-300 ${modalItem ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            style={{ pointerEvents: modalItem ? 'auto' : 'none' }}
          >
            <button
              className="absolute top-2 right-2 z-10 text-red-500 bg-white rounded-full p-2 shadow hover:bg-red-100 transition"
              title="Close"
              onClick={() => setModalItem(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={modalItem.thumbnail || '/default-food.png'}
              alt={modalItem.name}
              width={600}
              height={288}
              className="w-full h-72 object-contain rounded mb-4 transition-all duration-300"
            />
            <div className="font-bold text-2xl mb-2">{modalItem.name}</div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Description</span><br />
              {modalItem.description || <span className="italic text-gray-400">No description</span>}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className={
                modalItem.status === 'Available'
                  ? 'inline-block px-2 py-0.5 text-xs rounded bg-green-200 text-green-800'
                  : 'inline-block px-2 py-0.5 text-xs rounded bg-red-200 text-red-800'
              }>
                {modalItem.status}
              </span>
              <span className="text-lg font-semibold text-gray-800">₱{displayPrice(modalItem.price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ...existing code up to the end of the main return block...