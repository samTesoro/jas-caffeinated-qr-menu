"use client";
import { useEffect, useState } from "react"; // Removed unused `useMemo`
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import HistoryAndSales from "@/components/admin/history-and-sales";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Page = () => {
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
        console.error("User ID is null or undefined. Redirecting to login page.");
        router.replace("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("adminusers") // Correct table name
          .select("view_orders, view_history, view_menu, view_super, view_reviews, view_tables")
          .eq("user_id", adminId)
          .single();

        const isAllowed = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";

        if (error || !data) {
          console.error("Error fetching permissions from Supabase:", error);
          setPermissions({
            view_menu: false,
            view_orders: false,
            view_super: false,
            view_history: false,
            view_reviews: false,
            view_tables: false,
          });
        } else {
          console.log("Fetched permissions:", data);
          setPermissions({
            view_menu: isAllowed((data as any).view_menu),
            view_orders: isAllowed((data as any).view_orders),
            view_super: isAllowed((data as any).view_super),
            view_history: isAllowed((data as any).view_history),
            view_reviews: isAllowed((data as any).view_reviews),
            view_tables: isAllowed((data as any).view_tables),
          });
        }
      } catch (err) {
        console.error("Unexpected error while fetching permissions:", err);
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
    if (isLoading) {
      console.log("Permissions are still loading.");
      return;
    }

    console.log("Current permissions state:", permissions);
    console.log("view_history permission:", permissions?.view_history);

    if (permissions && permissions.view_history === false) {
      console.warn("Redirecting due to lack of view_history permission.");
      const previousPage = permissions.view_menu
        ? "/admin/menu"
        : permissions.view_orders
        ? "/admin/orders"
        : permissions.view_super
        ? "/admin/view-accounts"
        : permissions.view_reviews
        ? "/admin/reviews"
        : "/admin"; // Default fallback

      router.replace(previousPage);
    } else if (permissions && permissions.view_history === true) {
      console.log("Access granted to view_history.");
    } else {
      console.log("Permissions state is not yet fully loaded.");
    }
  }, [permissions, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ebebeb]">
        <DashboardHeader />
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner message="Loading..." />
        </div>
        <Taskbar permissions={permissions} />
      </div>
    );
  }

  if (!permissions.view_history) {
    return null; // Prevent rendering the page if the user doesn't have access
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <HistoryAndSales />
      <Taskbar permissions={permissions} />
      {permissions.view_history ? (
        <div>
          {/* History page content */}
        </div>
      ) : (
        <div>
          <p>You do not have permission to view this page.</p>
        </div>
      )}
    </div>
  );
};

export default Page;
