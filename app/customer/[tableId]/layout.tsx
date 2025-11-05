"use client";
import { createClient } from "@/lib/supabase/client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function TableScopedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TableActiveGuard />
      {children}
    </>
  );
}

function TableActiveGuard() {
  const params = useParams();
  const tableId = (params && (params as any).tableId) as string | undefined;
  const pathname = usePathname();
  const router = useRouter();
  const lastChecked = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      // Debounce checks to at most once per 1.5s to avoid excessive calls
      const now = Date.now();
      if (now - lastChecked.current < 1500) return;
      lastChecked.current = now;

      if (!tableId) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("customer")
          .select("is_active")
          .eq("table_num", Number(tableId))
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.warn("TableActiveGuard: failed to verify table status:", error.message);
          return; // Non-fatal; don't disrupt browsing on transient errors
        }
        const isActive = data?.is_active === true;
        if (!isActive) {
          // Redirect to the entry page which shows the inactive message
          router.replace(`/customer/${tableId}`);
        }
      } catch (e) {
        if (cancelled) return;
        console.warn("TableActiveGuard: unexpected error:", e);
      }
    };

    check();
    // Also re-check when the user navigates between pages within the table scope
    // Pathname changes trigger this effect
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, tableId]);

  return null;
}
