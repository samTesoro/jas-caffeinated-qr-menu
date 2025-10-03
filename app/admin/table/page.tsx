"use client";
import TableManagement from "@/components/admin/table-management";
import Taskbar from "@/components/admin/taskbar-admin";

export default function AdminTablePage() {
  const permissions = {
    view_orders: true,
    view_history: true,
    view_menu: true,
    view_reviews: true,
    create_account: true,
    view_super: true,
  };

  return (
    <>
      <TableManagement />
      <Taskbar permissions={permissions} />
    </>
  );
}
