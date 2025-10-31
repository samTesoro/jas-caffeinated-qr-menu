import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const runtime = 'nodejs';

// Minimal estimate API: accepts ?orderId= or ?sessionId= or ?tableId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("sessionId");
    const tableId = searchParams.get("tableId");


    // Prefer service role key for server-side access, but fall back to anon key for local/dev if service key is not set.
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || (!supabaseServiceKey && !anonKey)) {
      console.error("/api/estimate: missing SUPABASE env vars", { supabaseUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey, hasAnonKey: !!anonKey });
      return NextResponse.json({ error: "Server misconfiguration: SUPABASE env vars missing" }, { status: 500 });
    }

  const keyToUse = supabaseServiceKey || anonKey!;
    const supabase = createClient(supabaseUrl, keyToUse as string);

    // Helper to compute order estimate given cartitems with menuitem est fields
    const computeFromItems = (items: Array<{ quantity: number; menuitem: any }>) => {
      const capacity = 3; // parallel slots
      const perItemEstimates: number[] = [];
      let missing = false;
      for (const it of items) {
        const qty = it.quantity || 1;
        const est = (it.menuitem?.est_time ?? it.menuitem?.estimatedTime ?? 0) as number;
        if (!est) missing = true;
        for (let i = 0; i < qty; i++) perItemEstimates.push(est);
      }
      const sum = perItemEstimates.reduce((s, v) => s + v, 0);
      const maxItem = perItemEstimates.length ? Math.max(...perItemEstimates) : 0;
      const prep = Math.max(maxItem, sum / Math.max(1, capacity));
      return { prepMinutes: prep, missing, perItemEstimates };
    };

    // Fetch active orders (we'll compute per-order ETAs and optionally aggregate for session)
    const { data: activeOrdersRaw, error: activeError } = await supabase
      .from("order")
      .select(`order_id, time_ordered, customer_id, cart_id, cart!order_cart_id_fkey ( session_id, table_number, cartitem ( quantity, menuitem:menuitem_id ( est_time, name ) ) )`)
      .eq("isfinished", false)
      .eq("iscancelled", false)
      .order("time_ordered", { ascending: true });
    if (activeError) throw activeError;
    const activeOrders = (activeOrdersRaw || []) as any[];

    // Helper: compute prepMinutes for each order and store on object
    for (const o of activeOrders) {
      const items = (o as any).cart?.cartitem || [];
      const { prepMinutes } = computeFromItems(items);
      (o as any).__prepMinutes = Math.ceil(prepMinutes);
    }

    // If sessionId provided, compute conservative ETA across all orders for that session
    let targetOrder: any = null;
    if (sessionId) {
      // orders that belong to this session (by cart.session_id)
      const sessionOrders = activeOrders.filter((o) => (o as any).cart?.session_id === sessionId);
      if (sessionOrders.length === 0) {
        // fall back to finding a single most recent order (existing behavior)
        const { data, error } = await supabase
          .from("order")
          .select(`order_id, time_ordered, cart!order_cart_id_fkey ( session_id, table_number, cartitem ( quantity, menuitem:menuitem_id ( est_time, name ) ) )`)
          .eq("isfinished", false)
          .eq("iscancelled", false)
          .order("time_ordered", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        targetOrder = data;
      } else {
        // compute ETA for each session order using the activeOrders list
        const etas: number[] = [];
        for (const so of sessionOrders) {
          // queue delay = sum prepMinutes of active orders before this order
          let q = 0;
          for (const o of activeOrders) {
            if (o.order_id === so.order_id) break;
            q += (o as any).__prepMinutes || 0;
          }
          const eta = q + ((so as any).__prepMinutes || 0);
          etas.push(Math.ceil(eta));
        }
        const allDone = Math.max(...etas);
        // set a synthetic targetOrder that represents the session aggregate
        targetOrder = { order_id: `session-${sessionId}`, __prepMinutes: Math.max(...sessionOrders.map((s) => (s as any).__prepMinutes || 0)), __allDoneMinutes: allDone };
      }
    } else if (orderId) {
      targetOrder = activeOrders.find((o) => o.order_id == orderId) ?? null;
      if (!targetOrder) {
        const { data, error } = await supabase
          .from("order")
          .select(`order_id, time_ordered, cart!order_cart_id_fkey ( cartitem ( quantity, menuitem:menuitem_id ( est_time, name ) ) )`)
          .eq("order_id", orderId)
          .maybeSingle();
        if (error) throw error;
        targetOrder = data;
      }
    } else if (tableId) {
      // find most recent active order for table
      const { data, error } = await supabase
        .from("order")
        .select(`order_id, time_ordered, cart!order_cart_id_fkey ( table_number, cartitem ( quantity, menuitem:menuitem_id ( est_time, name ) ) )`)
        .eq("isfinished", false)
        .eq("iscancelled", false)
        .order("time_ordered", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      targetOrder = data;
    } else {
      // no identifiers — pick first active order
      targetOrder = activeOrders[0] ?? null;
    }

    if (!targetOrder) {
      return NextResponse.json({ error: "No active order found" }, { status: 404 });
    }

    const cartitems = targetOrder.cart?.cartitem || [];
    const { prepMinutes: targetPrepRaw, missing } = computeFromItems(cartitems);
    // If this is a synthetic session aggregate, prefer the precomputed all-done minutes
    const isSessionAggregate = typeof (targetOrder as any).__allDoneMinutes === "number";
    const targetPrep = isSessionAggregate ? ((targetOrder as any).__prepMinutes || 0) : targetPrepRaw;

    // Compute queue delay: sum prepMinutes of active orders older than target
    let queueDelay = 0;
    if (activeOrders && Array.isArray(activeOrders)) {
      for (const o of activeOrders) {
        // if this is the synthetic session aggregate, we should sum all active orders
        if (String(targetOrder.order_id).startsWith("session-")) {
          queueDelay += (o as any).__prepMinutes || 0;
          continue;
        }
        // skip orders until we reach the target order
        if (o.order_id === targetOrder.order_id) break;
        queueDelay += (o as any).__prepMinutes || 0;
      }
    }
  // Compute estimated as the single slowest order's prepMinutes (max per-order prep), not queue sums
    let maxPrep = 0;
    if (sessionId) {
      const sessionOrders = activeOrders.filter((o) => (o as any).cart?.session_id === sessionId);
      if (sessionOrders.length > 0) {
        maxPrep = Math.max(...sessionOrders.map((s) => (s as any).__prepMinutes || 0));
      } else {
        // fallback to the target order's prep
        maxPrep = (targetOrder as any).__prepMinutes || targetPrep || 0;
      }
    } else if (orderId) {
      maxPrep = (targetOrder as any).__prepMinutes || targetPrep || 0;
    } else if (activeOrders && Array.isArray(activeOrders) && activeOrders.length > 0) {
      maxPrep = Math.max(...activeOrders.map((o) => (o as any).__prepMinutes || 0));
    } else {
      maxPrep = targetPrep || 0;
    }

  const estimated = Math.max(1, Math.ceil(maxPrep));
  const upper = Math.ceil(estimated * 1.3) + 1;
    const response = {
      estimated,
      range: { min: estimated, max: upper },
      source: isSessionAggregate ? "base-max-item" : (orderId ? "base" : "base-max-item"),
      lastUpdated: new Date().toISOString(),
      confidence: missing ? 0.5 : 0.9,
      queueDelayMinutes: Math.ceil(queueDelay),
      prepMinutes: Math.ceil(maxPrep),
      orderId: targetOrder.order_id,
    };

  return NextResponse.json(response);
  } catch (err) {
    let msg: string;
    if (err instanceof Error) msg = err.message;
    else if (typeof err === "object") {
      try {
        msg = JSON.stringify(err);
      } catch {
        msg = String(err);
      }
    } else msg = String(err);

    console.error("/api/estimate error:", err);
    // In dev, return the real error message (stringified) to help debugging
    return NextResponse.json({ error: `Failed to compute estimate: ${msg}` }, { status: 500 });
  }
}
