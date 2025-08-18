"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      const supabase = createClient();
      const cart_id = localStorage.getItem('cart_id');
      const { data, error } = await supabase
        .from('cartitem')
        .select('cartitem_id, quantity, subtotal_price, menuitem_id, menuitem:menuitem_id (name, price, thumbnail)')
        .eq('cart_id', cart_id);
      if (error) {
        alert('Supabase fetch error: ' + JSON.stringify(error));
      }
      setCart(data || []);
      setLoading(false);
    };
    fetchCart();
  }, []);

  const updateQty = async (cartitem_id: number, delta: number) => {
  const supabase = createClient();
  const item = cart.find(i => i.cartitem_id === cartitem_id);
  if (!item) return;
  const newQty = Math.max(1, item.quantity + delta);
  const newSubtotal = item.menuitem?.price ? item.menuitem.price * newQty : 0;
  await supabase.from('cartitem').update({ quantity: newQty, subtotal_price: newSubtotal }).eq('cartitem_id', cartitem_id);
  setCart(cart.map(i => i.cartitem_id === cartitem_id ? { ...i, quantity: newQty, subtotal_price: newSubtotal } : i));
  };
  const removeItem = async (cartitem_id: number) => {
    const supabase = createClient();
    setCart(cart.filter(i => i.cartitem_id !== cartitem_id));
    await supabase.from('cartitem').delete().eq('cartitem_id', cartitem_id);
  };
  const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col">
      {/* Header */}
      <div className="relative w-full" style={{ height: '170px' }}>
        <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53]" />
        <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb]" />
        <div className="absolute top-4 right-6 text-black text-xs font-normal">Table: 06</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-caffeinated.png" alt="Logo" width={200} height={75} style={{objectFit:'contain'}} />
        </div>
      </div>
      <div className="flex-1 px-6 pb-8 pt-2 w-full max-w-md mx-auto">
        <h2 className="font-bold text-black text-2xl mb-2 mt-2">Cart</h2>
        <hr className="mb-6 border-black/30" />
        <div className="mb-4">
          {cart.map(i => (
            <div key={i.cartitem_id} className="flex items-center justify-between mb-4 bg-white rounded-xl shadow p-3">
              <img
                src={i.menuitem?.thumbnail || '/default-food.png'}
                alt={i.menuitem?.name || 'Unknown Item'}
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
              <div>
                <div className="font-bold text-black text-base">{i.menuitem?.name || 'Unknown Item'}</div>
                <div className="text-black text-xs">₱{i.subtotal_price}.00</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-gray-200 rounded w-8 h-8 text-lg" onClick={()=>updateQty(i.cartitem_id, -1)}>-</button>
                <span className="font-bold text-black text-lg">{i.quantity}</span>
                <button className="bg-gray-200 rounded w-8 h-8 text-lg" onClick={()=>updateQty(i.cartitem_id, 1)}>+</button>
                <button className="bg-red-400 text-white rounded w-8 h-8 flex items-center justify-center ml-2" onClick={()=>removeItem(i.cartitem_id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        <hr className="my-6 border-black/30" />
        <div className="font-bold text-black text-right mb-6 text-xl">Total: ₱{total}.00</div>
        <div className="flex justify-center gap-7 mb-8">
          <button className="bg-red-400 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl" onClick={()=>router.back()}>
            ←
          </button>
          <button className="bg-green-300 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl">
            ✓
          </button>
        </div>
      </div>
      {/* Responsive bottom nav or taskbar can be added here if needed */}
    </div>
  );
}
