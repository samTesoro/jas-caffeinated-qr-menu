import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(pageSizeParam || '20', 10) || 20));

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Shapes can vary when using nested selects; we normalize dynamically.

    let query = supabase
      .from("order")
      .select(
        `order_id, date_ordered, time_ordered, isfinished, iscancelled,
         cart:cart_id(
           cartitem(
             quantity, subtotal_price,
             menuitem:menuitem_id(menuitem_id, name, price, category)
           )
         )`
      )
      .eq("isfinished", true)
      .eq("iscancelled", false);

    if (start) query = query.gte("date_ordered", start);
    if (end) query = query.lte("date_ordered", end);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const itemsMap = new Map<number, {
      menuitem_id: number;
      name: string;
      category: string;
      price: number;
      qty: number;
      subtotal: number;
    }>();

    let totalSales = 0;
    const catTotals: Record<string, number> = { Meals: 0, Drinks: 0, Coffee: 0 };

    const rows: any[] = (data as any[]) ?? [];
    for (const o of rows) {
      // Normalize cart and cartitem which Supabase may return as arrays
      const cart = Array.isArray(o.cart) ? o.cart[0] : o.cart;
      const normalizedItems: any[] = Array.isArray(cart?.cartitem)
        ? cart.cartitem
        : (cart?.cartitem ?? []);
      const cartitems = normalizedItems;
      for (const ci of cartitems) {
        const qty = Number(ci.quantity || 0);
        const subtotal = Number(ci.subtotal_price || 0);
  const mi = Array.isArray(ci.menuitem) ? ci.menuitem[0] : ci.menuitem;
        if (!mi || mi.menuitem_id == null) continue;
        const id = mi.menuitem_id;
        const name = mi.name ?? "Unknown";
        const price = Number(mi.price ?? 0);
        const categoryRaw = (mi.category ?? "").toString();
        // Normalize categories to expected labels
        const category = /meal/i.test(categoryRaw)
          ? "Meals"
          : /drink/i.test(categoryRaw)
          ? "Drinks"
          : /coffee/i.test(categoryRaw)
          ? "Coffee"
          : /dessert/i.test(categoryRaw)
          ? "Desserts"
          : categoryRaw || "Other";

        const current = itemsMap.get(id) || {
          menuitem_id: id,
          name,
          category,
          price,
          qty: 0,
          subtotal: 0,
        };
        current.qty += qty;
        current.subtotal += subtotal || qty * price;
        itemsMap.set(id, current);

        totalSales += subtotal || qty * price;
        if (catTotals[category] == null) catTotals[category] = 0;
        catTotals[category] += subtotal || qty * price;
      }
    }

    const itemsAll = Array.from(itemsMap.values())
      .filter((i) => i.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .map((i) => ({
        ...i,
        percent: totalSales > 0 ? Math.round((i.subtotal / totalSales) * 100) : 0,
      }));

    const totalItems = itemsAll.length;
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const items = itemsAll.slice(startIdx, endIdx);

    const response = {
      totalSales,
      items,
      totalItems,
      page,
      pageSize,
      summary: {
        Meals: catTotals["Meals"] || 0,
        Drinks: catTotals["Drinks"] || 0,
        Coffee: catTotals["Coffee"] || 0,
        Desserts: catTotals["Desserts"] || 0,
        Other: catTotals["Other"] || 0,
      },
    };

    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate sales report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
