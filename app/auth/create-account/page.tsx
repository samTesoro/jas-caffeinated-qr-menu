"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import { Button } from "@/components/ui/button"; // ✅ assuming you have shadcn Button

export default function CreateAccountPage() {
  const supabase = createClient();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [viewOrders, setViewOrders] = useState(false);
  const [viewOrderHistory, setViewOrderHistory] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [viewReviews, setViewReviews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Save to adminusers table
    const { error } = await supabase.from("adminusers").insert({
      username,
      password,
      view_orders: viewOrders,
      view_history: viewOrderHistory,
      view_menu: viewMenu,
      view_reviews: viewReviews,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard/view-accounts");
    }
  };

  return (
    <main className="min-h-screen bg-[#ebebeb] flex flex-col items-center">
      <DashboardHeader showBack={false} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmModal(true); // ✅ instead of immediate submit
        }}
        className="w-[90%] max-w-xs mt-4 space-y-4"
      >
        <h2 className="text-center text-xl text-black font-bold">
          Create a new account
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
              checked={viewReviews}
              onChange={() => setViewReviews(!viewReviews)}
            />
            Allow “View Reviews”
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-center gap-10">
          <button
            type="submit"
            className="px-2 border bg-[#ebebeb] text-black mt-10"
            disabled={loading}
          >
            {loading ? "Creating..." : "Confirm"}
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-md p-6 w-[300px] max-w-sm text-center space-y-4">
            <p className="text-lg font-bold text-black">
              Confirm Admin Account?
            </p>

            <div className="text-left text-black">
              <p>
                <span>Username:</span>{" "}
                <span className="font-bold">{username}</span>
              </p>
              <p>
                <span>Password:</span>{" "}
                <span className="font-bold mb-3">{password}</span>
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

            <div className="flex justify-between focus:outline-none">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowConfirmModal(false)}
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
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
