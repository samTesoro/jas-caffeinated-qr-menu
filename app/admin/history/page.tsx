"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";

const Page = () => {
  const router = useRouter();
  type Permissions = {
    view_orders: boolean;
    view_history: boolean;
    view_menu: boolean;
    view_super: boolean;
    create_account: boolean;
    view_reviews: boolean;
  };
  const defaultPermissions = useMemo(
    () => ({
      view_orders: false,
      view_history: false,
      view_menu: false,
      view_super: false,
      create_account: false,
      view_reviews: false,
    }),
    []
  );
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);
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
          setPermissions(defaultPermissions);
        } else {
          console.log("Fetched permissions:", data);
          setPermissions({
            ...defaultPermissions,
            ...data,
          });
        }
      } catch (err) {
        console.error("Unexpected error while fetching permissions:", err);
        setPermissions(defaultPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [defaultPermissions, router]);

  useEffect(() => {
    if (isLoading) {
      console.log("Permissions are still loading.");
      return;
    }

    console.log("Current permissions state:", permissions);
    console.log("view_history permission:", permissions?.view_history);

    if (permissions && permissions.view_history === false) {
      console.warn("Redirecting due to lack of view_history permission.");
      router.replace("/admin");
    } else if (permissions && permissions.view_history === true) {
      console.log("Access granted to view_history.");
    } else {
      console.log("Permissions state is not yet fully loaded.");
    }
  }, [permissions, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
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
