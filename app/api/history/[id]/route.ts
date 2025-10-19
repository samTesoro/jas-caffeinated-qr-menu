import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id: orderId } = await params;
		const { data, error } = await supabase
			.from("order")
			.select(`order_id, date_ordered, time_ordered, isfinished, cart:cart_id (table_number, cartitem (quantity, menuitem (name)))`)
			.eq("order_id", orderId)
			.eq("isfinished", true)
			.eq("iscancelled", false)
			.or('iscleared.is.false,iscleared.is.null')
			.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	return NextResponse.json(data ?? {});
}
