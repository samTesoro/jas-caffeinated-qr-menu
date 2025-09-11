"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewsPage({ permissions }: { permissions: { view_reviews?: boolean } }) {
  const router = useRouter();

  useEffect(() => {
    if (permissions === undefined) return; // Wait until permissions are defined

    if (permissions.view_reviews === false) {
      router.replace("/admin");
    }
  }, [permissions, router]);

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <Taskbar permissions={permissions} />
    </div>
  );
}
