"use client";
import React from "react";

interface MenuItemCardProps {
  item: {
    menuitem_id?: number;
    name: string;
    category: string;
    price: number;
    status: string;
    thumbnail?: string;
    favorites?: string;
    estimatedTime?: number;
    description?: string;
  };
  onClick?: () => void;
}

export default function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-20 h-20 object-cover rounded mb-2"
        />
      )}
      <div className="font-bold text-lg text-black mb-1">{item.name}</div>
      <div className="text-sm text-gray-600 mb-1">{item.category}</div>
      <div className="text-sm text-gray-600 mb-1">{item.description}</div>
      <div className="text-orange-700 font-bold">${item.price}</div>
      <div className="text-xs text-gray-500 mt-1">{item.status}</div>
    </div>
  );
}
