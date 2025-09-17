
"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useParams } from "next/navigation";

export default function CustomerTableEntry() {
  const router = useRouter();
  const params = useParams();
  const tableId = params?.tableId as string;
  useEffect(() => {
    if (!tableId) return;
    let sessionId = typeof window !== "undefined" ? sessionStorage.getItem("session_id") : null;
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem("session_id", sessionId);
    }
<<<<<<< HEAD
    if (tableId) checkTable();
  }, [tableId, supabase]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isActive)
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">
        This table is inactive. Please contact a staff member.
      </div>
    );
  return <CustomerMenu tableId={String(tableId)} />;
=======
    // Always redirect to the session route, do not create a cart here
    router.replace(`/customer/${tableId}/session/${sessionId}`);
  }, [tableId, router]);
  return null;
>>>>>>> 7137e7fe9453f573fb92e3a0a69c0333ec43334c
}
