import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a new order
export async function POST(request: NextRequest) {
  try {
    const { session_id, payment_method, table_number } = await request.json();
    console.log('Request body:', { session_id, payment_method, table_number });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find or create customer record based on table number
    let customer_id = null;
    if (table_number) {
      const tableNum = parseInt(table_number);
      
      // First, try to find an existing active customer for this table
      const { data: existingCustomer, error: customerFindError } = await supabase
        .from('customer')
        .select('customer_id')
        .eq('table_num', tableNum)
        .eq('is_active', true)
        .single();

      if (existingCustomer) {
        customer_id = existingCustomer.customer_id;
        console.log('Found existing customer:', customer_id);
      } else {
        // Create new customer record
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from('customer')
          .insert({
            table_num: tableNum,
            is_active: true
          })
          .select('customer_id')
          .single();

        if (customerCreateError) {
          console.error('Error creating customer:', customerCreateError);
        } else {
          customer_id = newCustomer.customer_id;
          console.log('Created new customer:', customer_id);
        }
      }
    }

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
        payment_type: payment_method === 'gcash' ? 'GCash' : 
                      payment_method === 'cash-card' ? 'Cash/Card' : 
                      payment_method === 'GCash' ? 'GCash' :
                      payment_method === 'Cash/Card' ? 'Cash/Card' :
                      payment_method,
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
    
    // Optimized query - only fetch necessary fields for faster load times
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
      .order('time_ordered', { ascending: true })
      .limit(50); // Limit to 50 most recent orders for better performance

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Simplified transformation for faster processing
    const transformedOrders = (orders as any[] | undefined)?.map((order) => ({
      order_id: order.order_id.toString(),
      isfinished: order.isfinished,
      customer_id: order.customer_id,
      time_ordered: order.time_ordered,
      payment_type: order.payment_type,
      table_number: order.cart?.table_number,
      items: order.cart?.cartitem?.map((item: any) => ({
        item_name: item.menuitem?.name || 'Unknown Item',
        quantity: item.quantity
      })) || []
    })) || [];

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}