"use client";
import Link from "next/link";
import React from "react";

const tabs = [
  { label: "Meals", icon: "🍽️" },
  { label: "Coffee", icon: "☕" },
  { label: "Drinks", icon: "🥤" },
  { label: "Favorites", icon: "⭐" },
];

export default function MenuTaskbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: "Meals"|"Coffee"|"Drinks"|"Favorites") => void }) {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900 flex items-center justify-around px-4 py-3 z-20" style={{height:'80px'}}>
      {tabs.map((tab, idx) => (
        <React.Fragment key={tab.label}>
          <button
            className={`flex flex-col items-center text-white ${activeTab === tab.label ? "text-orange-400" : ""}`}
            onClick={() => setActiveTab(tab.label as "Meals"|"Coffee"|"Drinks"|"Favorites")}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
          {/* Insert cart button after Coffee tab */}
          {tab.label === "Coffee" && (
            <div className="relative flex flex-col items-center" style={{margin: '0 16px'}}>
              <Link href="/customer/cart">
                <button className="bg-orange-400 rounded-full p-4 shadow-lg flex items-center justify-center" style={{position:'relative',top:'-30px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-.68L21 13M7 13V6h13" />
                  </svg>
                </button>
              </Link>
            </div>
          )}
        </React.Fragment>
      ))}
    </footer>
  );
}
