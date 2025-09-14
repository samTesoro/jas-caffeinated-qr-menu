"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/ui/header";

export default function GCashOrderConfirmation({ params }: { params: { tableId: string } }) {
  const router = useRouter();
  const { tableId } = params;

  const handleGoToTable = () => {
    if (tableId) {
      router.push(`/customer/${tableId}`);
    } else {
      router.push("/customer");
    }
  };

  const handleRedirectGCash = () => {
    window.open("https://www.gcash.com/", "_blank");
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = "/gcash-qr.png";
    link.download = "gcash-qr.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#ececec] flex flex-col">
      <DashboardHeader mode="customer" tableId={""} />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center w-full">
          <Image
            src="/gcash-qr.png"
            alt="GCash QR"
            width={180}
            height={180}
            className="mb-4"
          />
          <div className="flex gap-2 mb-6 w-full justify-center">
            <button
              className="flex items-center gap-1 px-2 py-1 bg-white rounded shadow text-black font-semibold border border-gray-300 text-sm"
              onClick={handleRedirectGCash}
            >
              <Image src="/link-icon.png" alt="Link" width={18} height={18} /> Redirect to GCash
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 bg-white rounded shadow text-black font-semibold border border-gray-300 text-sm"
              onClick={handleDownloadQR}
            >
              <Image src="/download-icon.png" alt="Download" width={18} height={18} /> Download QR
            </button>
          </div>
          <h2 className="font-bold text-black text-base mb-2 text-center">YOUR ORDER WILL ARRIVE SOON.</h2>
          <p className="text-gray-800 text-center mb-6 text-lg">Please present your GCash receipt on bill out or at the counter to validate your transaction.<br />Thank you!</p>
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
