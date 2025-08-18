"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar.module.css";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { useState } from "react";

export default function Taskbar() {
  const pathname = usePathname();
  const [starActive, setStarActive] = useState(false);

  const links = [
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/menu", label: "Menu" },
    { href: "/dashboard/history", label: "History" },
  ];

  const handleStarClick = () => {
    setStarActive(true);
    if (typeof window !== 'undefined') {
      window.location.href = "/dashboard/favorites";
    }
  };

  return (
    <footer className={styles.taskbar}>
      <div className={styles.backButton}>
        <LogoutButton>
          <Image src="/back-button.png" alt="Back" className={styles.backIcon} width={25} height={25} />
        </LogoutButton>
      </div>
      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}
        <button
          className={`${styles.starButton} ${pathname === "/dashboard/favorites" ? styles.starActive : ""}`}
          onClick={handleStarClick}
          aria-label="Favorites"
        >
          ★
        </button>
      </nav>
    </footer>
  );
}