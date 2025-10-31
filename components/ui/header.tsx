"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  mode?: "admin" | "customer";
  username?: string | null;
  tableId?: string;
}

export default function DashboardHeader({
  mode = "admin",
  username = null,
  tableId,
}: DashboardHeaderProps) {
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(
    username,
  );

  useEffect(() => {
    // Only resolve username automatically for admin mode when not provided via props
    if (mode !== "admin" || username) return;

    try {
      // Prefer cached username if available to avoid an extra query
      const cached = typeof window !== "undefined" && localStorage.getItem("username");
      if (cached) {
        setResolvedUsername(cached);
        return;
      }

      const adminId =
        typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
      if (!adminId) return;

      const supabase = createClient();
      (async () => {
        try {
          const { data } = await supabase
            .from("adminusers")
            .select("username")
            .eq("user_id", adminId)
            .single();
          if (data?.username) {
            setResolvedUsername(data.username);
            try {
              localStorage.setItem("username", data.username);
            } catch {}
          }
        } catch {}
      })();
    } catch {}
  }, [mode, username]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 mb-8">
        {/* Orange and Gray Split Background */}
        <div className="relative w-full" style={{ height: "170px" }}>
          <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb] pointer-events-none" />

          {/* Username or Table Label */}
          <div className="absolute top-4 right-6 text-black text-xs font-normal z-40">
            {" "}
            {mode === "admin"
              ? resolvedUsername
                ? resolvedUsername
                : "Admin"
              : tableId
              ? `Table: ${tableId}`
              : "Customer"}
          </div>

          {/* Logout button removed from header (now shown in taskbar) */}

          {/* Centered Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            {" "}
            <Image
              src="/logo-caffeinated.png"
              alt="J.A.S. Caffeinated Logo"
              width={200}
              height={75}
              priority
            />
          </div>
        </div>
      </header>

      <div style={{ height: "170px" }} />
    </>
  );
}
