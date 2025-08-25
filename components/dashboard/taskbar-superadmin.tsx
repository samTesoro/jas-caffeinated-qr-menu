"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar.module.css";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";

export default function Taskbar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/menu", label: "Menu" },
    { href: "/dashboard/history", label: "History" },
  ];

  return (
    <footer className={styles.taskbar}>
      <div className={styles.backButton}>
        <LogoutButton>
          <Image
            src="/back-button.png"
            alt="Back"
            className={styles.backIcon}
            width={25}
            height={25}
          />
        </LogoutButton>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${
              pathname === link.href ? styles.active : ""
            }`}
          >
            {link.label}
          </Link>
        ))}

        <button
          aria-label="Create Account"
          onClick={() => (window.location.href = "/auth/create-account")}
          className={styles.starButton}
        >
          <Image
            src={
              pathname === "/auth/create-account"
                ? "/create-account-selected.png"
                : "/create-account.png"
            }
            alt="Create Account"
            width={24}
            height={24}
          />
        </button>
      </nav>
    </footer>
  );
}
