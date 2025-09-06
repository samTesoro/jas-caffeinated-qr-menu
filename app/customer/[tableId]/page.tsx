
"use client";

import { useEffect, useState } from "react";
import CustomerMenu from '@/components/customer/menu';
import { createClient } from "@/lib/supabase/client";
import React from "react";

export default function CustomerPage({ params }: { params: { tableId: string } }) {
  const { tableId } = params;
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkTable() {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer")
        .select("is_active, customer_id")
        .eq("table_num", Number(tableId))
        .single();
      console.log("Supabase table check:", { tableId, data, error });
      if (error || !data) {
        setIsActive(false);
        setCustomerId(null);
      } else {
        setIsActive(data.is_active);
        setCustomerId(data.customer_id);
        if (typeof window !== 'undefined' && data.customer_id) {
          localStorage.setItem('customer_id', String(data.customer_id));
        }
      }
      setLoading(false);
    }
    if (tableId) checkTable();
  }, [tableId, supabase]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isActive)
    return (
      <div className="p-8 text-center text-red-600 font-bold text-xl">
        This table is inactive. Please contact a staff member.
      </div>
    );
  return <CustomerMenu tableId={String(tableId)} customerId={customerId} />;
}
