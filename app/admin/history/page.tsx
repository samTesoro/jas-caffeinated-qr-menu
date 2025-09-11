"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import OrderHistory from "@/components/admin/order-history";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader showBack={false} />
      <OrderHistory />
      <Taskbar />
    </div>
  );
}
