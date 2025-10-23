"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut(); // Logs the user out
      router.push("/auth/login"); // Redirects to the login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 transition-colors z-50 relative"
    >
      {/* Logout Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-200 hover:stroke-red-700"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}
