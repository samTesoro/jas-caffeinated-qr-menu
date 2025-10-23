import Image from "next/image";
import { LogoutButton } from "../logout-button";

interface DashboardHeaderProps {
  mode?: "admin" | "customer";
  username?: string | null;
  tableId?: string;
}

export default function DashboardHeader({
  mode = "admin",
  username = null,
  tableId,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 mb-8">
        {/* Orange and Gray Split Background */}
        <div className="relative w-full" style={{ height: "170px" }}>
          <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb] pointer-events-none" />

          {/* Username or Table Label */}
          <div className="absolute top-4 right-6 text-black text-xs font-normal z-40">
            {" "}
            {mode === "admin"
              ? username
                ? username
                : "Admin"
              : tableId
              ? `Table: ${tableId}`
              : "Customer"}
          </div>

          {/* Logout Button */}
          {mode === "admin" && (
            <div className="absolute top-10 right-3 z-50">
              {" "}
              <LogoutButton />
            </div>
          )}

          {/* Centered Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            {" "}
            <Image
              src="/logo-caffeinated.png"
              alt="J.A.S. Caffeinated Logo"
              width={200}
              height={75}
              priority
            />
          </div>
        </div>
      </header>

      <div style={{ height: "170px" }} />
    </>
  );
}
