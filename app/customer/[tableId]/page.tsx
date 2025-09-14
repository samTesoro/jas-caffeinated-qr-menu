
"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useParams } from "next/navigation";

export default function CustomerTableEntry() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.tableId as string;
  useEffect(() => {
    if (!tableId) return;
    let sessionId = typeof window !== "undefined" ? sessionStorage.getItem("session_id") : null;
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem("session_id", sessionId);
    }
    // Always redirect to the session route, do not create a cart here
    router.replace(`/customer/${tableId}/session/${sessionId}`);
  }, [tableId, router]);
  return null;
}
