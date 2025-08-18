import React from 'react';

const tabs = [
  { label: 'Meals', icon: '🍽️' },
  { label: 'Coffee', icon: '☕' },
  { label: 'Drinks', icon: '🥤' },
  { label: 'Favorites', icon: '⭐' },
];

export default function MenuTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: 'Meals'|'Coffee'|'Drinks'|'Favorites') => void }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-900 flex justify-around py-3 z-10">
      {tabs.map(tab => (
        <button
          key={tab.label}
          className={`flex flex-col items-center text-white ${activeTab === tab.label ? 'text-orange-400' : ''}`}
          onClick={() => setActiveTab(tab.label as 'Meals'|'Coffee'|'Drinks'|'Favorites')}
        >
          <span className="text-2xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
