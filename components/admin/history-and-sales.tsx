"use client";

import React, { useMemo, useState } from "react";
import OrderHistory from "@/components/admin/order-history";
import SalesReport from "@/components/admin/sales-report";

function fmtRange(start: string, end: string) {
  // If either side is empty, treat as Overall
  if (!start || !end) return "Overall";
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
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
            className="flex items-center gap-2 bg-[#d9d9d9] text-black px-3 py-2 rounded border border-black/20"
            aria-label="Select date range"
          >
            <span className="inline-flex items-center gap-2">
              <span className="i">📅</span>
              <span className="text-sm md:text-base">{fmtRange(start, end)}</span>
            </span>
          </button>

          {/* Toggle buttons styled like the reference (pill group in orange) */}
          <div
            className="inline-flex items-center bg-[#E59C53] rounded-2xl border border-black shadow-sm p-1"
            role="tablist"
            aria-label="History or Sales"
          >
            <button
              role="tab"
              aria-selected={tab === "sales"}
              onClick={() => setTab("sales")}
              className={`px-4 py-1.5 text-sm md:text-base font-bold rounded-xl transition-colors animate-none hover:animate-none [transform:none] hover:[transform:none] ${
                tab === "sales"
                  ? "bg-white text-black hover:text-[#E59C53]"
                  : "bg-transparent text-black hover:text-white"
              }`}
              style={{ transform: "none" }}
            >
              Sales
            </button>
            <button
              role="tab"
              aria-selected={tab === "history"}
              onClick={() => setTab("history")}
              className={`px-4 py-1.5 text-sm md:text-base font-bold rounded-xl transition-colors animate-none hover:animate-none [transform:none] hover:[transform:none] ${
                tab === "history"
                  ? "bg-white text-black hover:text-[#E59C53]"
                  : "bg-transparent text-black hover:text-white"
              }`}
              style={{ transform: "none" }}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <hr className="border-black my-2" />

      {/* Date picker popover */}
      {showPicker && (
        <div className="relative">
          <div className="absolute right-0 z-50 bg-black text-white rounded-lg p-4 w-[320px] shadow-xl border border-gray-800">
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-sm text-gray-300">Start</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="bg-gray-800 text-white p-1 rounded"
              />
              <label className="text-sm text-gray-300">End</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="bg-gray-800 text-white p-1 rounded"
              />
            </div>
            <div className="flex justify-end items-center gap-2 mt-4">
              {/* Presets dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPresets((v) => !v)}
                  className="px-3 py-1 rounded border border-gray-600 text-white hover:bg-gray-800"
                >
                  Presets ▾
                </button>
                {showPresets && (
                  <div className="absolute bottom-full mb-2 left-0 bg-gray-900 text-white border border-gray-700 rounded-md shadow-lg w-40 overflow-hidden">
                    <button onClick={setPresetOverall} className="w-full text-left px-3 py-2 hover:bg-gray-800">Overall</button>
                    <button onClick={setPresetToday} className="w-full text-left px-3 py-2 hover:bg-gray-800">Today</button>
                    <button onClick={setPresetThisWeek} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Week</button>
                    <button onClick={setPresetThisMonth} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Month</button>
                    <button onClick={setPresetThisYear} className="w-full text-left px-3 py-2 hover:bg-gray-800">This Year</button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  applyToday();
                }}
                className="px-3 py-1 rounded bg-[#E59C53] text-black"
              >
                Reset
              </button>
              <button
                onClick={() => setShowPicker(false)}
                className="px-3 py-1 rounded bg-green-500 text-white"
              >
                Generate
              </button>
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
