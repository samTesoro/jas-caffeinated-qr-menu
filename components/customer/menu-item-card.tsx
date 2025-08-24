<<<<<<< HEAD
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
=======
import React from 'react';

export default function MenuItemCard({ item, onClick }: { item: any, onClick: () => void }) {
  return (
    <div className="relative bg-gray-100 rounded-xl shadow p-3 flex flex-col h-full cursor-pointer" onClick={onClick}>
      <img
        src={item.thumbnail || '/default-food.png'}
        alt={item.name}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />
      <div className="bg-white rounded-lg p-4 flex flex-col justify-between min-h-[90px] relative">
        <div className="font-bold text-lg text-black mb-1">{item.name}</div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">₱{Number(item.price).toFixed(2)}</span>
        </div>
        <button
          className="bg-orange-400 text-white rounded-full p-3 flex items-center justify-center shadow hover:bg-orange-500 transition absolute bottom-3 right-3"
          title="Add"
          onClick={onClick}
          style={{ width: '40px', height: '40px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
>>>>>>> 183fafce45b4d4d8d5e98f92f795eacf6e97cc9c
    </div>
  );
}
