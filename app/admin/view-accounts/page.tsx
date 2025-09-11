"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import ViewAccounts from "@/components/admin/view-account-list";
import { useRouter } from "next/navigation";

export default function ViewAccountsPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({ view_super: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const supabase = createClient();
      const adminId = localStorage.getItem("user_id");
      console.log("Fetching permissions for user_id:", adminId); // Debugging log

      if (!adminId) {
        console.error("User ID is null or undefined. Redirecting to login page.");
        router.replace("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("adminusers")
          .select("view_menu, view_orders, view_super, view_history, view_reviews")
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
    if (!isLoading && permissions.view_super === false) {
      router.replace("/admin");
    }
  }, [isLoading, permissions, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <ViewAccounts />
      <Taskbar permissions={permissions} />
    </div>
  );
}
