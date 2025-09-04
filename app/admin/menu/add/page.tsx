"use client";
import MenuItemForm from '@/components/admin/menu-item-form';

export default function AddMenuItemPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <MenuItemForm
        item={null}
        onSaved={() => window.location.href = '/admin/menu'}
        onCancel={() => window.location.href = '/admin/menu'}
      />
    </div>
  );
}
