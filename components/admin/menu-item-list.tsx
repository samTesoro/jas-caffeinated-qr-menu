"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Plus } from "lucide-react";
import ItemCard, {
  MenuItem as UIMenuItem,
} from "@/components/ui/menu-item-card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";

export default function MenuItemList({
  onEdit,
  refresh,
}: // setRefresh,
{
  onEdit: (item: UIMenuItem | null) => void;
  refresh: boolean;
  setRefresh: (r: boolean) => void;
}) {
  const [modalItem, setModalItem] = useState<UIMenuItem | null>(null);
  const [items, setItems] = useState<UIMenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("menuitem")
      .select("*")
      .eq("is_deleted", false)
      .then(({ data }) => {
        setItems(data || []);
        if (data) {
          const uniqueCategories = Array.from(
            new Set(data.map((item) => item.category).filter(Boolean))
          );
          setCategories(["Available", "Unavailable", ...uniqueCategories]);
        }
      });
  }, [refresh]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const tokens = query ? query.split(/\s+/) : [];
    const res = items.filter((item) => {
      const haystack = item.name.toLowerCase();
      const matchesSearch =
        tokens.length === 0 || tokens.every((t) => haystack.includes(t));

      let matchesCategory = true;
      if (category === "Available" || category === "Unavailable") {
        matchesCategory = item.status === category;
      } else if (category && category !== "All") {
        matchesCategory = item.category === category;
      }

      return matchesSearch && matchesCategory;
    });

    // Sort: Available first, then by name A–Z
    const statusRank = (s: string) => (s === "Available" ? 0 : 1);
    return res.sort((a, b) => {
      const sr = statusRank(a.status) - statusRank(b.status);
      if (sr !== 0) return sr;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
  }, [items, search, category]);

  const displayPrice = (price: number) => price.toFixed(2);

  return (
    <div>
      <div className="sm:mb-[50px] md:mb-[50px] md:px-[500px]">
        <div className="flex w-full items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-8 md:h-11 rounded-md pl-4 pr-9 bg-white text-sm text-black shadow-sm"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 w-22 md:h-11 md:w-50 shrink-0 rounded-md px-2 bg-white text-black pr-6 text-sm md:text-md shadow-sm"
          >
            <option value="">Categories</option>
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <Link href="/admin/menu/add" className="shrink-0">
            <Button
              type="button"
              variant="green"
              className="border-transparent h-8 w-8 md:h-11 md:w-11 rounded-full p-0 flex items-center justify-center shadow-sm"
              title="Add Item"
            >
              <Plus className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Menu Item Grid */}
      <div className="grid grid-cols-2 gap-7 sm:gap-2 place-items-center mb-20 md:px-[500px]">
        {filteredItems.map((item) => (
          <ItemCard
            key={item.menuitem_id}
            mode="admin"
            item={item}
            onEdit={onEdit}
            setModalItem={setModalItem}
          />
        ))}
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden={!modalItem}
        >
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative transform transition-all duration-300">
            <button
              className="absolute top-2 right-2 z-10 text-red-500 bg-white rounded-full p-2 shadow hover:bg-red-100 transition"
              title="Close"
              onClick={() => setModalItem(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={modalItem.thumbnail || "/default-food.png"}
              alt={modalItem.name}
              width={600}
              height={288}
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="font-bold text-xl mb-2 mt-3 text-black">
              {modalItem.name}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Description</span>
              <br />
              {modalItem.description || (
                <span className="italic text-gray-400"></span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-black">
                ₱{displayPrice(modalItem.price)}
              </span>
              <span
                className={`px-2 text-md rounded-sm whitespace-nowrap ${
                  modalItem.status === "Available"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {modalItem.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
