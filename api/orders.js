import express from 'express';
import db from '../db'; // Adjust the path to your database connection

const router = express.Router();

// Create a new order
router.post('/api/orders', async (req, res) => {
  const { session_id, table_number, cart_items, payment_method, total_price } = req.body;

  try {
    console.log('Request body:', req.body); // Log the incoming request body

    // Insert into orders table
    const orderResult = await db.query(
      `INSERT INTO orders (session_id, table_number, payment_method, total_price, status, isfinished, date_ordered, time_ordered, created_at)
       VALUES ($1, $2, $3, $4, 'Pending', false, CURRENT_DATE, CURRENT_TIME, NOW()) RETURNING *`,
      [session_id, table_number, payment_method, total_price]
    );

    console.log('Order insertion result:', orderResult.rows); // Log the result of the orders insertion

    const orderId = orderResult.rows[0].order_id;

    // Ensure cart_items is an array and contains valid data
    if (!Array.isArray(cart_items) || cart_items.length === 0) {
      throw new Error('Invalid cart_items data');
    }

    // Insert into order_items table
    const orderItemsQueries = cart_items.map(item => {
      if (!item.menuitem_id || !item.quantity || !item.subtotal_price) {
        throw new Error('Invalid cart item structure');
      }
      console.log('Inserting order item:', item); // Log each order item being inserted
      return db.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, subtotal_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.menuitem_id, item.quantity, item.subtotal_price]
      );
    });

    await Promise.all(orderItemsQueries);

    console.log('All order items inserted successfully'); // Log successful insertion of order items

    res.status(201).json({ order: orderResult.rows[0], message: 'Order created successfully' });
  } catch (error) {
    console.error('Error inserting order or order items:', error); // Log the error
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Fetch all pending orders
router.get('/api/orders', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM orders WHERE status = 'Pending'`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update the status of an order
router.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`,
      [status, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
