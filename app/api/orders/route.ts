import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a new order
export async function POST(request: NextRequest) {
  try {
    const { session_id, payment_method, customer_id } = await request.json();
    console.log('Request body:', { session_id, payment_method, customer_id });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get the cart_id for this session
    const { data: cartData, error: cartError } = await supabase
      .from('cart')
      .select('cart_id')
      .eq('session_id', session_id)
      .eq('checked_out', false)
      .single();

    if (cartError || !cartData) {
      console.error('Cart error:', cartError);
      return NextResponse.json({ error: 'No active cart found for this session' }, { status: 404 });
    }

    const cart_id = cartData.cart_id;

    // Insert into order table (focused on status tracking)
    const { data: orderData, error: orderError } = await supabase
      .from('order')
      .insert({
        date_ordered: new Date().toISOString().split('T')[0], // Today's date
        time_ordered: new Date().toTimeString().split(' ')[0], // Current time
        payment_type: payment_method,
        isfinished: false,
        customer_id: customer_id,
        cart_id: cart_id
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    console.log('Order insertion result:', orderData);

    // Mark the cart as checked out
    const { error: updateError } = await supabase
      .from('cart')
      .update({ checked_out: true })
      .eq('cart_id', cart_id);

    if (updateError) {
      console.error('Cart update error:', updateError);
      return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }

    console.log('Cart marked as checked out');

    return NextResponse.json({ order: orderData, message: 'Order created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// Fetch all orders with cart details for order notifications
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all pending orders with cart and item details - using explicit relationship
    const { data: orders, error } = await supabase
      .from('order')
      .select(`
        order_id,
        date_ordered,
        time_ordered,
        payment_type,
        isfinished,
        customer_id,
        cart_id,
        cart!order_cart_id_fkey (
          session_id,
          total_price,
          table_number,
          cartitem (
            cartitem_id,
            menuitem_id,
            quantity,
            subtotal_price,
            menuitem (
              name,
              description
            )
          )
        )
      `)
      .eq('isfinished', false)
  .order('time_ordered', { ascending: true });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Transform the data to match the expected format
    interface Item {
      cartitem_id: number;
      menuitem_id: number;
      quantity: number;
      subtotal_price: number;
      menuitem?: {
        name?: string;
        description?: string;
      };
    }
    interface Order {
      order_id: number;
      date_ordered: string;
      time_ordered: string;
      payment_type: string;
      isfinished: boolean;
      customer_id: string | number | null;
      cart_id: number;
      cart?: {
        session_id?: string;
        total_price?: number;
        table_number?: string;
        cartitem?: Item[];
      };
    }
    const transformedOrders = (orders as Order[] | undefined)?.map((order) => ({
      order_id: order.order_id,
      date_ordered: order.date_ordered,
      time_ordered: order.time_ordered,
      payment_type: order.payment_type,
      isfinished: order.isfinished,
      customer_id: order.customer_id,
      cart_id: order.cart_id,
      session_id: order.cart?.session_id,
      total_price: order.cart?.total_price || 0,
      table_number: order.cart?.table_number,
      items: order.cart?.cartitem?.map((item) => ({
        cartitem_id: item.cartitem_id,
        menuitem_id: item.menuitem_id,
        quantity: item.quantity,
        subtotal_price: item.subtotal_price,
        item_name: item.menuitem?.name || 'Unknown Item',
        item_description: item.menuitem?.description
      })) || []
    })) || [];

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
