"use client";
import MenuItemList from '@/components/dashboard/menu-item-list';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from '@/components/logout-button';

export default function MenuPage() {
  const [refresh, setRefresh] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || null);
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-white py-8 px-2">
      <div className="max-w-3xl mx-auto rounded-lg shadow-lg min-h-[80vh] flex flex-col" style={{ backgroundColor: '#1f1f1f' }}>
        <div className="flex justify-end items-center gap-4 px-6 pt-6 pb-4 bg-[#232323] rounded-t-lg border-b border-[#E59C53]">
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="text-white text-sm font-medium truncate">{userEmail}</span>
            )}
            <span className="m1-2" />
            <LogoutButton />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-4 text-black bg-[#E59C53] py-4 shadow-md">Menu Items</h1>
        <div className="flex-1 px-8 pb-8 pt-2">
          <MenuItemList
            onEdit={(item) => { if (item) window.location.href = `/dashboard/menu/${item.id}`; }}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        </div>
      </div>
    </div>
  );
}
