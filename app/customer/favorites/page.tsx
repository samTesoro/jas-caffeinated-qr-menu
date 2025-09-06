"use client";
<<<<<<< HEAD
import Taskbar from "@/components/customer/taskbar-customer";
import DashboardHeader from "@/components/ui/header";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader mode="customer" />
      <Taskbar />
    </div>
  );
}
=======
import CustomerMenu from "@/components/customer/menu";

export default function FavoritesPage() {
  return <CustomerMenu tableId="demo" initialTab="Favorites" />;
}
>>>>>>> 8d01a6caf1f5163b16817fef7e8e57d1500147dd
