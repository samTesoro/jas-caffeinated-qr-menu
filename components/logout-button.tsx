
"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "1rem 2rem",
              borderRadius: "8px",
              minWidth: "260px",
              textAlign: "center",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <p style={{ marginBottom: "1.5rem", fontSize: "1rem", fontWeight: 700, fontFamily: "Inter, sans-serif", color: "black" }}>Log out?</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  marginRight: "1rem",
                  padding: "0.75rem 2rem",
                  background: "#F96666",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  color: "black",
                  fontSize: "0.9rem",
                }}
              >
                No
              </button>
              <button
                onClick={logout}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#A7F586",
                  color: "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
