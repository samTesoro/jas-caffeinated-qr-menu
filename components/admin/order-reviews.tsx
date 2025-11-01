import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";

interface ReviewListProps {
  permissions: {
    view_menu: boolean;
    view_orders: boolean;
    view_super: boolean;
    view_history: boolean;
    view_reviews: boolean;
  };
}

export default function ReviewList({ permissions }: ReviewListProps) {
  const [reviews, setReviews] = useState<
    Array<{
      id: number;
      rating: number;
      comment: string;
      created_at: string;
      table_id?: string;
      session_id?: string;
    }>
  >([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Local clear state removed in favor of DB-backed clear

  const [showClearModal, setShowClearModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Clear reviews (local only NOT IN DATABASE, remain in localStorage)
  const clearReviews = async () => {
    try {
      const supabase = createClient();
      // Mark ALL non-cleared reviews as cleared
      const { error } = await supabase
        .from("reviews")
        .update({ iscleared: true })
        .eq("iscleared", false);
      if (error) throw error;
      // Refresh UI to reflect no reviews remaining
      setPage(1);
      setReviews([]);
      setTotal(0);
    } catch (e) {
      console.error("Failed to clear reviews:", e);
    } finally {
      setShowClearModal(false);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, table_id, session_id", { count: 'exact' })
        .eq("iscleared", false)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (!error && data) {
        setReviews(data);
        setTotal(count || 0);
      } else {
        setReviews([]);
        setTotal(0);
      }
      setReviewsLoading(false);
    };
    if (permissions.view_reviews) fetchReviews();
  }, [permissions.view_reviews, page, pageSize]);

  // DB-filtered: reviews already exclude cleared ones
  const filteredReviews = reviews;

  if (!permissions.view_reviews) {
    return null;
  }

  const Star = ({ filled }: { filled: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "#E5D453" : "none"}
      stroke="#000"
      strokeWidth="1"
      className="w-5 h-5 md:w-6 md:h-6"
    >
      <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
    </svg>
  );

  return (
    <div className="flex flex-col w-full min-h-screen py-3 pb-20 px-7 md:px-24 lg:px-[300px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          View Reviews
        </h2>
        <button
          onClick={() => setShowClearModal(true)}
          disabled={Math.max(0, total) === 0}
          className={`bg-[#d9d9d9] hover:bg-red-500 transition-colors px-3 border text-black text-md md:text-lg ${
            Math.max(0, total) === 0
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : ""
          }`}
        >
          Clear
        </button>
      </div>
      <hr className="border-black my-2" />
      {/* Table header */}
      <div className="grid grid-cols-[1fr_3.5fr_1fr] gap-2 font-semibold text-black text-sm md:text-lg lg:text-xl">
        <div className="text-center">Date/Time</div>
        <div className="text-center">Review</div>
        <div className="text-center">Rating</div>
      </div>
      <hr className="border-black my-2" />
      {/* Reviews */}
      {reviewsLoading ? (
        <p className="text-center text-sm text-gray-600 py-4">
          Loading reviews...
        </p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">
          No reviews yet.
        </p>
      ) : (
        filteredReviews.map((review) => {
          const dateObj = new Date(review.created_at);
          const date = dateObj.toLocaleDateString();
          const time = dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={review.id}
              className="grid grid-cols-[1fr_3.5fr_1fr] gap-2 text-black text-sm md:text-lg items-center border-b border-gray-200 py-2"
            >
              {/* Date/Time */}
              <div className="flex flex-col items-center">
                <span>{date}</span>
                <span>{time}</span>
              </div>
              {/* Review */}
              <div
                className="text-center break-words px-2 whitespace-pre-line overflow-wrap break-word"
                style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
              >
                {review.comment}
              </div>
              {/* Rating */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} filled={idx < Math.round(review.rating)} />
                  ))}
                </div>
                <span className="text-[10px] md:text-xs text-gray-500 mt-1">{review.rating}/5</span>
              </div>
            </div>
          );
        })
      )}

      {/* Pagination: numeric pages + Next */}
      <div className="flex items-center justify-center gap-2 mt-4 select-none">
        {(() => {
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          const startPage = Math.max(1, Math.min(page - 4, Math.max(1, totalPages - 9)));
          const endPage = Math.min(totalPages, startPage + 9);
          const count = endPage - startPage + 1;
          return Array.from({ length: count }).map((_, idx) => {
            const current = startPage + idx;
            const isActive = current === page;
            return (
              <button
                key={current}
                onClick={() => setPage(current)}
                disabled={isActive || reviewsLoading}
                className={isActive ? "text-black font-semibold px-1" : "text-blue-600 hover:underline px-1"}
              >
                {current}
              </button>
            );
          });
        })()}
        <button
          className="text-blue-600 hover:underline disabled:opacity-50 ml-2"
          onClick={() => setPage((p) => p + 1)}
          disabled={reviewsLoading || page >= Math.max(1, Math.ceil(total / pageSize))}
        >
          Next
        </button>
      </div>
      {/* Confirm Clear Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Clear all reviews?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowClearModal(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={clearReviews}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
