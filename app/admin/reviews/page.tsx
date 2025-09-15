"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ReviewsPage() {

  const router = useRouter();
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
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const supabase = createClient();
      const adminId = localStorage.getItem("user_id");
      if (!adminId) {
        router.replace("/auth/login");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("adminusers")
          .select("view_menu, view_orders, view_super, view_history, view_reviews")
          .eq("user_id", adminId)
          .single();
        if (error || !data) {
          setPermissions({
            view_menu: false,
            view_orders: false,
            view_super: false,
            view_history: false,
            view_reviews: false,
          });
        } else {
          setPermissions(data);
        }
      } catch {
        setPermissions({
          view_menu: false,
          view_orders: false,
          view_super: false,
          view_history: false,
          view_reviews: false,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, [router]);

  useEffect(() => {
    if (isLoading) return;
    if (permissions.view_reviews === false) {
      // If user cannot view reviews, redirect to fallback page
      const previousPage = permissions.view_menu
        ? "/admin/menu"
        : permissions.view_orders
        ? "/admin/orders"
        : permissions.view_super
        ? "/admin/view-accounts"
        : permissions.view_history
        ? "/admin/history"
        : "/admin";
      router.replace(previousPage);
    }
  }, [permissions, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!permissions.view_reviews) {
    return null;
  }
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <Taskbar permissions={permissions} />
      {/* Add reviews page content here */}
    </div>
  );
}

