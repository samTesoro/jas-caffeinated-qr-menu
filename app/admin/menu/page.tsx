"use client";
import MenuItemList from "@/components/admin/menu-item-list";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/ui/header";
import Taskbar from "@/components/admin/taskbar-admin";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const [refresh, setRefresh] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<{
    view_menu: boolean;
    view_orders: boolean;
    view_super: boolean;
    view_history: boolean;
    view_reviews: boolean;
  }>({
    view_menu: false,
    view_orders: false,
    view_super: false,
    view_history: false,
    view_reviews: false,
  }); // Fixed syntax errors
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPermissions = async () => {
      const supabase = createClient();
      const adminId = localStorage.getItem("user_id");
      console.log("Fetching permissions for user_id:", adminId); // Debugging log

      if (!adminId) {
        console.error(
          "User ID is null or undefined. Redirecting to login page."
        );
        router.replace("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("adminusers")
          .select(
            "view_menu, view_orders, view_super, view_history, view_reviews"
          )
          .eq("user_id", adminId)
          .single();

        console.log("Fetched permissions:", data); // Debugging log

        if (error || !data) {
          console.error("Error fetching permissions from Supabase:", error);
        } else {
          setPermissions(data);
        }
      } catch (err) {
        console.error("Unexpected error while fetching permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [router]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (permissions.view_menu === false) {
      const previousPage = permissions.view_orders
        ? "/admin/orders"
        : permissions.view_super
        ? "/admin/view-accounts"
        : permissions.view_history
        ? "/admin/history"
        : permissions.view_reviews
        ? "/admin/reviews"
        : "/admin"; // Default fallback

      router.replace(previousPage);
    }
  }, [isLoading, permissions, router]);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || null);
    };
    getUser();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />; // Prevent rendering the page until permissions are loaded
  }

  if (!permissions.view_menu) {
    return null; // Prevent rendering the page if the user doesn't have access
  }

  return (
    <div>
      <DashboardHeader />

      {userEmail && (
        <div className="px-8 text-xs text-gray-600 md:text-center mb-2">
          Logged in as: {userEmail}
        </div>
      )}

      {/* for knowing who is logged in */}
      <div className="flex-1 px-8 pb-8 pt-2">
        <MenuItemList
          onEdit={(item) => {
            if (item) window.location.href = `/admin/menu/${item.menuitem_id}`;
          }}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      </div>

      <Taskbar permissions={permissions} />
    </div>
  );
}
