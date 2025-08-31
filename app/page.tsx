"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-[var(--font-bebas)]">
      <div className="absolute inset-0">
        <Image
          src="/JAS-2.png"
          alt="Background"
          fill
          className="object-cover blur-sm brightness-80"
          priority
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        <Image
          src="/logo-caffeinated.png"
          alt="Caffeinated Logo"
          width={200}
          height={200}
          className="drop-shadow-lg"
        />

        <h1 className="font-bold text-white text-2xl sm:text-3xl tracking-wider">
          QR MENU SYSTEM
        </h1>

        <Link
          href="/auth/login"
          className="bg-[#E59C53] text-white font-semibold px-10 py-2 rounded-full shadow-lg transition"
        >
          Login
        </Link>
      </div>

      <div className="absolute bottom-4 right-4">
        <Link
          href="/customer"
          className="text-xs text-blue-600 hover:underline"
        >
          Access customer for testing
        </Link>
      </div>
    </div>
  );
}
