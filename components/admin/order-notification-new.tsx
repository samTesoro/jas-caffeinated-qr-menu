"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  order_id: string;
  status: "Pending" | "Preparing" | "Finished";
  table_number: string;
  created_at: string;
  payment_method: string;
  total_price: number;
  session_id?: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  menu_item_id: number;
  quantity: number;
  subtotal_price: number;
  menu_items?: {
    name: string;
    price: number;
  };
}

export default function OrderNotification() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch orders with their order items and menu item details
      const { data: ordersData, error: ordersError } = await supabase
        .from('order')
        .select(`
          *,
          order_items (
            *,
            menu_items (
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      console.log('Fetched orders from database:', ordersData);
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for new orders
    const supabase = createClient();
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order' }, () => {
        console.log('Order table changed, refetching...');
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const deleteOrder = (order_id: string) => {
    setOrders((prev) => prev.filter((order) => order.order_id !== order_id));
    if (selectedOrder?.order_id === order_id) {
      setSelectedOrder(null);
    }
  };

  const moveToCompleted = (order_id: string) => {
    setOrders((prev) => prev.filter((order) => order.order_id !== order_id));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebebeb] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Order Management</h1>
        
        {orders.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-lg">No orders found.</p>
            <p>Orders will appear here when customers place them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Order #{order.order_id}
                    </span>
                    <div className="text-lg font-bold">Table {order.table_number}</div>
                    {order.session_id && (
                      <div className="text-xs text-gray-500">
                        Session: {order.session_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600">
                    {formatDate(order.created_at)} at {formatTime(order.created_at)}
                  </div>
                  <div className="text-sm font-semibold">
                    Payment: {order.payment_method}
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    Total: ₱{order.total_price.toFixed(2)}
                  </div>
                </div>

                {order.order_items && order.order_items.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-semibold mb-1">Items:</div>
                    <div className="text-sm space-y-1">
                      {order.order_items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.menu_items?.name || `Item #${item.menu_item_id}`}
                          </span>
                          <span>₱{item.subtotal_price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => moveToCompleted(order.order_id)}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => deleteOrder(order.order_id)}
                    className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full m-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <strong>Order ID:</strong> {selectedOrder.order_id}
                  </div>
                  <div>
                    <strong>Table:</strong> {selectedOrder.table_number}
                  </div>
                  {selectedOrder.session_id && (
                    <div>
                      <strong>Session ID:</strong> {selectedOrder.session_id}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {selectedOrder.status}
                  </div>
                  <div>
                    <strong>Payment Method:</strong> {selectedOrder.payment_method}
                  </div>
                  <div>
                    <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
                  </div>
                  <div>
                    <strong>Time:</strong> {formatTime(selectedOrder.created_at)}
                  </div>
                  <div>
                    <strong>Total:</strong> ₱{selectedOrder.total_price.toFixed(2)}
                  </div>

                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                    <div>
                      <strong>Items:</strong>
                      <div className="mt-2 space-y-2">
                        {selectedOrder.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                            <div>
                              <div className="font-semibold">
                                {item.menu_items?.name || `Item #${item.menu_item_id}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₱{item.subtotal_price.toFixed(2)}</div>
                              <div className="text-sm text-gray-600">
                                ₱{item.menu_items?.price.toFixed(2)} each
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => {
                      moveToCompleted(selectedOrder.order_id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Mark as Complete
                  </button>
                  <button
                    onClick={() => {
                      deleteOrder(selectedOrder.order_id);
                      setSelectedOrder(null);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}