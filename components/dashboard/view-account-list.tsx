"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

// Custom Add Icon
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#000000"
    className="w-5 h-5 sm:w-6 sm:h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303ZM19 7l-2-2"
    />
  </svg>
);

// Custom Trash Icon
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="#000000"
    className="w-5 h-5 sm:w-6 sm:h-6"
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
  view_reviews: boolean;
  manage_menu: boolean;
};

export default function ViewAccounts() {
  const supabase = createClient();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUser, setDeleteUser] = useState<null | {
    id: string;
    username: string;
  }>(null);

  //yelle: search and filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("adminusers").select("*");
      if (!error && data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? (u as any)[category] === true : true;
    return matchesSearch && matchesCategory;
  })

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("adminusers").delete().eq("id", id);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== id)); // remove user locally
      setDeleteUser(null);
    } else {
      console.error("Delete error:", error.message);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading accounts...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">View Accounts</h1>

      <div className="w-full mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          {/* Search */}
          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 text-black bg-white flex-1 min-w-0"
          />

          {/* Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-2 text-black bg-[#D9D9D9] w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="view_orders">View Orders</option>
            <option value="view_history">View Order History</option>
            <option value="view_menu">View & Edit Menu</option>
            <option value="view_reviews">View Reviews</option>
            <option value="manage_menu">Manage Menu</option>
          </select>
        </div>
      </div>


      <div className="max-h-[400px] overflow-y-auto space-y-3 border p-2">
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border p-3 bg-white rounded shadow-sm text-sm"
          >
            <p className="text-black mb-3">
              <strong className="text-black font-normal">Username:</strong>{" "}
              <span className="text-black font-bold">{user.username}</span>
            </p>
            <p className="text-black">
              Allow “View Orders”?:{" "}
              <span className="text-black font-bold">
                {user.view_orders ? "Yes" : "No"}
              </span>
            </p>
            <p className="text-black">
              Allow “View Order History”?:{" "}
              <span className="text-black font-bold">
                {user.view_history ? "Yes" : "No"}
              </span>
            </p>
            <p className="text-black flex items-center justify-between">
              <span>
                Allow “View and Edit Menu”?:{" "}
                <span className="text-black font-bold">
                  {user.view_menu ? "Yes" : "No"}
                </span>
                <br />
                Allow “View Reviews”?:{" "}
                <span className="text-black font-bold">
                  {user.view_reviews ? "Yes" : "No"}
                </span>
              </span>

              <span className="flex gap-2 ml-4">
                <button
                  onClick={() =>
                    router.push(`/dashboard/view-accounts/edit/${user.id}`)
                  }
                  className="bg-[#A7F586] rounded-full p-1.5 sm:p-2 flex-shrink-0 flex items-center justify-center shadow"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() =>
                    setDeleteUser({ id: user.id, username: user.username })
                  }
                  className="bg-red-500 rounded-full p-1.5 sm:p-2 flex-shrink-0 flex items-center justify-center shadow"
                >
                  <TrashIcon />
                </button>
              </span>
            </p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No accounts found</p>
      )}
    </div>


      <div className="flex justify-center items-center mt-7">
        <button
          className="px-2 border bg-[#ebebeb] text-black"
          onClick={() => router.push("/auth/create-account")}
        >
          Add Account
        </button>
      </div>

      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <h2 className="text-lg font-bold text-black mb-4">
              <p className="text-lg font-bold text-black">
                Delete{" "}
                <span className="text-red-400">
                  &quot;{deleteUser.username}&quot;
                </span>
                ?
              </p>
            </h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setDeleteUser(null)} variant="red">
                No
              </Button>
              <Button
                onClick={() => handleDelete(deleteUser.id)}
                variant="green"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
