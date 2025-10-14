"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
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
  const [viewReviews, setViewReviews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      const { data, error } = await supabase
        .from("adminusers")
        .select("*")
        .eq("user_id", id)
        .single();
      if (data) {
        setUsername(data.username || "");
        setPassword(data.password || "");
        setViewOrders(!!data.view_orders);
        setViewOrderHistory(!!data.view_history);
        setViewMenu(!!data.view_menu);
        setViewReviews(!!data.view_reviews);
      }
      if (error) setError(error.message);
    };
    if (id) fetchAccount();
  }, [id, supabase]);

  const handleUpdate = async () => {
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
        view_reviews: viewReviews,
      })
      .eq("user_id", id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/view-accounts");
    }
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] flex flex-col items-center">
      <DashboardHeader />

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true);
        }}
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
          <label className="flex gap-2 text-lg text-black">
            <input
              type="checkbox"
              checked={viewMenu}
              onChange={() => setViewMenu(!viewMenu)}
            />
            Allow “View Reviews”
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-center gap-10">
          <button
            type="submit"
            className="px-2 border bg-[#ebebeb] text-black mt-10 focus:outline-none focus:ring-0"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/view-accounts")}
            className="px-2 border bg-[#ebebeb] text-black mt-10 w-[80px] focus:outline-none focus:ring-0"
          >
            Back
          </button>
        </div>
      </form>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-8 w-[90vw] max-w-xs sm:max-w-[350px] text-center space-y-4 shadow-lg">
            <p className="text-lg font-bold text-black">Confirm changes?</p>

            <div className="text-left text-black">
              <p>
                <span>Username:</span>{" "}
                <span className="font-bold">{username}</span>
              </p>
              <p className="mb-3">
                <span>Password:</span>{" "}
                <span className="font-bold">{password}</span>
              </p>
              <p>
                <span>Allow &quot;View Orders&quot;:</span>{" "}
                <span className="font-bold">{viewOrders ? "Yes" : "No"}</span>
              </p>
              <p>
                <span>Allow &quot;View Order History&quot;:</span>{" "}
                <span className="font-bold">
                  {viewOrderHistory ? "Yes" : "No"}
                </span>
              </p>
              <p>
                <span>Allow &quot;View and Edit Menu&quot;:</span>{" "}
                <span className="font-bold">{viewMenu ? "Yes" : "No"}</span>
              </p>
              <p>
                <span>Allow &quot;View Reviews&quot;:</span>{" "}
                <span className="font-bold">{viewReviews ? "Yes" : "No"}</span>
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="red"
                onClick={() => setShowConfirmModal(false)}
                className="border-transparent font-semibold hover:bg-gray-200 w-[100px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                type="button"
                variant="green"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleUpdate();
                }}
                className="border-transparent font-semibold hover:bg-gray-200 w-[100px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex-1 flex flex-col justify-end">
        <Taskbar />
      </div>
    </main>
  );
}
