"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MenuItemForm from '@/components/admin/menu-item-form';
import { createClient } from '@/lib/supabase/client';
import type { MenuItem } from '@/components/admin/menu-item-list';

import React from 'react';

export default function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      // Debug log for params
      console.log('EditMenuItemPage params:', params);
      if (!id || isNaN(Number(id))) {
        console.error('Invalid menuitem_id:', id, 'params:', params);
        setItem(null);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      // Always use menuitem_id for Supabase queries
      const { data, error } = await supabase.from('menuitem').select('*').eq('menuitem_id', Number(id)).single();
      if (error) {
        console.error('Supabase fetch error:', error);
      }
      setItem(data);
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!item) return <div className="p-8 text-center">Item not found.</div>;

  return (
    <div className="min-h-screen bg-[#ebebeb]">
            <MenuItemForm
              item={item}
              onSaved={() => router.push('/admin/menu')}
              onCancel={() => router.push('/admin/menu')}
            />
          </div>
  );
}