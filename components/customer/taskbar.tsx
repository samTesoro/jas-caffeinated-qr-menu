"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const links = [
  { tab: "Meals", label: "Meals", icon: "🍽️" },
  { tab: "Coffee", label: "Coffee", icon: "☕" },
  { tab: "Drinks", label: "Drinks", icon: "🥤" },
  { tab: "Favorites", label: "Favorites", icon: "⭐" },
];

export default function CustomerTaskbar() {
  const pathname = usePathname();
  const currentTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'Meals' : 'Meals';

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900 flex items-center justify-between px-4 py-3 z-20" style={{height:'80px'}}>
      {/* Left tabs */}
      <div className="flex gap-2 flex-1 justify-evenly">
        {links.slice(0,2).map(link => (
          <Link
            key={link.tab}
            href={link.tab === 'Meals' ? '/customer' : `/customer?tab=${link.tab}`}
            className={`flex flex-col items-center text-white ${currentTab === link.tab ? 'text-orange-400 font-bold' : ''}`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs">{link.label}</span>
          </Link>
        ))}
      </div>
      {/* Cart button - center, protruding */}
      <div className="relative flex-1 flex justify-center">
        <Link href="/customer/cart">
          <button className="bg-orange-400 rounded-full p-4 shadow-lg flex items-center justify-center" style={{position:'absolute',top:'-30px',left:'50%',transform:'translateX(-50%)'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.6 17h8.8a1 1 0 00.95-.68L21 13M7 13V6h13" />
            </svg>
          </button>
        </Link>
      </div>
      {/* Right tabs */}
      <div className="flex gap-2 flex-1 justify-evenly">
        {links.slice(2).map(link => (
          <Link
            key={link.tab}
            href={`/customer?tab=${link.tab}`}
            className={`flex flex-col items-center text-white ${currentTab === link.tab ? 'text-orange-400 font-bold' : ''}`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs">{link.label}</span>
          </Link>
        ))}
      </div>
    </footer>
  );
}
