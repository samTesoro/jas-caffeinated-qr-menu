"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import ViewAccounts from "@/components/admin/view-account-list";

export default function ViewAccountsPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb] pb-5">
      <DashboardHeader showBack={true} />
      <ViewAccounts />
      <Taskbar />
    </div>
  );
}
