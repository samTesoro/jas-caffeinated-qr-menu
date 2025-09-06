import Image from "next/image";

interface DashboardHeaderProps {
  mode?: "admin" | "customer";
  username?: string | null;
  tableId?: string;
}

export default function DashboardHeader({ mode = "admin", username = null, tableId }: DashboardHeaderProps) {
  return (
    <div className="relative w-full" style={{ height: "170px" }}>
      {/*Orange Split Background*/}
      <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53]" />
      <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb]" />

      <div className="absolute top-4 right-6 text-black text-xs font-normal">
        {mode === "admin"
          ? username
            ? username
            : "Admin"
          : tableId
          ? `Table: ${tableId}`
          : "Table: demo"}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/logo-caffeinated.png"
          alt="J.A.S. Caffeinated Logo"
          width={200}
          height={75}
          priority
        />
      </div>
    </div>
  );
}
