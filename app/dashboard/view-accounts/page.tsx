"use client";
import Taskbar from "@/components/dashboard/taskbar";
import DashboardHeader from "@/components/dashboard/header";
import ViewAccounts from "@/components/dashboard/view-account-list";

export default function ViewAccountsPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader showBack={true} />
      <ViewAccounts />
      <Taskbar />
    </div>
  );
}
