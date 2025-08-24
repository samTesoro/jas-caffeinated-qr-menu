<<<<<<< HEAD
import React from "react";

export default function Cart({
  cart,
  setCart,
  onClose,
  onConfirm,
}: {
  cart: any[];
  setCart: (cart: any[]) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
=======
import React from 'react';

export default function Cart({ cart, setCart, onClose, onConfirm }: { cart: any[], setCart: (cart: any[]) => void, onClose: () => void, onConfirm: () => void }) {
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
<<<<<<< HEAD
      const supabase = require("@/lib/supabase/client").createClient();
      let cart_id = null;
      if (typeof window !== "undefined") {
        cart_id = localStorage.getItem("cart_id");
      }
      // Join cartitem with menuitem for display
      const { data, error } = await supabase
        .from("cartitem")
        .select(
          "cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)"
        )
        .eq("cart_id", cart_id);
      if (error) {
        alert("Supabase fetch error: " + JSON.stringify(error));
=======
      const supabase = require('@/lib/supabase/client').createClient();
      let cart_id = null;
      if (typeof window !== 'undefined') {
        cart_id = localStorage.getItem('cart_id');
      }
      // Join cartitem with menuitem for display
      const { data, error } = await supabase
        .from('cartitem')
        .select('cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)')
        .eq('cart_id', cart_id);
      if (error) {
        alert('Supabase fetch error: ' + JSON.stringify(error));
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
      }
      setCart(data || []);
      setLoading(false);
    };
    fetchCart();
  }, []);

  const updateQty = async (cartitem_id: number, delta: number) => {
<<<<<<< HEAD
    const supabase = require("@/lib/supabase/client").createClient();
    const item = cart.find((i) => i.cartitem_id === cartitem_id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    const newSubtotal = item.menuitem.price * newQty;
    await supabase
      .from("cartitem")
      .update({ quantity: newQty, subtotal_price: newSubtotal })
      .eq("cartitem_id", cartitem_id);
    setCart(
      cart.map((i) =>
        i.cartitem_id === cartitem_id
          ? { ...i, quantity: newQty, subtotal_price: newSubtotal }
          : i
      )
    );
  };
  const removeItem = async (cartitem_id: number) => {
    const supabase = require("@/lib/supabase/client").createClient();
    setCart(cart.filter((i) => i.cartitem_id !== cartitem_id));
    await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);
=======
    const supabase = require('@/lib/supabase/client').createClient();
    const item = cart.find(i => i.cartitem_id === cartitem_id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    const newSubtotal = item.menuitem.price * newQty;
    await supabase.from('cartitem').update({ quantity: newQty, subtotal_price: newSubtotal }).eq('cartitem_id', cartitem_id);
    setCart(cart.map(i => i.cartitem_id === cartitem_id ? { ...i, quantity: newQty, subtotal_price: newSubtotal } : i));
  };
  const removeItem = async (cartitem_id: number) => {
    const supabase = require('@/lib/supabase/client').createClient();
    setCart(cart.filter(i => i.cartitem_id !== cartitem_id));
    await supabase.from('cartitem').delete().eq('cartitem_id', cartitem_id);
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
  };
  const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-6 w-80 relative">
<<<<<<< HEAD
        <button
          className="absolute top-2 left-2 text-orange-400 text-2xl"
          onClick={onClose}
        >
          ←
        </button>
        <h2 className="font-bold text-black text-xl mb-4">Cart</h2>
        <div className="mb-4">
          {cart.map((i) => (
            <div
              key={i.cartitem_id}
              className="flex items-center justify-between mb-2"
            >
              <div>
                <div className="font-bold text-black text-sm">
                  {i.menuitem?.name || "Unknown Item"}
                </div>
                <div className="text-black text-xs">₱{i.subtotal_price}.00</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="bg-gray-200 rounded w-6 h-6 text-lg"
                  onClick={() => updateQty(i.cartitem_id, -1)}
                >
                  -
                </button>
                <span className="font-bold text-black">{i.quantity}</span>
                <button
                  className="bg-gray-200 rounded w-6 h-6 text-lg"
                  onClick={() => updateQty(i.cartitem_id, 1)}
                >
                  +
                </button>
                <button
                  className="bg-red-400 text-white rounded w-6 h-6 flex items-center justify-center ml-2"
                  onClick={() => removeItem(i.cartitem_id)}
                >
=======
        <button className="absolute top-2 left-2 text-orange-400 text-2xl" onClick={onClose}>←</button>
        <h2 className="font-bold text-black text-xl mb-4">Cart</h2>
        <div className="mb-4">
          {cart.map(i => (
            <div key={i.cartitem_id} className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-black text-sm">{i.menuitem?.name || 'Unknown Item'}</div>
                <div className="text-black text-xs">₱{i.subtotal_price}.00</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-gray-200 rounded w-6 h-6 text-lg" onClick={()=>updateQty(i.cartitem_id, -1)}>-</button>
                <span className="font-bold text-black">{i.quantity}</span>
                <button className="bg-gray-200 rounded w-6 h-6 text-lg" onClick={()=>updateQty(i.cartitem_id, 1)}>+</button>
                <button className="bg-red-400 text-white rounded w-6 h-6 flex items-center justify-center ml-2" onClick={()=>removeItem(i.cartitem_id)}>
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
<<<<<<< HEAD
        <div className="font-bold text-black text-right mb-4">
          Total: ₱{total}.00
        </div>
        <div className="flex justify-center gap-7">
          <button
            className="bg-red-400 text-white rounded-full px-6 py-2 font-bold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-300 text-black rounded-full px-6 py-2 font-bold"
            onClick={onConfirm}
          >
            Confirm
          </button>
=======
        <div className="font-bold text-black text-right mb-4">Total: ₱{total}.00</div>
        <div className="flex justify-center gap-7">
          <button className="bg-red-400 text-white rounded-full px-6 py-2 font-bold" onClick={onClose}>Cancel</button>
          <button className="bg-green-300 text-black rounded-full px-6 py-2 font-bold" onClick={onConfirm}>Confirm</button>
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
        </div>
      </div>
    </div>
  );
}
