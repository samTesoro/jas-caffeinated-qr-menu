"use client";

import { useState } from "react";

interface Review {
  id: string;
  datetime: string;
  review: string;
  rating: number;
}

export default function OrderReviews() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      datetime: "5/2/2025 8:13 PM",
      review:
        "The food is decent. The ambience is nice. Please improve service time",
      rating: 3,
    },
    {
      id: "2",
      datetime: "5/1/2025 2:53 PM",
      review: "Excellent food quality. Good service. Very nice ambience.",
      rating: 5,
    },
  ]);

  const clearReviews = () => setReviews([]);

  return (
    <div className="px-8 md:px-[500px] py-3 w-full pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          View Reviews
        </h2>
        <button
          onClick={clearReviews}
          className="bg-[#d9d9d9] hover:bg-red-300 transition-colors px-3 border text-black text-md md:text-lg"
        >
          Clear
        </button>
      </div>

      <hr className="border-black my-2" />

      {/* Table header */}
      <div className="grid grid-cols-[100px_2fr_70px] md:grid-cols-[2fr_5fr_1fr] gap-0 md:gap-10 font-semibold text-black text-sm md:text-lg">
        <div className="text-center">Date/Time</div>
        <div className="text-center">Review</div>
        <div className="text-center">Rating</div>
      </div>

      <hr className="border-black my-2" />

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-4">
          No reviews available.
        </p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="mb-2">
            <div className="grid grid-cols-[100px_2fr_70px] md:grid-cols-[2fr_4fr_1fr] gap-0 md:gap-10 text-black text-sm md:text-lg">
              {/* Date + Time (split into 2 lines) */}
              <div className="flex justify-center items-center text-center">
                <div className="flex flex-col">
                  <span>{r.datetime.split(" ")[0]}</span> {/* date */}
                  <span>
                    {r.datetime.split(" ")[1]} {r.datetime.split(" ")[2]}
                  </span>
                </div>
              </div>

              {/* Review text */}
              <div className="flex items-center">
                <p className="px-2">“{r.review}”</p>
              </div>

              {/* Rating */}
              <div className="flex justify-center items-center">
                {r.rating}/5
              </div>
            </div>

            <hr className="border-black my-2" />
          </div>
        ))
      )}
    </div>
  );
}
