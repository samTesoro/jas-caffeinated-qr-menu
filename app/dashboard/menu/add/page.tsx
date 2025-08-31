"use client";
import MenuItemForm from '@/components/dashboard/menu-item-form';

export default function AddMenuItemPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <MenuItemForm
        item={null}
        onSaved={() => window.location.href = '/dashboard/menu'}
        onCancel={() => window.location.href = '/dashboard/menu'}
      />
    </div>
  );
}
