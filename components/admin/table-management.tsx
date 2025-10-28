"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "../ui/button";
import QRCode from "qrcode";
import Image from "next/image";

type TableState = { table_num: number; is_active: boolean };

export default function TableManagement() {
  const [tables, setTables] = useState<TableState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    table_num: number;
    next: boolean;
  } | null>(null);

  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qrMode, setQrMode] = useState(false);
  const [qrForTable, setQrForTable] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("customer")
          .select("table_num, is_active");
        if (error) throw error;
        type Row = { table_num: number; is_active: boolean | null };
        const byNum = new Map<number, boolean>();
        (data as Row[] | null)?.forEach((r) =>
          byNum.set(r.table_num, !!r.is_active)
        );
        // Determine how many tables to render initially based on highest active table, capped at 15, minimum 1
        const rows = (data as Row[] | null) ?? [];
        const maxActive = rows
          .filter((r) => r.is_active === true)
          .reduce((acc, r) => Math.max(acc, r.table_num), 0);
        const initialCount = Math.min(Math.max(maxActive || 1, 1), 15);
        const list: TableState[] = Array.from({ length: initialCount }, (_, i) => {
          const n = i + 1;
          return { table_num: n, is_active: byNum.get(n) ?? false };
        });
        setTables(list);
      } catch {
        // Fallback to a single table when loading fails
        setTables([{ table_num: 1, is_active: false }]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const requestToggle = (table_num: number) => {
    const current = tables.find((t) => t.table_num === table_num);
    if (!current) return;
    setConfirmTarget({ table_num, next: !current.is_active });
  };

  const performToggle = async (table_num: number, next: boolean) => {
    const current = tables.find((t) => t.table_num === table_num);
    if (!current) return;
    // optimistic update
    setTables((prev) =>
      prev.map((t) =>
        t.table_num === table_num ? { ...t, is_active: next } : t
      )
    );
    setSaving(table_num);
    try {
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("customer")
        .select("customer_id")
        .eq("table_num", table_num)
        .maybeSingle();

      if (existing?.customer_id) {
        const { error: updErr } = await supabase
          .from("customer")
          .update({ is_active: next })
          .eq("customer_id", existing.customer_id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("customer")
          .insert({ table_num, is_active: next });
        if (insErr) throw insErr;
      }
    } catch {
      // revert on failure
      setTables((prev) =>
        prev.map((t) =>
          t.table_num === table_num ? { ...t, is_active: !next } : t
        )
      );
    } finally {
      setSaving(null);
    }
  };

  const addTable = async () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map((t) => t.table_num)) + 1 : 1;
    if (nextNum > 15) return; // cap at 15
    const newTable = { table_num: nextNum, is_active: true };

    // optimistic add to view
    setTables((prev) => [...prev, newTable]);

    try {
      const supabase = createClient();
      // If a row exists for nextNum, update to active; else insert a new row
      const { data: existing } = await supabase
        .from("customer")
        .select("customer_id")
        .eq("table_num", nextNum)
        .maybeSingle();

      if (existing?.customer_id) {
        const { error: updErr } = await supabase
          .from("customer")
          .update({ is_active: true })
          .eq("customer_id", existing.customer_id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from("customer")
          .insert({ table_num: nextNum, is_active: true });
        if (insErr) throw insErr;
      }
    } catch (err) {
      console.error("Error adding table:", err);
      setTables((prev) => prev.filter((t) => t.table_num !== nextNum));
    }
  };

  const deleteTable = async (table_num: number) => {
    // Guard: never delete table 1 from the view
    if (table_num <= 1) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("customer")
        .update({ is_active: false })
        .eq("table_num", table_num);
      if (error) throw error;
    } catch (err) {
      console.error("Error marking table inactive:", err);
    } finally {
      // Remove the highest visible table from the view (e.g., 15 -> 14 -> ...), but keep routes intact
      setTables((prev) => {
        const filtered = prev.filter((t) => t.table_num !== table_num);
        // Ensure minimum of 1 visible table
        return filtered.length >= 1 ? filtered : prev;
      });
    }
  };

  const addDisabled = tables.length >= 15;
  const deleteDisabled = tables.length <= 1;

  // When in QR mode, clicking an active table opens QR modal
  const handleTableClick = async (table_num: number, isActive: boolean) => {
    if (qrMode) {
      if (!isActive) return; // only currently available (active) tables
      // Resolve a base URL customers can reach. Prefer current origin unless it's localhost.
      const resolveBaseUrl = async (): Promise<string> => {
        try {
          if (typeof window !== "undefined") {
            const origin = window.location.origin;
            if (!/localhost|127\.0\.0\.1/.test(origin)) return origin;
          }
          // Fallback to server-assisted detection
          const res = await fetch("/api/base-url", { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { baseUrl?: string };
            if (data?.baseUrl) return data.baseUrl;
          }
        } catch {}
        // Final fallback
        return "http://localhost:3000";
      };

      const b = baseUrl || (await resolveBaseUrl());
      if (!baseUrl) setBaseUrl(b);
      const url = `${b.replace(/\/$/, "")}/customer/${table_num}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 1 });
        setQrDataUrl(dataUrl);
        setQrForTable(table_num);
      } catch (e) {
        console.error("Failed to generate QR:", e);
      }
      return;
    }
    requestToggle(table_num);
  };

  const closeQrModal = () => {
    setQrForTable(null);
    setQrDataUrl(null);
  };

  const downloadQr = () => {
    if (!qrDataUrl || !qrForTable) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `table-${qrForTable}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  const lastTableNum =
    tables.length > 0 ? Math.max(...tables.map((t) => t.table_num)) : null;

  return (
    <div className="min-h-screen bg-[#ebebeb] pb-24">
      <div className="px-8 max-w-md mx-auto">
        <h2 className="text-xl md:text-3xl font-bold text-black mt-0 mb-6 text-center">
          Change Table Status
        </h2>

        <div className="flex justify-between items-center mb-5 gap-2">
          <Button
            variant="orange"
            onClick={() => setShowAddConfirm(true)}
            className="text-black px-2 rounded-lg border-transparent font-semibold"
            disabled={addDisabled}
          >
            Add
          </Button>
          <Button
            variant={qrMode ? "green" : "orange"}
            onClick={() => setQrMode((s) => !s)}
            className="text-black px-2 rounded-lg border-transparent font-semibold"
          >
            {qrMode ? "QR Mode: On" : "Generate QR"}
          </Button>
          {tables.length > 0 && (
            <Button
              variant="red"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-black px-2 rounded-lg border-transparent font-semibold"
              disabled={deleteDisabled}
            >
              Delete
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 place-items-center">
          {tables.map((t) => (
            <button
              key={t.table_num}
              aria-label={`Table ${t.table_num}`}
              onClick={() => handleTableClick(t.table_num, t.is_active)}
              className={`rounded-md w-20 h-20 flex items-center justify-center shadow text-xl font-semibold transition-colors ${
                t.is_active ? "bg-red-500 text-white" : "bg-gray-300 text-black"
              } ${saving === t.table_num ? "opacity-70" : ""}`}
            >
              {t.table_num}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-end mt-11 space-y-2 text-sm text-black">
          <div className="flex items-center gap-2 min-w-[90px]">
            <span className="inline-block w-4 h-4 bg-gray-300 border border-black align-middle" />
            <span className="align-middle">Inactive</span>
          </div>
          <div className="flex items-center gap-2 min-w-[90px]">
            <span className="inline-block w-4 h-4 bg-red-500 border border-black align-middle" />
            <span className="align-middle">Active</span>
          </div>
          <div className="text-xs text-gray-600 pt-2">Note: Minimum 1 table, maximum 15 tables. {qrMode && <span className="ml-2 text-gray-800 font-semibold">QR mode is active — click an active table to preview/download its QR.</span>}</div>
        </div>
      </div>

      {showAddConfirm && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">Add new table?</p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowAddConfirm(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={() => {
                  setShowAddConfirm(false);
                  addTable();
                }}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Delete table {lastTableNum}?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (lastTableNum) deleteTable(lastTableNum);
                }}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-black">Confirm Change</h3>
            <p className="text-black text-sm">
              Set Table {confirmTarget.table_num} to{" "}
              {confirmTarget.next ? "Active" : "Inactive"}?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="red"
                className="border-transparent font-semibold hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
                onClick={() => setConfirmTarget(null)}
              >
                No
              </Button>
              <Button
                variant="green"
                className="border-transparent font-semibold hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
                onClick={() => {
                  const t = confirmTarget;
                  setConfirmTarget(null);
                  if (t) performToggle(t.table_num, t.next);
                }}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {qrForTable && qrDataUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[10000]">
          <div className="relative bg-white rounded-md p-4 w-[92vw] max-w-[380px] shadow-lg">
            <button
              aria-label="Close"
              onClick={closeQrModal}
              className="absolute right-2 top-2 w-7 h-7 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
              title="Close"
            >
              ✕
            </button>
            <h3 className="text-center text-black font-bold text-lg mb-3">Table {qrForTable} QR</h3>
            <div className="w-full flex items-center justify-center">
              {qrDataUrl && (
                <Image
                  src={qrDataUrl}
                  alt={`QR for table ${qrForTable}`}
                  width={260}
                  height={260}
                  unoptimized
                />
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={downloadQr}
                className="flex items-center gap-1 px-3 py-2 bg-white rounded shadow text-black font-semibold border border-gray-300 text-sm"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
