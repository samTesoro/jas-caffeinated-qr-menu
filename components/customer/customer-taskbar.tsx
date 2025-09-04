"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { label: "Meals", icon: "/customer-meals-icon.png", selectedIcon: "/customer-meals-icon-selected.png" },
  { label: "Coffee", icon: "/coffee-meals-icon.png", selectedIcon: "/coffee-meals-icon-selected.png" },
  { label: "Drinks", icon: "/drinks-icon.png", selectedIcon: "/drinks-icon-selected.png" },
  { label: "Favorites", icon: "/favorites-icon.png", selectedIcon: "/favorites-icon-selected.png" },
];

type Permissions = {
  [key: string]: boolean;
};

export default function MenuTaskbar() {
  const supabase = createClient();
  const pathname = usePathname();

  const [permissions, setPermissions] = useState<Permissions>({
    view_meals: false,
    view_coffee: false,
    view_drinks: false,
    view_favorites: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError || !user?.user) {
          console.error("Error fetching user or user not logged in:", userError);
          setLoading(false);
          return;
        }

        const userId = user.user.id;
        console.log("Fetched user ID:", userId);

        const { data: permissionsData, error: permissionsError } = await supabase
          .from("customerpermissions")
          .select("view_meals, view_coffee, view_drinks, view_favorites")
          .eq("user_id", userId)
          .single();

        if (permissionsError) {
          console.error("Error fetching permissions:", permissionsError);
          setLoading(false);
          return;
        }

        console.log("Fetched permissions data:", permissionsData);

        if (permissionsData) {
          setPermissions(permissionsData);
        }
      } catch (error) {
        console.error("Unexpected error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900 flex items-center justify-around px-4 py-3 z-20" style={{ height: "80px" }}>
      {tabs.map((tab, index) => (
        <div key={tab.label} className="flex flex-col items-center">
          {permissions[`view_${tab.label.toLowerCase()}`] ? (
            <Link href={`/customer/${tab.label.toLowerCase()}`}>
              <Image
                src={pathname.includes(tab.label.toLowerCase()) ? tab.selectedIcon : tab.icon}
                alt={tab.label}
                width={24}
                height={24}
              />
              <span className={`text-xs ${pathname.includes(tab.label.toLowerCase()) ? "text-orange-400" : "text-white"}`}>
                {tab.label}
              </span>
            </Link>
          ) : (
            <div className="opacity-50">
              <Image src={tab.icon} alt={tab.label} width={24} height={24} />
              <span className="text-xs text-gray-500">{tab.label}</span>
            </div>
          )}
        </div>
      ))}

      {/* Cart Button */}
      <div className="relative flex flex-col items-center" style={{ margin: "0 16px" }}>
        <Link href="/customer/cart">
          <button
            className="bg-orange-400 rounded-full p-4 shadow-lg flex items-center justify-center"
            style={{ position: "relative", top: "-30px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="white"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-.68L21 13M7 13V6h13"
              />
            </svg>
          </button>
        </Link>
      </div>
    </footer>
  );
}
