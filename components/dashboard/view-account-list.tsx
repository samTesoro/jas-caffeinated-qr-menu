"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Custom Add Icon
const AddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

// Custom Trash Icon
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z"
    />
  </svg>
);

type User = {
  id: string;
  username: string;
  password: string;
  view_orders: boolean;
  view_history: boolean;
  view_menu: boolean;
  manage_menu: boolean;
};

export default function ViewAccounts() {
  const supabase = createClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading accounts...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4 text-black">View Accounts</h1>
      <div className="max-h-[400px] overflow-y-auto space-y-3 border p-2">
        {users.map((user) => (
          <div key={user.id} className="border p-3 bg-white rounded shadow-sm">
            <p>
              <strong>Username:</strong> {user.username}{" "}
              <strong>Password:</strong> {user.password}
            </p>
            <p>Allow “View Orders”?: {user.view_orders ? "Yes" : "No"}</p>
            <p>
              Allow “View Order History”?: {user.view_history ? "Yes" : "No"}
            </p>
            <p>Allow “View and Edit Menu”?: {user.view_menu ? "Yes" : "No"}</p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  router.push(`/dashboard/view-accounts/edit/${user.id}`)
                }
                className="p-2 bg-green-200 rounded-full"
              >
                <AddIcon />
              </button>
              <button
                onClick={() => alert("TODO: Add delete modal")}
                className="p-2 bg-red-200 rounded-full"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center min-h-screen">
        <button
          className="px-2 border bg-[#ebebeb] text-black"
          onClick={() => router.push("/auth/create-account")}
        >
          Add Account
        </button>
      </div>
    </div>
  );
}
