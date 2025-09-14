"use client";
import { useEffect, useState } from "react"; // Removed unused `useMemo`
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import OrderHistory from "@/components/admin/order-history";

const Page = () => {
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
        console.error("User ID is null or undefined. Redirecting to login page.");
        router.replace("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("adminusers") // Correct table name
          .select("view_orders, view_history, view_menu, view_super, view_reviews")
          .eq("user_id", adminId)
          .single();

        if (error || !data) {
          console.error("Error fetching permissions from Supabase:", error);
          setPermissions({
            view_menu: false,
            view_orders: false,
            view_super: false,
            view_history: false,
            view_reviews: false,
          });
        } else {
          console.log("Fetched permissions:", data);
          setPermissions((prev) => ({
            ...prev,
            ...data,
          }));
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
    return <div>Loading...</div>; // Prevent rendering the page until permissions are loaded
  }

  if (!permissions.view_history) {
    return null; // Prevent rendering the page if the user doesn't have access
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <div className="flex-1 px-5 pb-20">
        <OrderHistory />
      </div>
      <Taskbar permissions={permissions} />
    </div>
  );
};

export default Page;
