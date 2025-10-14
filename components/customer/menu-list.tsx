
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import MenuItemCard from "../ui/menu-item-card";
import ItemDetailModal from "./item-detail-modal";
import NotificationModal from "./notification-modal"; // ✅ import
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

// Star icon SVG for reviews button
function StarIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill="#FFD600" />
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#fff"/>
    </svg>
  );
}

// Review Modal Component (above MenuList)
function ReviewModal({ onClose, tableId, sessionId }: { onClose: () => void; tableId?: string; sessionId?: string }) {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const handleStarClick = (idx: number) => setRating(idx);
  const handleStarHover = (idx: number) => setHover(idx);
  const handleStarLeave = () => setHover(0);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
  const { error } = await supabase.from("reviews").insert([
        {
          rating,
          comment: comment.trim() === "" ? null : comment,
          table_id: tableId || null,
          session_id: sessionId || null,
        },
      ]);
      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }
      onClose();
    } catch (err) {
      console.error("Review submit error:", err);
      setError((err as Error).message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 relative min-w-[340px] min-h-[260px] flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Close reviews modal"
        >
          <span style={{ fontSize: 24, fontWeight: 'bold' }}>&times;</span>
        </button>
  <h2 className="mb-3 font-bold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#000' }}>Leave us a Review</h2>
        <div className="flex flex-row items-center mb-4">
          {[1,2,3,4,5].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleStarClick(idx)}
              onMouseEnter={() => handleStarHover(idx)}
              onMouseLeave={handleStarLeave}
              aria-label={`Rate ${idx} star${idx > 1 ? 's' : ''}`}
              className="focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={(hover || rating) >= idx ? "#E5D453" : "none"}
                stroke="#000"
                strokeWidth="1"
                className="w-10 h-10"
              >
                <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
              </svg>
            </button>
          ))}
        </div>
  <form onSubmit={handleSend} className="w-full flex flex-col items-center bg-white">
          <label className="block text-black mb-1 text-md w-full text-center font-semibold">Reviews/Comments</label>
          <textarea
            className="w-full border border-black rounded-lg p-2 mb-4 text-black bg-white placeholder-gray-400"
            rows={4}
            maxLength={150}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Don’t be shy! J.A.S. Caffeinated is always willing to improve its service for your next visit."
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <Button
            type="submit"
            variant="orange"
            className="w-full h-10 text-white font-semibold text-md mt-2 rounded-lg border-0 !bg-[#E59C53] !text-white !border-none !shadow-none hover:!bg-[#E59C53] active:!bg-[#E59C53] focus:!bg-[#E59C53]"
            style={{ border: 'none' }}
            disabled={loading || rating === 0}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}

type CartItem = { cartitem_id?: number; quantity: number; subtotal_price: number; menuitem_id: number };
interface MenuListProps {
  activeTab: string;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  sessionId?: string;
  tableId?: string;
}

export default function MenuList({
  activeTab,
  cart,
  setCart,
  sessionId,
  tableId,
}: MenuListProps) {
  type MenuItem = { menuitem_id: number; name: string; price: number; thumbnail?: string; category: string; status: string; description?: string | null };
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false); //state for modal
  const [reviewsOpen, setReviewsOpen] = useState(false); // state for reviews modal

  useEffect(() => {
    setLoading(true);
    // Only reset local search when switching tabs if there is no active search
    if (search.trim() === "") {
      setSelectedItem(null);
      const supabase = createClient();
      let query = supabase
        .from("menuitem")
        .select("menuitem_id, name, price, thumbnail, category, status, description")
        .eq("status", "Available");
      if (activeTab === "Favorites") {
        query = query.eq("is_favorites", true);
      } else {
        query = query.eq("category", activeTab);
      }
      query.limit(50).then(({ data }) => {
        setMenuItems(data || []);
        console.debug('[menu-list] fetched items count:', (data || []).length, 'sample:', (data || [])[0]);
        setLoading(false);
      });
    } else {
      // If there's an active search, don't override the search-results by refetching category items
      setLoading(false);
    }
  }, [activeTab, search]); // Refetch and reset on tab change; guarded so it won't override active search results

  // Debounced server-side search across all categories when a search term exists
  useEffect(() => {
    const term = search.trim();
    if (term === "") return; // handled by the activeTab effect

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        // Search name OR description across all categories (case-insensitive)
        // Use ilike with %term%
        const ilikeTerm = `%${term.replace(/%/g, "\\%")}%`;
        const { data, error } = await supabase
          .from("menuitem")
          .select("menuitem_id, name, price, thumbnail, category, status, description")
          .eq("status", "Available")
          .or(`name.ilike.${ilikeTerm},description.ilike.${ilikeTerm}`)
          .limit(50);
        if (error) {
          console.error('[menu-list] search error', error);
          setMenuItems([]);
        } else {
          setMenuItems(data || []);
          console.debug('[menu-list] search fetched items count:', (data || []).length, 'term:', term);
        }
      } catch (err) {
        console.error('[menu-list] search exception', err);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  let filtered;
  if (search.trim() !== "") {
    const term = search.toLowerCase();
    filtered = menuItems.filter((i) =>
      (i.name || "").toLowerCase().includes(term) || (i.description || "")!.toLowerCase().includes(term)
    );
  } else {
    filtered = menuItems;
  }

  return (
    <div>
      {/* Search + Category */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2 justify-center items-center">
        <div className="flex items-center gap-3 w-full">
          {/* Notification bell (left) */}
          <div
            className="relative flex items-center justify-center cursor-pointer"
            style={{ width: "45px", height: "45px" }}
            onClick={() => setNotifOpen(true)}
          >
            <div
              className="bg-gray-300 rounded-full flex items-center justify-center"
              style={{ width: "45px", height: "45px" }}
            >
              <Image
                src="/notifications-icon.png"
                alt="Notifications"
                width={25}
                height={25}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Search bar (center, flex-grow) */}
          <div className="relative w-[280px] flex-grow">
            <Search className="absolute right-4 mx-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[45px] pl-8 pr-4 py-2 rounded-3xl border-white bg-white text-sm text-black"
            />
          </div>

          {/* Reviews button (right) */}
          <button
            className="relative flex items-center justify-center cursor-pointer ml-2"
            style={{ width: "45px", height: "45px" }}
            onClick={() => setReviewsOpen(true)}
            aria-label="Open reviews"
          >
            <StarIcon className="w-[45px] h-[45px]" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading items...</div>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No items found</div>
          ) : (
            <div className="grid grid-cols-2 gap-7 sm:gap-2 place-items-center mb-40">
              {filtered.map((item) => (
                <MenuItemCard
                  key={item.menuitem_id ? String(item.menuitem_id) : item.name}
                  item={item}
                  setModalItem={setSelectedItem}
                  mode="customer"
                  onAdd={() => setSelectedItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          cart={cart}
          setCart={setCart}
          sessionId={sessionId}
          tableId={tableId}
        />
      )}

  <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} sessionId={sessionId} />
      {/* Reviews Modal */}
      {reviewsOpen && (
        <ReviewModal onClose={() => setReviewsOpen(false)} tableId={tableId} sessionId={sessionId} />
      )}
  </div>
  );
}
