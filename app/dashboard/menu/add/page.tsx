"use client";
import MenuItemForm from '@/components/dashboard/menu-item-form';

export default function AddMenuItemPage() {
  return (
    <div className="min-h-screen bg-white py-8 px-2">
      <div className="max-w-xl mx-auto rounded-lg shadow-lg min-h-[80vh] flex flex-col" style={{ backgroundColor: '#1f1f1f' }}>
        <h1 className="text-3xl font-bold text-center mb-4 text-black bg-[#E59C53] rounded-t-lg py-4">Add Menu Item</h1>
        <div className="flex-1 p-6">
          <MenuItemForm item={null} onSaved={() => window.location.href = '/dashboard/menu'} onCancel={() => window.location.href = '/dashboard/menu'} />
        </div>
      </div>
    </div>
  );
}
