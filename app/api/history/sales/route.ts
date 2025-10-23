import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = 'nodejs';

// GET /api/history/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
// Returns: { totalSales: number, items: { name: string, quantity: number, sales: number }[] }
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    // 1) Get eligible orders (finished, not cancelled, in date range)
    let orderQuery = supabase
      .from('order')
      .select('order_id, cart_id, date_ordered')
      .eq('isfinished', true)
      .eq('iscancelled', false);

    if (from) orderQuery = orderQuery.gte('date_ordered', from);
    if (to) orderQuery = orderQuery.lte('date_ordered', to);

    const { data: orders, error: ordersError } = await orderQuery;
    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    const cartIds = (orders || []).map((o: any) => o.cart_id).filter((id: any) => id != null);
    if (cartIds.length === 0) {
      return NextResponse.json({ totalSales: 0, items: [] });
    }

    // 2) Fetch cart items for those carts and join menu item
    const { data: cartitems, error: itemsError } = await supabase
      .from('cartitem')
      .select('quantity, subtotal_price, menuitem:menuitem_id ( menuitem_id, name )')
      .in('cart_id', cartIds);
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 3) Aggregate totals
    let totalSales = 0;
    const perItem = new Map<string, { name: string; quantity: number; sales: number }>();
    for (const ciRaw of (cartitems || []) as any[]) {
      const qty = Number(ciRaw?.quantity) || 0;
      const sales = Number(ciRaw?.subtotal_price) || 0;
      const name: string = ciRaw?.menuitem?.name || 'Unknown Item';
      totalSales += sales;
      const key = name;
      const curr = perItem.get(key) || { name, quantity: 0, sales: 0 };
      curr.quantity += qty;
      curr.sales += sales;
      perItem.set(key, curr);
    }

    const items = Array.from(perItem.values()).sort((a, b) => b.sales - a.sales);
    return NextResponse.json({ totalSales, items });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to compute sales report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
