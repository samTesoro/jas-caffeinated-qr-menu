"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Taskbar from "@/components/dashboard/taskbar-superadmin";
import DashboardHeader from "@/components/dashboard/header"; // Import the header

export default function CreateAccountPage() {
  const supabase = createClient();

  const [username, setUsername] = useState("");
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

    // Insert new user with permissions
    const { error } = await supabase.from("users").insert({
      username,
      password,
      role,
      view_orders: viewOrders,
      view_history: viewOrderHistory,
      view_menu: viewMenu,
      manage_menu: manageMenu,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created successfully!");
      setUsername("");
      setPassword("");
      setRole("admin");
      setViewOrders(false);
      setViewOrderHistory(false);
      setViewMenu(false);
      setManageMenu(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] flex flex-col items-center">
      <DashboardHeader showBack={false} /> {/* Use dashboard header here */}

      <form onSubmit={handleSubmit} className="w-[90%] max-w-xs mt-4 space-y-4">
        <h2 className="text-center text-lg text-black">Create a new account</h2>

        <div>
          <label className="block text-sm text-black">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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