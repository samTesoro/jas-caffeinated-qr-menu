import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Update the status of an order (mark as finished or cancelled)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isfinished, iscancelled } = await request.json();
    const orderId = params.id;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build update object based on what fields are provided
    const updateFields: { isfinished?: boolean; iscancelled?: boolean } = {};
    if (isfinished !== undefined) updateFields.isfinished = isfinished;
    if (iscancelled !== undefined) updateFields.iscancelled = iscancelled;

    const { data, error } = await supabase
      .from("order")
      .update(updateFields)
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
