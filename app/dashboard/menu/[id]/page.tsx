"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MenuItemForm from '@/components/dashboard/menu-item-form';
import { createClient } from '@/lib/supabase/client';
import type { MenuItem } from '@/components/dashboard/menu-item-list';

import React from 'react';

export default function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('menu_items').select('*').eq('id', id).single();
      setItem(data);
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!item) return <div className="p-8 text-center">Item not found.</div>;

  return (
    <div className="min-h-screen bg-white py-8 px-2">
      <div className="max-w-3xl mx-auto rounded-lg shadow-lg min-h-[80vh] flex flex-col" style={{ backgroundColor: '#1f1f1f' }}>
        <div className="w-full">
          <h1 className="text-3xl font-bold text-center mb-0 w-full text-black bg-[#E59C53] py-4 shadow-md rounded-t-lg">Edit Menu Item</h1>
        </div>
        <div className="flex-1 px-8 pb-8 pt-2 flex items-center justify-center">
          <div className="w-full max-w-xl">
            <MenuItemForm
              item={item}
              onSaved={() => router.push('/dashboard/menu')}
              onCancel={() => router.push('/dashboard/menu')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
