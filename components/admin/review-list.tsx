import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";


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
  const [reviews, setReviews] = useState<Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    table_id?: string;
    session_id?: string;
  }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [clearedIds, setClearedIds] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('clearedReviewIds');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Clear reviews (local only NOT IN DATABASE, remain in localStorage)
  const clearReviews = () => {
    const ids = reviews.map(r => r.id);
    setClearedIds(ids);
    localStorage.setItem('clearedReviewIds', JSON.stringify(ids));
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, table_id, session_id")
        .order("created_at", { ascending: false });
      if (!error && data) setReviews(data);
      setReviewsLoading(false);
    };
    if (permissions.view_reviews) fetchReviews();
  }, [permissions.view_reviews]);

  // When reviews update, keep only new reviews if cleared
  const filteredReviews = reviews.filter(r => !clearedIds.includes(r.id));

  if (!permissions.view_reviews) {
    return null;
  }

  return (
    <div className="px-8 md:px-[500px] py-3 w-full pb-20">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">View Reviews</h2>
        <button
          onClick={clearReviews}
          className="bg-[#d9d9d9] hover:bg-red-300 transition-colors px-3 border text-black text-md md:text-lg"
        >
          Clear
        </button>
      </div>
      <hr className="border-black my-2" />
      {/* Table header */}
      <div className="grid grid-cols-[1fr_3.5fr_1fr] gap-2 font-semibold text-black text-sm md:text-lg">
        <div className="text-center">Date/Time</div>
        <div className="text-center">Review</div>
        <div className="text-center">Rating</div>
      </div>
      <hr className="border-black my-2" />
      {/* Reviews */}
      {reviewsLoading ? (
        <p className="text-center text-sm text-gray-600 py-4">Loading reviews...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">No reviews yet.</p>
      ) : (
        filteredReviews.map((review) => {
          const dateObj = new Date(review.created_at);
          const date = dateObj.toLocaleDateString();
          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={review.id} className="grid grid-cols-[1fr_3.5fr_1fr] gap-2 text-black text-sm md:text-lg items-center border-b border-gray-200 py-2">
              {/* Date/Time */}
              <div className="flex flex-col items-center">
                <span>{date}</span>
                <span>{time}</span>
              </div>
              {/* Review */}
              <div className="text-center break-words px-2 whitespace-pre-line overflow-wrap break-word" style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{review.comment}</div>
              {/* Rating */}
              <div className="flex flex-col items-center">
                <span className="font-bold">{review.rating}/5</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
