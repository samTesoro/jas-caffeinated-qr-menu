"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/ui/header";
import LoadingSpinner from "@/components/ui/loading-spinner";

type TableState = { table_num: number; is_active: boolean };

export default function TableManagement() {
  const [tables, setTables] = useState<TableState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ table_num: number; next: boolean } | null>(null);

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
        (data as Row[] | null)?.forEach((r) => byNum.set(r.table_num, !!r.is_active));
        const list: TableState[] = Array.from({ length: 7 }, (_, i) => {
          const n = i + 1;
          return { table_num: n, is_active: byNum.get(n) ?? false };
        });
        setTables(list);
      } catch {
        setTables(Array.from({ length: 7 }, (_, i) => ({ table_num: i + 1, is_active: false })));
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
    setTables((prev) => prev.map((t) => (t.table_num === table_num ? { ...t, is_active: next } : t)));
    setSaving(table_num);
    try {
      const supabase = createClient();
      // Upsert-like behavior: update if exists, else insert
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
      setTables((prev) => prev.map((t) => (t.table_num === table_num ? { ...t, is_active: !next } : t)));
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading..." />;

  return (
    <div className="min-h-screen bg-[#ebebeb] pb-24">
      <DashboardHeader />

      <div className="px-8 max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-black mt-4 mb-6 text-center">Change Table Status</h2>

        <div className="grid grid-cols-3 gap-6 place-items-center">
          {tables.map((t) => (
            <button
              key={t.table_num}
              aria-label={`Table ${t.table_num}`}
              onClick={() => requestToggle(t.table_num)}
              className={`rounded-md w-20 h-20 flex items-center justify-center shadow text-xl font-semibold transition-colors ${
                t.is_active ? "bg-red-500 text-white" : "bg-gray-300 text-black"
              } ${saving === t.table_num ? "opacity-70" : ""}`}
            >
              {t.table_num}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-2 text-sm text-black">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-gray-300 border border-black" />
            <span>Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-red-500 border border-black" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-md p-6 w-[320px] max-w-sm text-center space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-black">Confirm Change</h3>
            <p className="text-black text-sm">
              Set Table {confirmTarget.table_num} to {confirmTarget.next ? "Active" : "Inactive"}?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-md bg-gray-200 text-black"
                onClick={() => setConfirmTarget(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-orange-400 text-white"
                onClick={() => {
                  const t = confirmTarget; setConfirmTarget(null); if (t) performToggle(t.table_num, t.next);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
