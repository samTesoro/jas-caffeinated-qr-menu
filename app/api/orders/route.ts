import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const runtime = 'nodejs';

// Create a new order
export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { session_id, payment_method, table_number, menu_items, total_price } = body || {};
  console.log('Request body:', { session_id, payment_method, table_number, menu_items_count: Array.isArray(menu_items) ? menu_items.length : 0 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Guard: Table must be active before allowing order creation
    const tableNum = table_number !== undefined && table_number !== null && `${table_number}` !== ""
      ? parseInt(String(table_number), 10)
      : NaN;
    if (!Number.isFinite(tableNum)) {
      return NextResponse.json({ error: "Table number is required" }, { status: 400 });
    }
    {
      const { data: trow, error: tErr } = await supabase
        .from('customer')
        .select('is_active')
        .eq('table_num', tableNum)
        .maybeSingle();
      if (tErr) {
        console.error('Failed to verify table active state:', tErr);
        return NextResponse.json({ error: 'Failed to verify table status' }, { status: 500 });
      }
      const isActive = trow?.is_active === true;
      if (!isActive) {
        return NextResponse.json({ error: 'Table is inactive. Please ask staff for assistance.' }, { status: 403 });
      }
    }

    // Find or create customer record using session_id, fallback to table_number
    let customer_id = null;
  if (session_id) {
      // Prefer session binding: one customer per session_id
      const { data: bySession } = await supabase
        .from('customer')
        .select('customer_id')
        .eq('session_id', session_id)
        .eq('is_active', true)
        .maybeSingle();

      if (bySession && bySession.customer_id) {
        customer_id = bySession.customer_id;
      } else if (table_number) {
        const tableNum = parseInt(table_number);
        // If none by session, reuse active by table, otherwise create
        const { data: existingCustomer } = await supabase
          .from('customer')
          .select('customer_id')
          .eq('table_num', tableNum)
          .eq('is_active', true)
          .maybeSingle();

        if (existingCustomer && existingCustomer.customer_id) {
          customer_id = existingCustomer.customer_id;
          // Attach session_id to this customer if not already set
          await supabase
            .from('customer')
            .update({ session_id })
            .eq('customer_id', customer_id)
            .is('session_id', null);
        } else {
          // Do NOT create a new customer when table is inactive; guard above ensures table is active.
          // If none exists, create a new active customer and bind session_id
          const { data: newCustomer, error: customerCreateError } = await supabase
            .from('customer')
            .insert({ table_num: tableNum, is_active: true, session_id })
            .select('customer_id')
            .single();
          if (customerCreateError) {
            console.error('Error creating customer:', customerCreateError);
          } else {
            customer_id = newCustomer?.customer_id ?? null;
          }
        }
      }
    }

    // Ensure we have an open cart for this session (create if missing)
    let cart_id: number | null = null;
    {
      const { data: existingCart } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", session_id)
        .eq("checked_out", false)
        .maybeSingle();
      if (existingCart?.cart_id) {
        cart_id = existingCart.cart_id;
      } else {
        const { data: createdCart, error: createCartError } = await supabase
          .from("cart")
          .insert({
            session_id,
            total_price: 0,
            checked_out: false,
            table_number: table_number ? parseInt(table_number) : null,
            time_created: new Date().toISOString(),
          })
          .select("cart_id")
          .single();
        if (createCartError) {
          console.error("Create cart error:", createCartError);
          return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
        }
        cart_id = createdCart?.cart_id ?? null;
      }
    }

    if (!cart_id) {
      return NextResponse.json({ error: "No active cart available" }, { status: 500 });
    }

    // If menu_items provided from client, replace cartitems accordingly (single write at checkout)
    if (Array.isArray(menu_items) && menu_items.length > 0) {
      // Clear existing items for this cart
      await supabase.from("cartitem").delete().eq("cart_id", cart_id);
      // Normalize and bulk insert
      const itemsToInsert = menu_items.map((mi: any) => ({
        cart_id,
        menuitem_id: mi.menu_item_id ?? mi.menuitem_id,
        quantity: Number(mi.quantity || 0),
        subtotal_price: Number(mi.subtotal_price || 0),
        note: mi.note ?? null,
      }));
      if (itemsToInsert.length > 0) {
        const { error: insertItemsError } = await supabase
          .from("cartitem")
          .insert(itemsToInsert);
        if (insertItemsError) {
          console.error("Insert cartitems error:", insertItemsError);
          return NextResponse.json({ error: "Failed to add items to cart" }, { status: 500 });
        }
      }
      // Update cart total
      const computedTotal = itemsToInsert.reduce((s, it) => s + (it.subtotal_price || 0), 0);
      const newTotal = typeof total_price === 'number' ? total_price : computedTotal;
      await supabase.from("cart").update({ total_price: newTotal, table_number: table_number ? parseInt(table_number) : null }).eq("cart_id", cart_id);
    }

    // Insert into order table (focused on status tracking)
    const orderCreatedAt = Date.now();
    const { data: orderData, error: orderError } = await supabase
      .from("order")
      .insert({
        date_ordered: new Date().toISOString().split("T")[0], // Today's date
        time_ordered: new Date().toTimeString().split(" ")[0], // Current time
        payment_type:
          payment_method === "gcash"
            ? "GCash"
            : payment_method === "cash-card"
            ? "Cash/Card"
            : payment_method === "GCash"
            ? "GCash"
            : payment_method === "Cash/Card"
            ? "Cash/Card"
            : payment_method,
        isfinished: false,
        iscancelled: false,
        iscleared: false,
        customer_id: customer_id,
        cart_id: cart_id,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    console.log("Order insertion result:", orderData);

    // Mark the cart as checked out
    const { error: updateError } = await supabase
      .from("cart")
      .update({ checked_out: true })
      .eq("cart_id", cart_id);

    if (updateError) {
      console.error("Cart update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update cart" },
        { status: 500 }
      );
    }

    console.log("Cart marked as checked out");

    return NextResponse.json(
      { order: orderData, message: "Order created successfully", orderCreatedAt },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// Fetch all orders with cart details for order notifications
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    let orders: any[] = [];
    let error = null;
    if (sessionId) {
      // Try to find customer by sessionId
      const { data: customer } = await supabase
        .from("customer")
        .select("customer_id")
        .eq("session_id", sessionId)
        .maybeSingle();
      console.log("[orders] sessionId:", sessionId);
      console.log("[orders] found customer_id:", customer?.customer_id);
      if (customer?.customer_id) {
        // Orders for this customer
        const { data, error: orderError } = await supabase
          .from("order")
          .select(`
            order_id,
            date_ordered,
            time_ordered,
            payment_type,
            isfinished,
            iscancelled,
            customer_id,
            cart_id,
            cart!order_cart_id_fkey (
              table_number,
              cartitem (
                quantity,
                note,
                subtotal_price,
                menuitem (
                  name
                )
              )
            )
          `)
          .eq("customer_id", customer.customer_id)
          .or("iscleared.eq.false,iscancelled.eq.true")
          .order("time_ordered", { ascending: true })
          .limit(20);
        orders = data || [];
        error = orderError;
        console.log("[orders] orders for customer_id:", orders.length);
      }
      // Also find orders by cart.session_id
      const { data: carts } = await supabase
        .from("cart")
        .select("cart_id")
        .eq("session_id", sessionId);
      const cartIds = (carts || []).map((c: any) => c.cart_id);
      console.log("[orders] found cartIds:", cartIds);
      if (cartIds.length > 0) {
        const { data: cartOrders, error: cartOrderError } = await supabase
          .from("order")
          .select(`
            order_id,
            date_ordered,
            time_ordered,
            payment_type,
            isfinished,
            iscancelled,
            customer_id,
            cart_id,
            cart!order_cart_id_fkey (
              table_number,
              cartitem (
                quantity,
                note,
                subtotal_price,
                menuitem (
                  name
                )
              )
            )
          `)
          .in("cart_id", cartIds)
          .or("iscleared.eq.false,iscancelled.eq.true")
          .order("time_ordered", { ascending: true })
          .limit(20);
        if (cartOrderError) error = cartOrderError;
        console.log("[orders] orders for cartIds:", (cartOrders || []).length);
        // Merge/deduplicate orders
        const allOrders = [...orders, ...(cartOrders || [])];
        // Deduplicate by order_id
        const seen = new Set();
        orders = allOrders.filter((o) => {
          if (seen.has(o.order_id)) return false;
          seen.add(o.order_id);
          return true;
        });
        console.log("[orders] total deduped orders:", orders.length);
      }
    } else {
      // No sessionId: fallback to recent orders
      const { data, error: orderError } = await supabase
        .from("order")
        .select(`
          order_id,
          date_ordered,
          time_ordered,
          payment_type,
          isfinished,
          iscancelled,
          customer_id,
          cart_id,
          cart!order_cart_id_fkey (
            table_number,
            cartitem (
              quantity,
              note,
              subtotal_price,
              menuitem (
                name
              )
            )
          )
    `)
  .eq("iscleared", false)
  .eq("isfinished", false)
  .order("time_ordered", { ascending: true })
  .limit(20);
      orders = data || [];
      error = orderError;
    }
    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    type OrderItem = { item_name: string; quantity: number; note?: string | null; subtotal_price?: number | null };
    type OrderRow = {
      order_id: number | string;
      isfinished: boolean;
      iscancelled: boolean;
      customer_id: number | null;
      time_ordered: string;
      payment_type: string;
      cart?: { table_number?: number | null; cartitem?: Array<{ quantity: number; note?: string | null; subtotal_price?: number | null; menuitem?: { name?: string | null } | null }> } | null;
    };
    const transformedOrders = ((orders as unknown as OrderRow[]) || []).map((order) => ({
      order_id: order.order_id.toString(),
      status: order.iscancelled ? "cancelled" : order.isfinished ? "finished" : "preparing",
      iscancelled: !!order.iscancelled,
      customer_id: order.customer_id,
      time_ordered: order.time_ordered,
      payment_type: order.payment_type,
      table_number: order.cart?.table_number ?? null,
      items: (order.cart?.cartitem || []).map((item): OrderItem => ({
        item_name: item.menuitem?.name || 'Unknown Item',
        quantity: item.quantity,
        note: item.note ?? null,
        subtotal_price: item.subtotal_price ?? null,
      }))
    })).map((o) => ({
      ...o,
      order_total: Array.isArray(o.items)
        ? o.items.reduce((sum, it) => sum + (typeof it.subtotal_price === 'number' ? it.subtotal_price : 0), 0)
        : 0,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
