"use client";
import React from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  orderId?: string;
  sessionId?: string | null;
  tableId?: string | null;
}

export default function EstimatedTimeDisplay({ orderId, sessionId, tableId }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [estimate, setEstimate] = React.useState<number | null>(null);
  const [range, setRange] = React.useState<{ min: number; max: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    const firstLoad = { current: true } as { current: boolean };
    const fetchEstimate = async () => {
      // Only show loading UI on the first load to avoid flicker during polling
      if (firstLoad.current) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (orderId) params.set("orderId", orderId);
        if (sessionId) params.set("sessionId", sessionId);
        if (tableId) params.set("tableId", tableId);
        const res = await fetch(`/api/estimate?${params.toString()}`);
        const contentType = res.headers.get("content-type") || "";
        let data: any = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = { error: await res.text() };
        }
          if (!res.ok) {
            const msg = data?.error || `Status ${res.status}`;
            throw new Error(msg);
          }
        if (!active) return;
        if (data && data.estimated) {
          setEstimate(data.estimated);
          setRange(data.range ?? null);
        } else {
          setError("No estimate available");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error fetching estimate";
        console.error("EstimatedTime fetch error:", msg);
        setError(msg);
          // attempt client-side fallback: compute from cart/session
          try {
            const supabase = createClient();
            const session_id = sessionId || sessionStorage.getItem("session_id") || sessionStorage.getItem("sessionId");
            let cart_id: any = null;
            if (session_id) {
              const { data: cartData } = await supabase
                .from("cart")
                .select("cart_id")
                .eq("session_id", session_id)
                .eq("checked_out", false)
                .order("time_created", { ascending: false })
                .maybeSingle();
              cart_id = cartData?.cart_id;
            }
            if (cart_id) {
              const { data: items } = await supabase
                .from("cartitem")
                .select("quantity, menuitem:menuitem_id ( est_time, estimatedTime )")
                .eq("cart_id", cart_id);
              const cartItems = (items || []).map((it: any) => ({ quantity: it.quantity || 1, menuitem: (it.menuitem && it.menuitem[0]) || it.menuitem }));
              if (cartItems.length > 0) {
                // compute using same heuristic as server
                const capacity = 3;
                const perItemEstimates: number[] = [];
                for (const it of cartItems) {
                  const qty = it.quantity || 1;
                  const est = (it.menuitem?.est_time ?? it.menuitem?.estimatedTime ?? 0) as number;
                  for (let i = 0; i < qty; i++) perItemEstimates.push(est || 0);
                }
                const sum = perItemEstimates.reduce((s, v) => s + v, 0);
                const maxItem = perItemEstimates.length ? Math.max(...perItemEstimates) : 0;
                const prep = Math.max(maxItem, sum / Math.max(1, capacity));
                const estimatedFallback = Math.max(1, Math.ceil(prep));
                setEstimate(estimatedFallback);
                setRange({ min: estimatedFallback, max: Math.ceil(estimatedFallback * 1.3) + 1 });
                setError(null);
              }
            }
          } catch (fallbackErr) {
            console.error("EstimatedTime fallback error:", fallbackErr);
          }
      } finally {
        if (active && firstLoad.current) {
          setLoading(false);
          firstLoad.current = false;
        }
      }
    };
    fetchEstimate();
    const id = setInterval(fetchEstimate, 30_000); // refresh every 30s
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [orderId, sessionId, tableId]);

  // Show loading only if we have no estimate yet. If we have a prior estimate, keep displaying it while refreshing in background.
  if (loading && estimate == null) {
    return <span className="text-base text-gray-700 text-center mb-6 block">Estimating time…</span>;
  }
  if (error && estimate == null) {
    return <span className="text-base text-gray-700 text-center mb-6 block">Est. unavailable</span>;
  }
  if (estimate != null && range) {
    if (range.min === range.max) {
      return (
        <span className="text-base text-gray-700 text-center mb-6 block">Est. time: ~{estimate} min</span>
      );
    }
    return (
      <span className="text-base text-gray-700 text-center mb-6 block">Est. time: ~{range.min}–{range.max} min</span>
    );
  }
  
  return null;
}
