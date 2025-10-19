import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Ensure this route uses the Node.js runtime (service role + supabase-js Node APIs)
export const runtime = 'nodejs';

// Fetch finished, not-cleared orders for history view
export async function GET() {
	const supabase = createClient(supabaseUrl, supabaseAnonKey);
	const { data, error } = await supabase
		.from("order")
		.select(
			`order_id, date_ordered, time_ordered, isfinished, customer_id, cart:cart_id (table_number, cartitem (quantity, menuitem (name)))`
		)
		.eq("isfinished", true)
			.or('iscleared.is.false,iscleared.is.null')
		.eq("iscancelled", false)
		.order("date_ordered", { ascending: false })
		.order("time_ordered", { ascending: false });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	return NextResponse.json(data ?? []);
}

// Mark finished orders as cleared in bulk. Optional body: { ids?: (string|number)[] }
export async function PATCH(request: NextRequest) {
	try {
		if (!supabaseServiceKey) {
			return NextResponse.json(
				{ error: "Missing SUPABASE_SERVICE_ROLE_KEY on server. Cannot clear history without service role." },
				{ status: 500 }
			);
		}
		let ids: Array<string | number> | undefined;
		try {
			const body = await request.json();
			if (Array.isArray(body?.ids)) ids = body.ids;
		} catch {
			// no body provided; treat as clear all finished + not yet cleared
		}

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Determine which order_ids to clear
		let targetIds: Array<string | number> | undefined = ids;
		if (!targetIds || targetIds.length === 0) {
			const { data: toClear, error: findError } = await supabase
				.from('order')
				.select('order_id')
				.eq('isfinished', true)
				.eq('iscancelled', false)
				.or('iscleared.is.false,iscleared.is.null');
			if (findError) {
				return NextResponse.json({ error: findError.message }, { status: 500 });
			}
			targetIds = (toClear || []).map((r: { order_id: number | string }) => r.order_id);
		}

		if (!targetIds || targetIds.length === 0) {
			return NextResponse.json({ cleared: 0, ids: [] });
		}

		const { data, error } = await supabase
			.from('order')
			.update({ iscleared: true })
			.in('order_id', targetIds)
			.select('order_id');
		if (error) {
					return NextResponse.json({ error: error.message }, { status: 500 });
		}
			const idsCleared = (data || []).map((d: { order_id: number | string }) => d.order_id);
			return NextResponse.json({ cleared: data?.length ?? 0, ids: idsCleared });
		} catch (e) {
			const message = e instanceof Error ? e.message : "Failed to clear history";
			return NextResponse.json({ error: message }, { status: 500 });
	}
}
