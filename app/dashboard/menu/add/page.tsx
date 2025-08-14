"use client";
import MenuItemForm from '@/components/dashboard/menu-item-form';

export default function AddMenuItemPage() {
  return (
          <MenuItemForm item={null} onSaved={() => window.location.href = '/dashboard/menu'} onCancel={() => window.location.href = '/dashboard/menu'} />
    
  );
}
