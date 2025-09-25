"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function LogoutButton({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [showModal, setShowModal] = React.useState(false);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          color: "black",
        }}
      >
        {children ? children : "Logout"}
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-[250px] text-center space-y-4">
            <p className="text-md text-black font-bold mt-3">Log out?</p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={logout}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
