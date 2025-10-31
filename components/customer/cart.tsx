import React from "react";
// Optimized: local-only updates; server sync occurs at checkout

export default function Cart({
  cart,
  setCart,
  onClose,
  onConfirm,
}: {
  cart: Array<{
    cartitem_id: number;
    quantity: number;
    subtotal_price: number;
    menuitem_id: number;
    menuitem?: {
      name: string;
      price: number;
      thumbnail?: string;
    };
  }>;
  setCart: (
    cart: Array<{
      cartitem_id: number;
      quantity: number;
      subtotal_price: number;
      menuitem_id: number;
      menuitem?: {
        name: string;
        price: number;
        thumbnail?: string;
      };
    }>
  ) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedCartItem, setSelectedCartItem] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      if (Array.isArray(items)) {
        // Minimal items; detailed pricing should be provided by parent when using this component
        setCart(items as any);
      } else {
        setCart([]);
      }
<<<<<<< HEAD
      // Find the latest open cart for this customer
      if (!cart_id) {
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("cart_id")
          .eq("customer_id", customer_id)
          .eq("checked_out", false)
          .order("time_created", { ascending: false })
          .maybeSingle();
        if (cartError) {
          alert("Supabase fetch error: " + JSON.stringify(cartError));
          setCart([]);
          return;
        }
        if (cartData && cartData.cart_id) {
          cart_id = cartData.cart_id;
          localStorage.setItem("cart_id", String(cart_id));
        }
      }
      if (!cart_id) {
        setCart([]);
        return;
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
      }
      // Fix type mismatch in setCart
      const formattedData = (data || []).map((item) => {
        let menuitemObj;
        if (item.menuitem) {
          if (Array.isArray(item.menuitem)) {
            // If menuitem is an array, take the first item
            menuitemObj = item.menuitem[0]
              ? {
                  name: item.menuitem[0].name,
                  price: item.menuitem[0].price,
                  thumbnail: item.menuitem[0].thumbnail,
                }
              : undefined;
          } else {
            const mi = item.menuitem as {
              name: string;
              price: number;
              thumbnail?: string;
            };
            menuitemObj = {
              name: mi.name,
              price: mi.price,
              thumbnail: mi.thumbnail,
            };
          }
        } else {
          menuitemObj = undefined;
        }
        return {
          cartitem_id: item.cartitem_id,
          quantity: item.quantity,
          subtotal_price: item.subtotal_price,
          menuitem_id: item.menuitem_id,
          menuitem: menuitemObj,
        };
      });
      setCart(formattedData);
    };
    fetchCart();
  }, [setCart]); // Add setCart to the dependency array
=======
    } catch {
      setCart([]);
    }
  }, [setCart]);
>>>>>>> ec41832455b74630153e4550fcb22d68a8e2d1e0

  const updateQty = async (cartitem_id: number, delta: number) => {
    const i = cart.findIndex((c) => c.cartitem_id === cartitem_id);
    if (i === -1) return;
    const it = cart[i];
    const newQty = Math.max(1, it.quantity + delta);
    const price = it.menuitem?.price || 0;
    const updated = { ...it, quantity: newQty, subtotal_price: price * newQty } as any;
    const next = [...cart];
    next[i] = updated;
    setCart(next);
    try {
      const simplified = next.map((x) => ({ menuitem_id: x.menuitem_id, quantity: x.quantity }));
      localStorage.setItem("cartItems", JSON.stringify(simplified));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch {}
  };

  const removeItem = async (cartitem_id: number) => {
<<<<<<< HEAD
    const supabase = createClient();
    setCart(cart.filter((i) => i.cartitem_id !== cartitem_id));
    await supabase.from("cartitem").delete().eq("cartitem_id", cartitem_id);
    setShowConfirmModal(false);
    setSelectedCartItem(null);
=======
    const next = cart.filter((i) => i.cartitem_id !== cartitem_id);
    setCart(next);
    try {
      const simplified = next.map((x) => ({ menuitem_id: x.menuitem_id, quantity: x.quantity }));
      localStorage.setItem("cartItems", JSON.stringify(simplified));
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch {}
>>>>>>> ec41832455b74630153e4550fcb22d68a8e2d1e0
  };

  const total = cart.reduce((sum, i) => sum + (i.subtotal_price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg p-6 w-80 relative">
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
                  onClick={() => {
                    setSelectedCartItem(i.cartitem_id);
                    setShowConfirmModal(true);
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
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
        </div>
      </div>

      {/* Confirm Remove Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 z-50">
          <div className="bg-white rounded-md p-6 w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Remove this item from cart?
            </p>
            <div className="flex justify-between font-bold">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg bg-[#f87171] text-white"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => selectedCartItem && removeItem(selectedCartItem)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg bg-[#4ade80] text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
