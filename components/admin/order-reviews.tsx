import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
// Clear functionality removed; no Button import needed
import { ChevronLeft, ChevronRight } from "lucide-react";
interface ReviewListProps {
  permissions: {
    view_menu: boolean;
    view_orders: boolean;
    view_super: boolean;
    view_history: boolean;
    view_reviews: boolean;
  };
  start?: string; // YYYY-MM-DD
  end?: string;   // YYYY-MM-DD
}

export default function ReviewList({ permissions, start, end }: ReviewListProps) {
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
  // Clear functionality removed; always show all reviews
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      const supabase = createClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from("reviews")
        .select("id, rating, comment, created_at, table_id, session_id", {
          count: "exact",
        })
        .order("created_at", { ascending: false });

      // Apply inclusive date range if provided (YYYY-MM-DD on created_at date part)
      if (start && start.length >= 10) {
        // Include entire start day at 00:00:00
        query = query.gte("created_at", `${start}T00:00:00`);
      }
      if (end && end.length >= 10) {
        // Include entire end day up to 23:59:59
        query = query.lte("created_at", `${end}T23:59:59.999`);
      }

      const { data, error, count } = await query.range(from, to);
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
  }, [permissions.view_reviews, page, pageSize, start, end]);

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
      {/* Removed extra empty heading row */}
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
                <span className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {review.rating}/5
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Pagination: numeric pages + Next */}
      <div className="flex items-center justify-center gap-2 mt-4 select-none">
        <button
          className="flex items-center gap-1 text-black hover:underline disabled:opacity-50 mr-2"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={reviewsLoading || page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {(() => {
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          const startPage = Math.max(
            1,
            Math.min(page - 4, Math.max(1, totalPages - 9))
          );
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
                className={
                  isActive
                    ? "text-black bg-[#E59C53] px-3 py-1 rounded-full font-semibold"
                    : "text-black px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100"
                }
              >
                {current}
              </button>
            );
          });
        })()}

        <button
          className="flex items-center gap-1 text-black hover:underline disabled:opacity-50 ml-2"
          onClick={() => setPage((p) => p + 1)}
          disabled={
            reviewsLoading || page >= Math.max(1, Math.ceil(total / pageSize))
          }
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Clear functionality removed */}
    </div>
  );
}
