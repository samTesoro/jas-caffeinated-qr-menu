"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/ui/header";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Check adminusers table for username/password
    const { data, error } = await supabase
      .from("adminusers")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    setIsLoading(false);
    if (error || !data) {
      setError("Invalid username or password");
    } else {
      // Set admin_session cookie for middleware authentication
      document.cookie = `admin_session=${data.id}; path=/;`; // You can use any value, here we use user id
      router.push("/dashboard/menu");
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader showBack={false} />

      <div className="max-w-md mx-auto px-7 py-6 flex flex-col center">
        <h2 className="text-xl mb-4 mx-3 text-black text-center font-semibold">
          Welcome to J.A.S. Caffeinated QR Menu System Admin Site
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-black mb-2 mt-3 text-md">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-1 px-2 border border-black bg-[#D9D9D9] text-black justify-center h-8"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <label className="block text-black text-md">Password</label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-1 px-3 border border-black bg-[#D9D9D9] text-black justify-center h-8"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-2 text-xs py-1 border border-black bg-[#D9D9D9] text-black h-6"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
