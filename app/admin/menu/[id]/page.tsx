"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuItemForm from '@/components/admin/menu-item-form';
import { createClient } from '@/lib/supabase/client';
import type { MenuItem } from '@/components/ui/menu-item-card';

export default function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // `params` may be a Promise in newer Next.js versions. We'll resolve it
  // inside the effect so the dependency array can depend only on the original
  // `params` reference (keeps array size stable across renders).
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // Resolve params (may be a Promise)
        const resolved = await (params as Promise<{ id: string }>);
        console.log("EditMenuItemPage params:", resolved);
        const { id } = resolved;
        if (!id || isNaN(Number(id))) {
          console.error("Invalid menuitem_id:", id, "params:", resolved);
          setItem(null);
          setLoading(false);
          return;
        }
        const supabase = createClient();
        // Always use menuitem_id for Supabase queries
        const { data, error } = await supabase
          .from("menuitem")
          .select("*")
          .eq("menuitem_id", Number(id))
          .single();
        if (error) console.error("Supabase fetch error:", error);
        setItem(data);
      } catch (e) {
        console.error("Failed to resolve params or fetch item:", e);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params]);

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