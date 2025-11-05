"use client";
import Taskbar from "@/components/admin/taskbar-admin";
import DashboardHeader from "@/components/ui/header";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReviewList from "@/components/admin/order-reviews";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const router = useRouter();
  // Date range state, mirroring History/Sales controls
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekAgoStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  })();
  const [showPicker, setShowPicker] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [start, setStart] = useState<string>(weekAgoStr);
  const [end, setEnd] = useState<string>(todayStr);
  const [permissions, setPermissions] = useState<{
    view_menu: boolean;
    view_orders: boolean;
    view_super: boolean;
    view_history: boolean;
    view_reviews: boolean;
    view_tables?: boolean;
  }>(
    {
      view_menu: false,
      view_orders: false,
      view_super: false,
      view_history: false,
      view_reviews: false,
      view_tables: false,
    }
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      const supabase = createClient();
      const adminId = localStorage.getItem("user_id");
      if (!adminId) {
        router.replace("/auth/login");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("adminusers")
          .select(
            "view_menu, view_orders, view_super, view_history, view_reviews, view_tables"
          )
          .eq("user_id", adminId)
          .single();

        const isAllowed = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";

        if (error || !data) {
          setPermissions({
            view_menu: false,
            view_orders: false,
            view_super: false,
            view_history: false,
            view_reviews: false,
            view_tables: false,
          });
        } else {
          setPermissions({
            view_menu: isAllowed((data as any).view_menu),
            view_orders: isAllowed((data as any).view_orders),
            view_super: isAllowed((data as any).view_super),
            view_history: isAllowed((data as any).view_history),
            view_reviews: isAllowed((data as any).view_reviews),
            view_tables: isAllowed((data as any).view_tables),
          });
        }
      } catch {
        setPermissions({
          view_menu: false,
          view_orders: false,
          view_super: false,
          view_history: false,
          view_reviews: false,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, [router]);

  useEffect(() => {
    if (isLoading) return;
    if (permissions.view_reviews === false) {
      // If user cannot view reviews, redirect to fallback page
      const previousPage = permissions.view_menu
        ? "/admin/menu"
        : permissions.view_orders
        ? "/admin/orders"
        : permissions.view_super
        ? "/admin/view-accounts"
        : permissions.view_history
        ? "/admin/history"
        : "/admin";
      router.replace(previousPage);
    }
  }, [permissions, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }
  if (!permissions.view_reviews) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ebebeb]">
      <DashboardHeader />
      <Taskbar permissions={permissions} />
      <div className="flex flex-col w-full py-3 pb-4 px-7 md:px-24 lg:px-[300px]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-black">View Reviews</h2>
          {/* Date range button (reused from History) */}
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1 md:gap-2 bg-[#d9d9d9] text-black px-2 md:px-3 py-1.5 md:py-2.5 rounded border border-black/20"
            aria-label="Select date range"
          >
            <span className="flex items-center gap-1 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-black transition-colors duration-200">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="font-bold text-sm">Date</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-2">
              <span className="text-sm md:text-base">
                {(() => {
                  const fmt = (s: string) => {
                    if (!s) return "";
                    const d = new Date(s);
                    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
                  };
                  if (!start || !end) return "Overall";
                  return `${fmt(start)} → ${fmt(end)}`;
                })()}
              </span>
            </span>
          </button>
        </div>
        <hr className="border-black my-2" />
      </div>

      {showPicker && (
        <div className="relative">
          <div className="absolute right-7 md:right-24 lg:right-[300px] z-50 bg-white text-black rounded-lg p-4 pr-6 w-[320px] shadow-xl border border-gray-800">
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-sm text-black pl-2">Start</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="pl-3 bg-gray-400 text-black p-1 rounded"
              />
              <label className="text-sm text-black pl-2">End</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="pl-3 bg-gray-400 text-black p-1 rounded"
              />
            </div>
            <div className="flex justify-end items-center gap-2 mt-4">
              <div className="relative">
                <button
                  onClick={() => setShowPresets((v) => !v)}
                  className="px-2 py-0 rounded border text-md border-gray-600 text-black hover:bg-gray-300"
                >
                  Presets ▾
                </button>
                {showPresets && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-900 text-white border border-gray-700 rounded-md shadow-lg w-40 overflow-hidden">
                    <button onClick={() => { setStart(""); setEnd(""); setShowPresets(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">Overall</button>
                    <button onClick={() => { const t = new Date(); const s = new Date(t); const sStr = s.toISOString().slice(0,10); const eStr = t.toISOString().slice(0,10); setStart(sStr); setEnd(eStr); setShowPresets(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">Today</button>
                    <button onClick={() => { const t = new Date(); const day = t.getDay(); const diffToMonday = (day + 6) % 7; const monday = new Date(t); monday.setDate(t.getDate() - diffToMonday); setStart(monday.toISOString().slice(0,10)); setEnd(t.toISOString().slice(0,10)); setShowPresets(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Week</button>
                    <button onClick={() => { const t = new Date(); const first = new Date(t.getFullYear(), t.getMonth(), 1); setStart(first.toISOString().slice(0,10)); setEnd(t.toISOString().slice(0,10)); setShowPresets(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Month</button>
                    <button onClick={() => { const t = new Date(); const first = new Date(t.getFullYear(), 0, 1); setStart(first.toISOString().slice(0,10)); setEnd(t.toISOString().slice(0,10)); setShowPresets(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Year</button>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  const t = new Date();
                  const s = new Date();
                  s.setDate(t.getDate() - 7);
                  setStart(s.toISOString().slice(0, 10));
                  setEnd(t.toISOString().slice(0, 10));
                }}
                variant="orange"
                className="px-1 py-3 rounded text-black border-transparent"
              >
                Reset
              </Button>

              {/* Generate button removed per request */}
            </div>
          </div>
        </div>
      )}

      <ReviewList permissions={permissions} start={start} end={end} />
    </div>
  );
}
