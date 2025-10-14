import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a new order
export async function POST(request: NextRequest) {
  try {
  const { session_id, payment_method, table_number } = await request.json();
  console.log('Request body:', { session_id, payment_method, table_number });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
          // Create a new active customer and bind session_id
          const { data: newCustomer, error: customerCreateError } = await supabase
            .from('customer')
            .insert({
              table_num: tableNum,
              is_active: true,
              session_id
            })
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

    // First, get the cart_id for this session
    const { data: cartData, error: cartError } = await supabase
      .from("cart")
      .select("cart_id")
      .eq("session_id", session_id)
      .eq("checked_out", false)
      .single();

    if (cartError || !cartData) {
      console.error("Cart error:", cartError);
      return NextResponse.json(
        { error: "No active cart found for this session" },
        { status: 404 }
      );
    }

    const cart_id = cartData.cart_id;

    // Insert into order table (focused on status tracking)
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
      { order: orderData, message: "Order created successfully" },
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
                menuitem (
                  name
                )
              )
            )
          `)
          .eq("customer_id", customer.customer_id)
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
                menuitem (
                  name
                )
              )
            )
          `)
          .in("cart_id", cartIds)
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
              menuitem (
                name
              )
            )
          )
        `)
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

    type OrderItem = { item_name: string; quantity: number; note?: string | null };
    type OrderRow = {
      order_id: number | string;
      isfinished: boolean;
      iscancelled: boolean;
      customer_id: number | null;
      time_ordered: string;
      payment_type: string;
      cart?: { table_number?: number | null; cartitem?: Array<{ quantity: number; note?: string | null; menuitem?: { name?: string | null } | null }> } | null;
    };
    const transformedOrders = ((orders as unknown as OrderRow[]) || []).map((order) => ({
      order_id: order.order_id.toString(),
      status: order.iscancelled ? "cancelled" : order.isfinished ? "finished" : "preparing",
      customer_id: order.customer_id,
      time_ordered: order.time_ordered,
      payment_type: order.payment_type,
      table_number: order.cart?.table_number ?? null,
      items: (order.cart?.cartitem || []).map((item): OrderItem => ({
        item_name: item.menuitem?.name || 'Unknown Item',
        quantity: item.quantity,
        note: item.note ?? null,
      }))
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
