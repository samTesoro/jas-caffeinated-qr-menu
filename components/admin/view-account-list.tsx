"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

// Icons
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#000000"
    className="w-4 h-4 sm:w-5 sm:h-5  "
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303ZM19 7l-2-2"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="#000000"
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z"
    />
  </svg>
);

const BlockIcon = ({ color = "black" }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke={color}
    className="w-4 h-4 sm:w-5 sm:h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.364 5.636a9 9 0 1 0 0 12.728 9 9 0 0 0 0-12.728zm-12.728 0 12.728 12.728"
    />
  </svg>
);

type User = {
  user_id: string;
  username: string;
  password: string;
  view_orders: boolean;
  view_history: boolean;
  view_menu: boolean;
  view_reviews: boolean;
  view_tables?: boolean;
  manage_menu: boolean;
  is_blocked?: boolean;
};

export default function ViewAccounts() {
  // Block a user by setting is_blocked to true in Supabase
  const handleBlock = async (user_id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("adminusers").update({ is_blocked: true }).eq("user_id", user_id);
    if (!error) {
      setUsers((prev) => prev.map((u) => u.user_id === user_id ? { ...u, is_blocked: true } : u));
      setBlockUser(null);
    } else {
      console.error("Block error:", error.message);
    }
  };

  // Unblock a user by setting is_blocked to false in Supabase
  const handleUnblock = async (user_id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("adminusers").update({ is_blocked: false }).eq("user_id", user_id);
    if (!error) {
      setUsers((prev) => prev.map((u) => u.user_id === user_id ? { ...u, is_blocked: false } : u));
      setUnblockUser(null);
    } else {
      console.error("Unblock error:", error.message);
    }
  };
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteUser, setDeleteUser] = useState<null | {
    user_id: string;
    username: string;
  }>(null);
  const [blockUser, setBlockUser] = useState<null | {
    user_id: string;
    username: string;
  }>(null);
  const [unblockUser, setUnblockUser] = useState<null | {
    user_id: string;
    username: string;
  }>(null);
  // removed unused local block tracking

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("adminusers").select("*");
      if (!error && data) {
        setUsers(data as User[]);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username
      .toLowerCase()
      .startsWith(search.toLowerCase());
    let matchesCategory = true;
    if (category === "blocked") {
      matchesCategory = u.is_blocked === true;
    } else if (category === "unblocked") {
      matchesCategory = u.is_blocked !== true;
    } else if (category === 'view_orders') {
      matchesCategory = u.view_orders === true;
    } else if (category === 'view_history') {
      matchesCategory = u.view_history === true;
    } else if (category === 'view_menu') {
      matchesCategory = u.view_menu === true;
    } else if (category === 'view_reviews') {
      matchesCategory = u.view_reviews === true;
    } else if (category === 'view_tables') {
      matchesCategory = u.view_tables === true;
    }
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (user_id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("adminusers").delete().eq("user_id", user_id);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.user_id !== user_id));
      setDeleteUser(null);
    } else {
      console.error("Delete error:", error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-black">View Accounts</h1>

      <div className="w-full mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 text-black bg-white flex-1 min-w-0"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-2 text-black bg-[#D9D9D9] w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            <option value="view_orders">View Orders</option>
            <option value="view_history">View Order History</option>
            <option value="view_menu">View and Edit Menu</option>
            <option value="view_reviews">View Reviews</option>
            <option value="view_tables">View Tables</option>
            <option value="blocked">Blocked</option>
            <option value="unblocked">Unblocked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
      <div className="max-h-[400px] overflow-y-auto space-y-3 border p-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isBlocked = user.is_blocked === true;
            return (
              <div
                key={user.user_id}
                className={`border p-3 bg-white rounded shadow-sm text-sm ${
                  isBlocked ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-black">
                    <strong className="text-black font-normal">Username:</strong>{" "}
                    <span className="text-black font-bold">{user.username}</span>
                  </p>
                  {isBlocked && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold ml-2">Blocked</span>
                  )}
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
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
                    <p className="text-black">
                      Allow “View and Edit Menu”?:{" "}
                      <span className="text-black font-bold">
                        {user.view_menu ? "Yes" : "No"}
                      </span>
                    </p>
                    <p className="text-black">
                      Allow “View Reviews”?:{" "}
                      <span className="text-black font-bold">
                        {user.view_reviews ? "Yes" : "No"}
                      </span>
                    </p>
                    <p className="text-black">
                      Allow “View Tables”?:{" "}
                      <span className="text-black font-bold">
                        {user.view_tables ? "Yes" : "No"}
                      </span>
                    </p>
                  </div>

                  {/* Right side - action buttons */}
                  <div className="flex flex-col gap-2 self-end ml-4 lg:flex-row lg:gap-3">
                    <button
                      onClick={() =>
                        router.push(`/admin/view-accounts/edit/${user.user_id}`)
                      }
                      className="bg-[#A7F586] w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteUser({ user_id: user.user_id, username: user.username })
                      }
                      className="bg-red-400 w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow"
                    >
                      <TrashIcon />
                    </button>
                    <button
                      onClick={() =>
                        isBlocked
                          ? setUnblockUser({
                              user_id: user.user_id,
                              username: user.username,
                            })
                          : setBlockUser({
                              user_id: user.user_id,
                              username: user.username,
                            })
                      }
                      className={`${
                        isBlocked ? "bg-red-700" : "bg-[#d9d9d9]"
                      } w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow`}
                      title={isBlocked ? "Unblock User" : "Block User"}
                    >
                      <BlockIcon />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-4">No accounts found</p>
        )}
      </div>
      )}

      <div className="flex justify-center items-center mt-7 pb-10">
        <button
          className="px-2 border bg-[#ebebeb] text-black"
          onClick={() => router.push("/auth/create-account")}
        >
          Add Account
        </button>
      </div>

      {/* Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
              <h2 className="text-lg font-bold mb-4 text-black">
                Delete <span className="text-red-400">&quot;{deleteUser.username}&quot;</span>?
              </h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setDeleteUser(null)} variant="red">
                No
              </Button>
              <Button
                onClick={() => handleDelete(deleteUser.user_id)}
                variant="green"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockUser && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
            <h2 className="text-lg font-bold text-black mb-4">
              Block <span className="text-red-600">&quot;{blockUser.username}&quot;</span>
              ?
            </h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setBlockUser(null)} variant="red">
                No
              </Button>
              <Button onClick={() => handleBlock(blockUser.user_id)} variant="green">
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Modal */}
      {unblockUser && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
              <h2 className="text-lg font-bold text-black mb-4">
                Unblock <span className="text-red-600">&quot;{unblockUser.username}&quot;</span>?
              </h2>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setUnblockUser(null)} variant="red">
                No
              </Button>
              <Button
                onClick={() => handleUnblock(unblockUser.user_id)}
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
