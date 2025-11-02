"use client";

import React, { useMemo, useState } from "react";
import OrderHistory from "@/components/admin/order-history";
import SalesReport from "@/components/admin/sales-report";
import { Button } from "../ui/button";

function fmtRange(start: string, end: string) {
  // If either side is empty, treat as Overall
  if (!start || !end) return "Overall";
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  return `${fmt(s)} → ${fmt(e)}`;
}

export default function HistoryAndSales() {
  const today = useMemo(() => new Date(), []);
  const defStart = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, [today]);
  const defEnd = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [tab, setTab] = useState<"history" | "sales">("history");
  const [showPicker, setShowPicker] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [start, setStart] = useState(defStart);
  const [end, setEnd] = useState(defEnd);

  const applyToday = () => {
    const t = new Date();
    const s = new Date();
    s.setDate(t.getDate() - 7);
    setStart(s.toISOString().slice(0, 10));
    setEnd(t.toISOString().slice(0, 10));
  };

  // Preset helpers
  const setRange = (s: Date, e: Date) => {
    setStart(s.toISOString().slice(0, 10));
    setEnd(e.toISOString().slice(0, 10));
  };
  const setPresetToday = () => {
    const t = new Date();
    const s = new Date(t);
    setRange(s, t);
    setShowPresets(false);
  };
  const setPresetThisWeek = () => {
    const t = new Date();
    const day = t.getDay(); // 0=Sun ... 6=Sat
    const diffToMonday = (day + 6) % 7; // Monday-based week start
    const monday = new Date(t);
    monday.setDate(t.getDate() - diffToMonday);
    setRange(monday, t);
    setShowPresets(false);
  };
  const setPresetThisMonth = () => {
    const t = new Date();
    const first = new Date(t.getFullYear(), t.getMonth(), 1);
    setRange(first, t);
    setShowPresets(false);
  };
  const setPresetThisYear = () => {
    const t = new Date();
    const first = new Date(t.getFullYear(), 0, 1);
    setRange(first, t);
    setShowPresets(false);
  };
  const setPresetOverall = () => {
    setStart("");
    setEnd("");
    setShowPresets(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen py-3 pb-[150px] px-7 md:px-24 lg:px-[300px]">
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          {tab === "history" ? "Order History" : "Sales Report"}
        </h2>
        {/* Controls: date range + switch */}
        <div className="flex items-center gap-3">
          {/* Date range button */}
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1 md:gap-2 bg-[#d9d9d9] text-black px-2 md:px-3 py-1.5 md:py-2.5 rounded border border-black/20"
            aria-label="Select date range"
          >
            {/* Mobile: calendar icon + Date label */}
            <span className="flex items-center gap-1 md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-black transition-colors duration-200 group-hover:stroke-[#E59C53]"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="font-bold text-sm">Date</span>
            </span>

            {/* Desktop: date range only */}
            <span className="hidden md:inline-flex items-center gap-2">
              <span className="text-sm md:text-base">
                {fmtRange(start, end)}
              </span>
            </span>
          </button>

          {/* Tab switch (Sales / History) */}
          <div
            className="inline-flex items-center bg-[#E59C53] rounded-md border border-black shadow-sm p-0 md:p-1"
            role="tablist"
            aria-label="History or Sales"
          >
            {/* Sales button */}
            <button
              role="tab"
              aria-selected={tab === "sales"}
              onClick={() => setTab("sales")}
              className={`px-2 md:px-4 py-1.5 text-sm md:text-base font-bold rounded-md transition-colors ${
                tab === "sales"
                  ? "bg-white text-black hover:text-[#E59C53]"
                  : "bg-transparent text-black hover:text-white"
              }`}
              aria-label="Sales"
            >
              {/* Mobile: icon only */}
              <span className="md:hidden inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-black"
                >
                  <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
                  <path d="M4 5v4c0 1.657 3.582 3 8 3s8-1.343 8-3V5"></path>
                  <path d="M4 12v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4"></path>
                  <ellipse cx="12" cy="12" rx="8" ry="3"></ellipse>
                  <path d="M4 19v0c0 1.657 3.582 3 8 3s8-1.343 8-3v0"></path>
                  <ellipse cx="12" cy="19" rx="8" ry="3"></ellipse>
                </svg>
              </span>

              {/* Desktop: text only */}
              <span className="hidden md:inline">Sales</span>
            </button>

            {/* History button */}
            <button
              role="tab"
              aria-selected={tab === "history"}
              onClick={() => setTab("history")}
              className={`px-2 md:px-4 py-1.5 text-sm md:text-base font-bold rounded-md transition-colors ${
                tab === "history"
                  ? "bg-white text-black hover:text-[#E59C53]"
                  : "bg-transparent text-black hover:text-white"
              }`}
              aria-label="History"
            >
              {/* Mobile: icon only */}
              <span className="md:hidden inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-black"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </span>

              {/* Desktop: text only */}
              <span className="hidden md:inline">History</span>
            </button>
          </div>
        </div>
      </div>

      <hr className="border-black my-2" />

      {showPicker && (
        <div className="relative">
          <div className="absolute right-0 z-50 bg-white text-black rounded-lg p-4 pr-6 w-[320px] shadow-xl border border-gray-800">
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
              {/* Presets dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPresets((v) => !v)}
                  className="px-2 py-0 rounded border text-md border-gray-600 text-black hover:bg-gray-300"
                >
                  Presets ▾
                </button>
                {showPresets && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-900 text-white border border-gray-700 rounded-md shadow-lg w-40 overflow-hidden">
                    <button
                      onClick={setPresetOverall}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800"
                    >
                      Overall
                    </button>
                    <button
                      onClick={setPresetToday}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800"
                    >
                      Today
                    </button>
                    <button
                      onClick={setPresetThisWeek}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800"
                    >
                      This Week
                    </button>
                    <button
                      onClick={setPresetThisMonth}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800"
                    >
                      This Month
                    </button>
                    <button
                      onClick={setPresetThisYear}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800"
                    >
                      This Year
                    </button>
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  applyToday();
                }}
                variant="orange"
                className="px-1 py-3 rounded text-black border-transparent"
              >
                Reset
              </Button>

              <Button
                onClick={() => setShowPicker(false)}
                variant="green"
                className="px-1 py-3 rounded text-black border-transparent"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === "history" ? (
        <OrderHistory start={start} end={end} />
      ) : (
        <SalesReport start={start} end={end} />
      )}
    </div>
  );
}
