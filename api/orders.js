import express from 'express';
import db from '../db'; // Adjust the path to your database connection

const router = express.Router();

// Create a new order
router.post('/api/orders', async (req, res) => {
  const { session_id, payment_method, customer_id } = req.body;

  try {
    console.log('Request body:', req.body); // Log the incoming request body

    // First, get the cart_id for this session
    const cartResult = await db.query(
      `SELECT cart_id FROM cart WHERE session_id = $1 AND checked_out = false`,
      [session_id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active cart found for this session' });
    }

    const cart_id = cartResult.rows[0].cart_id;

    // Insert into order table (focused on status tracking)
    const orderResult = await db.query(
      `INSERT INTO "order" (date_ordered, time_ordered, payment_type, isfinished, customer_id, cart_id)
       VALUES (CURRENT_DATE, CURRENT_TIME, $1, false, $2, $3) RETURNING *`,
      [payment_method, customer_id, cart_id]
    );

    console.log('Order insertion result:', orderResult.rows); // Log the result of the order insertion

    // Mark the cart as checked out
    await db.query(
      `UPDATE cart SET checked_out = true WHERE cart_id = $1`,
      [cart_id]
    );

    console.log('Cart marked as checked out'); // Log successful cart update

    res.status(201).json({ order: orderResult.rows[0], message: 'Order created successfully' });
  } catch (error) {
    console.error('Error creating order:', error); // Log the error
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Fetch all orders with cart details for order notifications
router.get('/api/orders', async (req, res) => {
  try {
    // Join order table with cart and cartitem tables to get complete order information
    const result = await db.query(`
      SELECT 
        o.order_id,
        o.date_ordered,
        o.time_ordered,
        o.payment_type,
        o.isfinished,
        o.customer_id,
        c.cart_id,
        c.session_id,
        c.total_price,
        c.table_number,
        ci.cartitem_id,
        ci.menuitem_id,
        ci.quantity,
        ci.subtotal_price,
        mi.name as item_name,
        mi.description as item_description
      FROM "order" o
      JOIN cart c ON o.cart_id = c.cart_id
      LEFT JOIN cartitem ci ON c.cart_id = ci.cart_id
      LEFT JOIN menu_item mi ON ci.menuitem_id = mi.menuitem_id
      WHERE o.isfinished = false
      ORDER BY o.order_id, ci.cartitem_id
    `);
    
    // Group results by order_id to structure the response properly
    const orders = {};
    result.rows.forEach(row => {
      if (!orders[row.order_id]) {
        orders[row.order_id] = {
          order_id: row.order_id,
          date_ordered: row.date_ordered,
          time_ordered: row.time_ordered,
          payment_type: row.payment_type,
          isfinished: row.isfinished,
          customer_id: row.customer_id,
          cart_id: row.cart_id,
          session_id: row.session_id,
          total_price: row.total_price,
          table_number: row.table_number,
          items: []
        };
      }
      
      if (row.cartitem_id) {
        orders[row.order_id].items.push({
          cartitem_id: row.cartitem_id,
          menuitem_id: row.menuitem_id,
          quantity: row.quantity,
          subtotal_price: row.subtotal_price,
          item_name: row.item_name,
          item_description: row.item_description
        });
      }
    });
    
    res.status(200).json(Object.values(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update the status of an order (mark as finished)
router.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { isfinished } = req.body;

  try {
    const result = await db.query(
      `UPDATE "order" SET isfinished = $1 WHERE order_id = $2 RETURNING *`,
      [isfinished, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
