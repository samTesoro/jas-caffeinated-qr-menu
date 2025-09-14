import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { isfinished } = body;
    const { id: orderId } = await params;

    const supabase = await createClient();

    const { error } = await supabase
      .from('order')
      .update({ isfinished })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in order PATCH API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}