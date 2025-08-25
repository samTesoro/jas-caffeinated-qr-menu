"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/dashboard/taskbar";
import DashboardHeader from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";

export default function EditAccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const { id } = useParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewOrders, setViewOrders] = useState(false);
  const [viewOrderHistory, setViewOrderHistory] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data, error } = await supabase
        .from("adminusers")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setUsername(data.username || "");
        setPassword(data.password || "");
        setViewOrders(!!data.view_orders);
        setViewOrderHistory(!!data.view_history);
        setViewMenu(!!data.view_menu);
      }
      if (error) setError(error.message);
    };
    if (id) fetchAccount();
  }, [id, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("adminusers")
      .update({
        username,
        password,
        view_orders: viewOrders,
        view_history: viewOrderHistory,
        view_menu: viewMenu,
      })
      .eq("id", id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard/view-accounts");
    }
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] flex flex-col items-center">
      <DashboardHeader showBack={true} />
      <form
        onSubmit={handleUpdate}
        className="w-[90%] max-w-xs mt-4 space-y-4"
      >
        <h2 className="text-center text-xl text-black font-bold">
          Edit Account
        </h2>
        <div>
          <label className="block text-lg text-black mb-1.5">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="text-black w-full border px-2 py-1 bg-[#D9D9D9]"
          />
        </div>
        <div>
          <label className="block text-lg text-black mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="text-black w-full border px-2 py-1 bg-[#D9D9D9]"
          />
        </div>
        <div className="mt-2">
          <p className="block text-lg text-black mb-1.5">Access Permissions</p>
          <label className="flex gap-2 text-lg text-black">
            <input
              type="checkbox"
              checked={viewOrders}
              onChange={() => setViewOrders(!viewOrders)}
            />
            Allow “View Orders”
          </label>
          <label className="flex gap-2 text-lg text-black">
            <input
              type="checkbox"
              checked={viewOrderHistory}
              onChange={() => setViewOrderHistory(!viewOrderHistory)}
            />
            Allow “View Order History”
          </label>
          <label className="flex gap-2 text-lg text-black">
            <input
              type="checkbox"
              checked={viewMenu}
              onChange={() => setViewMenu(!viewMenu)}
            />
            Allow “View and Edit Menu”
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-center gap-10">
          <button
            type="submit"
            className="px-2 border bg-[#ebebeb] text-black mt-10"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/view-accounts")}
            className="px-2 border bg-[#ebebeb] text-black mt-10 w-[80px]"
          >
            Back
          </button>
        </div>
      </form>
      <div className="w-full flex-1 flex flex-col justify-end">
        <Taskbar />
      </div>
    </main>
  );
}
