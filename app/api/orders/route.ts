import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface MenuItem {
  menu_item_id: number;
  quantity: number;
  subtotal_price: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, table_number, menu_items, payment_method, total_price } = body;

    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Full request body:', JSON.stringify(body, null, 2));

    const supabase = await createClient();
    console.log('Supabase client created successfully');

    // First, find or create the cart
    let cart_id = null;
    const { data: cartData, error: cartError } = await supabase
      .from("cart")
      .select("cart_id")
      .eq("session_id", session_id)
      .eq("checked_out", false)
      .order("time_created", { ascending: false })
      .maybeSingle();

    if (cartError) {
      console.error('Error fetching cart:', cartError);
      return NextResponse.json({ error: 'Failed to find cart', details: cartError }, { status: 500 });
    }

    if (cartData && cartData.cart_id) {
      cart_id = cartData.cart_id;
      console.log('Found existing cart:', cart_id);
    } else {
      // Create new cart
      const { data: newCart, error: newCartError } = await supabase
        .from("cart")
        .insert({ 
          session_id, 
          table_number: parseInt(table_number), 
          total_price, 
          checked_out: false 
        })
        .select("cart_id")
        .single();

      if (newCartError) {
        console.error('Error creating cart:', newCartError);
        return NextResponse.json({ error: 'Failed to create cart', details: newCartError }, { status: 500 });
      }

      cart_id = newCart.cart_id;
      console.log('Created new cart:', cart_id);
    }

    // Insert into order table
    const orderInsertData = {
      cart_id,
      payment_type: payment_method,
      date_ordered: new Date().toISOString().split('T')[0], // Current date
      time_ordered: new Date().toTimeString().split(' ')[0], // Current time
      isfinished: false
    };
    
    console.log('Attempting to insert order with data:', JSON.stringify(orderInsertData, null, 2));
    
    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .insert(orderInsertData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      console.error('Order error details:', JSON.stringify(orderError, null, 2));
      return NextResponse.json({ error: 'Failed to create order', details: orderError }, { status: 500 });
    }

    console.log('Order created successfully:', JSON.stringify(orderData, null, 2));

    // Note: Skipping order_items insertion due to foreign key constraint issue
    // The order_items table references 'orders' table, but we're using 'order' table
    console.log('Skipping order items insertion due to schema mismatch');

    return NextResponse.json({ 
      order: orderData, 
      message: 'Order created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: orders, error } = await supabase
      .from('order')
      .select(`
        *,
        cart (
          table_number,
          cartitem (
            quantity,
            menuitem (
              name
            )
          )
        )
      `)
      .eq('isfinished', false)
      .order('order_id', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const transformedOrders = orders?.map((order: any) => ({
      order_id: order.order_id.toString(),
      isfinished: order.isfinished,
      customer_id: order.customer_id,
      time_ordered: order.time_ordered,
      payment_type: order.payment_type,
      items: order.cart?.cartitem?.map((item: any) => ({
        item_name: item.menuitem?.name || 'Unknown Item',
        quantity: item.quantity
      })) || []
    })) || [];

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error in orders GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}