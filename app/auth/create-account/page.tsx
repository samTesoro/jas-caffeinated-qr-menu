"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Taskbar from "@/components/dashboard/taskbar-superadmin";
import DashboardHeader from "@/components/dashboard/header";

export default function CreateAccountPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [viewOrders, setViewOrders] = useState(false);
  const [viewOrderHistory, setViewOrderHistory] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [manageMenu, setManageMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Create user in Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Insert permissions into adminusers with user_id
    const userId = data.user?.id;
    if (userId) {
      const { error: dbError } = await supabase.from("adminusers").insert({
        user_id: userId,
        email,
        role,
        view_orders: viewOrders,
        view_history: viewOrderHistory,
        view_menu: viewMenu,
        manage_menu: manageMenu,
      });
      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSuccess("Account created successfully!");
    setEmail("");
    setPassword("");
    setRole("admin");
    setViewOrders(false);
    setViewOrderHistory(false);
    setViewMenu(false);
    setManageMenu(false);
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] flex flex-col items-center">
      <DashboardHeader showBack={false} />
      <form onSubmit={handleSubmit} className="w-[90%] max-w-xs mt-4 space-y-4">
        <h2 className="text-center text-lg text-black">Create a new account</h2>
        <div>
          <label className="block text-sm text-black">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-2 py-1 bg-[#D9D9D9]"
          />
        </div>
        <div>
          <label className="block text-sm text-black">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-2 py-1 bg-[#D9D9D9]"
          />
        </div>
        <div className="mt-2">
          <p className="text-black">Access Permissions</p>
          <label className="flex gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={viewOrders}
              onChange={() => setViewOrders(!viewOrders)}
            />
            Allow “View Orders”
          </label>
          <label className="flex gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={viewOrderHistory}
              onChange={() => setViewOrderHistory(!viewOrderHistory)}
            />
            Allow “View Order History”
          </label>
          <label className="flex gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={viewMenu}
              onChange={() => setViewMenu(!viewMenu)}
            />
            Allow “View Menu”
          </label>
          <label className="flex gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={manageMenu}
              onChange={() => setManageMenu(!manageMenu)}
            />
            Allow “Add/Edit Menu Item”
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          className="w-[30%] bg-[#D9D9D9] text-black block mx-auto border border-black"
          disabled={loading}
        >
          {loading ? "Creating..." : "Confirm"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/login" className="text-[#E59C53] underline">
          Back to Login
        </Link>
      </p>
      <div className="w-full flex-1 flex flex-col justify-end">
        <Taskbar />
      </div>
    </main>
  );
}