"use client";
import Taskbar from "@/components/customer/taskbar-customer";
import DashboardHeader from "@/components/ui/header";

export default function CoffeePage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader mode="customer" />
      <Taskbar />
    </div>
  );
}
