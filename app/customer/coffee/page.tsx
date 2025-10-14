"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Taskbar from "@/components/customer/taskbar-customer";
import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  menuitem_id: number | string;
  name: string;
  price: number;
  thumbnail?: string | null;
  [k: string]: unknown;
};

export default function CoffeePage() {
  const [coffees, setCoffees] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function fetchCoffees() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("menuitem")
        .select("*")
        .eq("category", "Coffee")
        .eq("status", "Available");

      if (error) console.error("Error fetching coffees:", error);
      else setCoffees(data || []);
    }
    fetchCoffees();
  }, []);

  const addToCart = (item: MenuItem) => {
    const existing = JSON.parse(localStorage.getItem("cartItems") || "[]");
    existing.push(item);
    localStorage.setItem("cartItems", JSON.stringify(existing));
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] pb-24">
      <div className="grid grid-cols-2 gap-4 p-4">
        {coffees.map((meal) => (
          <div
            key={meal.menuitem_id}
            className="bg-white rounded-lg shadow p-3 flex flex-col items-center"
          >
            {meal.thumbnail ? (
              <Image
                src={meal.thumbnail}
                alt={meal.name}
                width={150}
                height={150}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-[150px] h-[150px] bg-gray-200 rounded-lg" />
            )}
            <h3 className="font-semibold mt-2">{meal.name}</h3>
            <p className="text-gray-700">₱{meal.price}</p>
            <button
              onClick={() => addToCart(meal)}
              className="bg-orange-500 text-white px-4 py-1 rounded mt-2"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <Taskbar />
    </div>
  );
}
