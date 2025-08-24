"use client";

import Image from "next/image";

export interface MenuItem {
  menuitem_id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  thumbnail?: string;
  description?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  setModalItem: (item: MenuItem) => void;
  // optional admin/customer functions
  onEdit?: (item: MenuItem) => void;
  onAdd?: (item: MenuItem) => void;
  mode: "admin" | "customer";
}

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#000000"
    className="w-5 h-5 sm:w-6 sm:h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303ZM19 7l-2-2"
    />
  </svg>
);

const AddIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export default function ItemCard({
  item,
  setModalItem,
  onEdit,
  onAdd,
  mode,
}: MenuItemCardProps) {
  const displayPrice = (price: number) => price.toFixed(2);

  return (
    <div
      key={item.menuitem_id}
      className="bg-gray-100 rounded-lg shadow p-1.5 flex flex-col w-full max-w-[180px] sm:max-w-[220px] md:max-w-[500px] relative"
    >
      {/* Thumbnail */}
      <div
        className="w-full aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => setModalItem(item)}
      >
        <Image
          src={item.thumbnail || "/default-food.png"}
          alt={item.name}
          width={300}
          height={400}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-xs sm:text-sm text-black truncate">
            {item.name}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-black whitespace-nowrap">
              ₱{displayPrice(item.price)}
            </span>
            <span
              className={`px-1 sm:px-2 text-[10px] sm:text-xs rounded-sm whitespace-nowrap ${
                item.status === "Available"
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>

        {/* Mode-based Action */}
        {mode === "admin" && (
          <button
            className="bg-[#A7F586] rounded-full p-1.5 sm:p-2 flex-shrink-0 flex items-center justify-center shadow ml-2"
            onClick={() => onEdit?.(item)}
            title="Edit"
          >
            <EditIcon />
          </button>
        )}

        {mode === "customer" && (
          <button
            className="bg-orange-400 text-white rounded-full p-3 flex items-center justify-center shadow hover:bg-orange-500 transition ml-2"
            style={{ width: "36px", height: "36px" }}
            onClick={() => onAdd?.(item)}
            title="Add"
          >
            <AddIcon />
          </button>
        )}
      </div>
    </div>
  );
}
