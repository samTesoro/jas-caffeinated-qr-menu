'use client';

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/header";

export default function SessionCashCardOrderConfirmation({ params }: { params: Promise<{ tableId: string, sessionId: string }> }) {
  const router = useRouter();
  const { tableId, sessionId } = React.use(params);

  const handleGoToTable = () => {
    router.push(`/customer/${tableId}/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <DashboardHeader mode="customer" tableId={tableId} />
      <div className="absolute top-6 right-6 text-sm font-semibold text-black">Table: {tableId}</div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center w-full">
          <Image
            src="/cash-confirm-icon.png"
            alt="Order Confirmed"
            width={200}
            height={200}
            className="border-1 border-black rounded-full"
          />
          <h2 className="font-bold text-black text-2xl mt-6 mb-2 text-center">YOUR ORDER WILL ARRIVE SOON.</h2>
          <p className="text-gray-800 text-center mb-6 text-lg">If you need further assistance,<br />please do not hesitate to approach any of our staff.<br />Thank you!</p>
          <span className="text-base text-gray-700 text-center mb-6 block">Est. Time of Arrival: 15 mins.</span>
        </div>
      </div>
      <div className="w-full bg-[#393939] h-20 flex items-center justify-center">
        <button
          className="px-6 py-2 bg-[#E59C53] text-white rounded-full font-extrabold shadow hover:bg-[#d4883e] transition text-xl border-0"
          onClick={handleGoToTable}
        >
          Back to home page
        </button>
      </div>
    </div>
  );
}