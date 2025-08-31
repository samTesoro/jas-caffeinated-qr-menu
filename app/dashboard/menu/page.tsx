"use client";
import MenuItemList from "@/components/dashboard/menu-item-list";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
/*import { LogoutButton } from '@/components/logout-button';*/
import DashboardHeader from "@/components/ui/header";
import Taskbar from "@/components/dashboard/taskbar";

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
    <div className="min-h-screen bg-[#ebebeb] pb-10">
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
        <a href="/customer">
          <button style={{ padding: '8px 16px', background: '#f59e42', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}>
            Go to Customer (Debug)
          </button>
        </a>
      </div>
      <DashboardHeader showBack={false} />
      {userEmail && (
        <div className="px-8 text-xs text-gray-600 md:text-center mb-2">
          Logged in as: {userEmail}
        </div>
      )}{" "}
      {/* for knowing who is logged in */}
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuItemList
          onEdit={(item) => {
            if (item)
              window.location.href = `/dashboard/menu/${item.menuitem_id}`;
          }}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>
      <Taskbar />
    </div>
  );
}
