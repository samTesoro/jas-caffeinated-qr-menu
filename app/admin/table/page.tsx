"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TableManagement from "@/components/admin/table-management";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";

export default function AdminTablePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<{
    view_menu: boolean;
    view_orders: boolean;
    view_super: boolean;
    view_history: boolean;
    view_reviews: boolean;
    view_tables?: boolean;
  }>({
    view_menu: false,
    view_orders: false,
    view_super: false,
    view_history: false,
    view_reviews: false,
    view_tables: false,
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
          .select("view_menu, view_orders, view_super, view_history, view_reviews, view_tables")
          .eq("user_id", adminId)
          .single();

        const isAllowed = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";

        if (!error && data) {
          const normalized = {
            view_menu: isAllowed((data as any).view_menu),
            view_orders: isAllowed((data as any).view_orders),
            view_super: isAllowed((data as any).view_super),
            view_history: isAllowed((data as any).view_history),
            view_reviews: isAllowed((data as any).view_reviews),
            view_tables: isAllowed((data as any).view_tables),
          };
          setPermissions(normalized as any);
        } else {
          console.error("Error fetching permissions for admin table page:", error);
        }
      } catch (err) {
        console.error("Error fetching admin permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [router]);

  useEffect(() => {
    if (!isLoading && permissions.view_tables === false) {
      const previousPage = permissions.view_menu
        ? "/admin/menu"
        : permissions.view_orders
        ? "/admin/orders"
        : permissions.view_history
        ? "/admin/history"
        : permissions.view_reviews
        ? "/admin/reviews"
        : "/admin";
      router.replace(previousPage);
    }
  }, [isLoading, permissions, router]);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (!permissions.view_tables) return null;

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <TableManagement />
      <Taskbar permissions={permissions} />
    </div>
  );
}
