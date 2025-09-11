"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import OrderNotification from "@/components/admin/order-notification";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader showBack={false} />
      <div className="flex-1 px-5 pb-20">
        <OrderNotification />
      </div>
      <Taskbar />
    </div>
  );
}
