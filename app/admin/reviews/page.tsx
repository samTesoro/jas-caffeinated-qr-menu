"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";

import { useEffect, useState } from "react";
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
    // Simulate an API call to fetch permissions
    const fetchPermissions = async () => {
      // Replace this with your actual API call
      const userPermissions = {
        view_menu: true,
        view_orders: false,
        view_super: false,
        view_history: true,
        view_reviews: false,
      };

      setPermissions(userPermissions);
      setIsLoading(false);
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (permissions === undefined) return; // Wait until permissions are defined

    if (permissions.view_reviews === false) {
      const previousPage = permissions.view_menu
        ? "/admin/menu"
        : permissions.view_orders
        ? "/admin/orders"
        : permissions.view_super
        ? "/admin/view-accounts"
        : permissions.view_history
        ? "/admin/history"
        : "/admin"; // Default fallback

      router.replace(previousPage);
    }
  }, [permissions, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Prevent rendering the page until permissions are loaded
  }

  if (!permissions.view_reviews) {
    return null; // Prevent rendering the page if the user doesn't have access
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <Taskbar permissions={permissions} />
    </div>
  );
}
