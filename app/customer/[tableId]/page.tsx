"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CustomerTableEntry() {
  const router = useRouter();
  const params = useParams();
  const tableId = params?.tableId as string;
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      if (!tableId) return;
      const supabase = createClient();
      // Check if table is active; missing rows are considered inactive
      const { data, error } = await supabase
        .from("customer")
        .select("is_active")
        .eq("table_num", Number(tableId))
        .maybeSingle();
      if (error) {
        console.error("Error checking table status", error.message);
        setError("Unable to verify table status. Please try again.");
        setAllowed(false);
        return;
      }
      const isActive = data?.is_active === true;
      if (!isActive) {
        setAllowed(false);
        return;
      }
      setAllowed(true);
      let sessionId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("session_id")
          : null;
      if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem("session_id", sessionId);
      }
      router.replace(`/customer/${tableId}/session/${sessionId}`);
    };
    run();
  }, [tableId, router]);

  if (allowed === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking table status…</div>
    );
  }
  if (allowed === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-semibold text-black mb-2">Table not available</h1>
        <p className="text-gray-600 max-w-md">
          This table is currently inactive. Please contact a staff member or try another table.
        </p>
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    );
  }
  return null;
}
