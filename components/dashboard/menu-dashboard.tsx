// Minimal MenuItem type for local use
"use client";
type MenuItem = {
  id?: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  description?: string;
};

import { useState } from 'react';
import MenuItemForm from './menu-item-form';
import MenuItemList from './menu-item-list';

// import removed, not needed

export default function MenuDashboard() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100">
      {/* Menu List */}
      <div className="w-full md:w-1/2 p-4">
        <MenuItemList
          onEdit={(item) => setSelectedItem(item)}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>
      {/* Add/Edit Form */}
      <div className="w-full md:w-1/2 p-4 bg-white">
        <MenuItemForm
          item={selectedItem}
          onSaved={() => {
            setSelectedItem(null);
            setRefresh((r) => !r);
          }}
          onCancel={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
}
