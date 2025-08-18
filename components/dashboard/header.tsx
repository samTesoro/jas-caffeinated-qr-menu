import Image from "next/image";

export default function DashboardHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <div className="relative w-full" style={{ height: '170px' }}>
      {/*Orange Split Background*/}
      <div className="absolute top-0 left-0 w-full h-[90px] bg-[#E59C53]" />
      <div className="absolute bottom-0 left-0 w-full h-[90px] bg-[#ebebeb]" />

      {/* Admin Text (top right) */}
      <div className="absolute top-4 right-6 text-black text-xs font-normal">
        Admin
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
