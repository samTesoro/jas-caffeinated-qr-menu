"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "../ui/button";
import QRCode from "qrcode";
import Image from "next/image";

type TableState = { table_num: number; is_active: boolean };

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="#000000"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7h12M9 7V4h6v3m2 0v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z"
      />
    </svg>
  );
}

export default function TableManagement() {
  const [tables, setTables] = useState<TableState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [qrForTable, setQrForTable] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [confirmDeleteTable, setConfirmDeleteTable] = useState<number | null>(
    null
  );

  const closeAllModals = () => {
    setShowAddConfirm(false);
    setSelectedTable(null);
    setConfirmDeleteTable(null);
    setQrForTable(null);
    setQrDataUrl(null);
  };

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
        const rows = (data as Row[] | null) ?? [];
        const maxActive = rows
          .filter((r) => r.is_active === true)
          .reduce((acc, r) => Math.max(acc, r.table_num), 0);
        const initialCount = Math.min(Math.max(maxActive || 1, 1), 15);
        const list: TableState[] = Array.from(
          { length: initialCount },
          (_, i) => {
            const n = i + 1;
            return { table_num: n, is_active: byNum.get(n) ?? false };
          }
        );
        setTables(list);
      } catch {
        setTables([{ table_num: 1, is_active: false }]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const performToggle = async (table_num: number, next: boolean) => {
    const current = tables.find((t) => t.table_num === table_num);
    if (!current) return;

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
      setTables((prev) =>
        prev.map((t) =>
          t.table_num === table_num ? { ...t, is_active: !next } : t
        )
      );
    } finally {
      setSaving(null);
    }
  };

  // Adds a new table
  const addTable = async () => {
    const nextNum =
      tables.length > 0 ? Math.max(...tables.map((t) => t.table_num)) + 1 : 1;
    if (nextNum > 15) return;
    const newTable = { table_num: nextNum, is_active: true };

    setTables((prev) => [...prev, newTable]);

    try {
      const supabase = createClient();
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
      setTables((prev) => {
        const filtered = prev.filter((t) => t.table_num !== table_num);
        return filtered.length >= 1 ? filtered : prev;
      });
    }
  };

  const addDisabled = tables.length >= 15;

  const handleTableClick = (table_num: number) => {
    closeAllModals();
    setSelectedTable(table_num);
  };

  const closeQrModal = () => {
    setQrForTable(null);
    setQrDataUrl(null);
  };

  const openQrForTable = async (table_num: number) => {
    const resolveBaseUrl = async (): Promise<string> => {
      try {
        if (typeof window !== "undefined") {
          const origin = window.location.origin;
          if (!/localhost|127\.0\.0\.1/.test(origin)) return origin;
        }
        const res = await fetch("/api/base-url", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { baseUrl?: string };
          if (data?.baseUrl) return data.baseUrl;
        }
      } catch {}
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
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="min-h-screen bg-[#ebebeb] pb-24">
      <div className="px-8 max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-black mt-0 mb-6 text-center">
          Table Management
        </h2>

        <div className="flex justify-between items-center mb-5 gap-2 px-4"></div>

        <div className="grid grid-cols-3 gap-6 place-items-center">
          {tables.map((t) => (
            <button
              key={t.table_num}
              aria-label={`Table ${t.table_num}`}
              onClick={() => handleTableClick(t.table_num)}
              className={`rounded-md w-20 h-20 flex items-center justify-center shadow text-xl font-semibold transition-colors ${
                t.is_active ? "bg-red-500 text-white" : "bg-gray-300 text-black"
              } ${saving === t.table_num ? "opacity-70" : ""}`}
            >
              {t.table_num}
            </button>
          ))}

          {/* Add button tile */}
          <button
            aria-label="Add table"
            onClick={() => {
              closeAllModals();
              setShowAddConfirm(true);
            }}
            disabled={addDisabled}
            className={`rounded-md w-20 h-20 flex items-center justify-center text-3xl font-bold border-2 border-dashed transition
              ${
                addDisabled
                  ? "opacity-40 cursor-not-allowed"
                  : "opacity-70 hover:opacity-100"
              }
              bg-gray-200/60 text-gray-700 border-gray-400`}
            title={addDisabled ? "Maximum 15 tables" : "Add table"}
          >
            +
          </button>
        </div>

        <div className="flex flex-col items-end mt-11 space-y-2 text-sm text-black">
          <div className="flex items-center gap-2 min-w-[90px]">
            <span className="inline-block w-4 h-4 bg-gray-300 border align-middle" />
            <span className="align-middle">Inactive</span>
          </div>
          <div className="flex items-center gap-2 min-w-[90px]">
            <span className="inline-block w-4 h-4 bg-red-500 border align-middle" />
            <span className="align-middle">Active</span>
          </div>
          <div className="text-xs text-gray-600 pt-2">
            Note: Minimum 1 table, maximum 15 tables.
          </div>
        </div>
      </div>

      {/* Options modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="relative bg-white rounded-md p-6 w-[90vw] max-w-[300px] text-center space-y-4 shadow-lg">
            <button
              aria-label="Close options"
              onClick={() => setSelectedTable(null)}
              className="absolute right-2 top-2 w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100"
              title="Close"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-black">
              Table {selectedTable}
            </h3>

            {/* Toggle Active/Inactive */}
            {(() => {
              const isActive =
                tables.find((t) => t.table_num === selectedTable)?.is_active ??
                false;
              const toggling = saving === selectedTable;
              return (
                <div className="flex items-center justify-between">
                  <span className="text-md text-gray-700">
                    {isActive ? "Active Table" : "Inactive Table"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    aria-label="Toggle active state"
                    disabled={toggling}
                    onClick={() => performToggle(selectedTable, !isActive)}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                      isActive ? "bg-green-500" : "bg-gray-300"
                    } ${toggling ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })()}

            {/* Generate + Delete */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="orange"
                onClick={() => {
                  if (!selectedTable) return;
                  const t = selectedTable;
                  closeAllModals();
                  openQrForTable(t);
                }}
                className="flex-1 border-transparent hover:bg-gray-200 py-4 rounded-md transition-colors font-semibold"
              >
                Generate QR
              </Button>

              <button
                type="button"
                aria-label="Delete table"
                onClick={() => {
                  const t = selectedTable;
                  closeAllModals();
                  if (t) setConfirmDeleteTable(t);
                }}
                disabled={selectedTable <= 1}
                className={`bg-red-500 hover:bg-red-600 w-9 h-9 rounded-md flex items-center justify-center shadow ${
                  selectedTable <= 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title="Delete"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Add modal */}
      {showAddConfirm && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">Add new table?</p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={closeAllModals}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={async () => {
                  await addTable();
                  closeAllModals();
                }}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteTable && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center transition-opacity duration-300 z-[9999]">
          <div className="bg-white rounded-md p-6 w-[90vw] max-w-[250px] text-center space-y-4 shadow-lg">
            <p className="text-md text-black font-bold mt-3">
              Delete table {confirmDeleteTable}?
            </p>
            <div className="flex justify-between font-bold">
              <Button
                variant="red"
                type="button"
                onClick={closeAllModals}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                No
              </Button>
              <Button
                variant="green"
                type="button"
                onClick={async () => {
                  const n = confirmDeleteTable!;
                  await deleteTable(n);
                  closeAllModals(); // ensure all modals close after delete
                }}
                className="border-transparent hover:bg-gray-200 w-[90px] py-3 rounded-lg transition-colors"
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR modal */}
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
            <h3 className="text-center text-black font-bold text-lg mb-3">
              Table {qrForTable} QR
            </h3>
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
                onClick={() => {
                  if (!qrDataUrl || !qrForTable) return;
                  const link = document.createElement("a");
                  link.href = qrDataUrl;
                  link.download = `table-${qrForTable}-qr.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
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
