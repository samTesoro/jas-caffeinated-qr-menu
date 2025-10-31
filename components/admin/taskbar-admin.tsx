"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar-admin.module.css";
import { LogoutButton } from "@/components/logout-button";
import { useEffect } from "react";

type Permissions = {
  view_orders?: boolean;
  view_history?: boolean;
  view_menu?: boolean;
  view_reviews?: boolean;
  create_account?: boolean;
  view_super?: boolean;
  view_tables?: boolean;
};

export default function Taskbar({
  // Default to empty object so unknown/missing permissions are treated as false
  permissions = {},
}: {
  permissions?: Permissions;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Permissions object:", permissions);
  }, [permissions]);

  const links = [
    {
      href: "/admin/orders",
      label: "Orders",
      perm: permissions.view_orders === true,
    },
    {
      href: "/admin/menu",
      label: "Menu",
      perm: permissions.view_menu === true,
    },
    {
      href: "/admin/table",
      label: "Table",
      perm: permissions.view_tables === true,
    },
    {
      href: "/admin/history",
      label: "History",
      perm: permissions.view_history === true,
    },
    {
      href: "/admin/reviews",
      label: "Reviews",
      perm: permissions.view_reviews === true,
      icon: (
        <button
          aria-label="Reviews"
          className={`${styles.starButton} ${
            pathname === "/admin/reviews" ? styles.starActive : ""
          } ${!(permissions.view_reviews === true) ? styles.disabled : ""}`}
          disabled={!(permissions.view_reviews === true)}
        >
          ★
        </button>
      ),
    },
    {
      href: "/admin/view-accounts",
      label: "View Accounts",
      perm:
        permissions.view_super === true || permissions.create_account === true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${styles.icon} transition-colors duration-200 ${
            !(permissions.view_super === true) &&
            !(permissions.create_account === true)
              ? "stroke-[#808080]" // Disabled
              : pathname === "/admin/view-accounts"
              ? "stroke-[#E59C53]" // Active
              : "stroke-white hover:stroke-[#E59C53]"
          }`}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
    },
  ];

  return (
    <footer className={`${styles.taskbar} flex items-center`}>
      <nav className={`${styles.nav} flex justify-evenly w-full`}>
        {links.map((link) =>
          link.perm ? (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                pathname === link.href ? styles.active : ""
              } group flex flex-col items-center justify-center text-center`}
            >
              {link.icon || <span className={styles.label}>{link.label}</span>}
            </Link>
          ) : (
            <span
              key={link.href}
              className={`${styles.link} ${styles.disabled} flex flex-col items-center justify-center text-center`}
              aria-disabled="true"
            >
              {link.icon || <span className={styles.label}>{link.label}</span>}
            </span>
          )
        )}
        {/* Logout aligned with other icons, always visible */}
        <span
          className={`${styles.link} ${styles.noBounce} flex flex-col items-center justify-center text-center`}
        >
          <LogoutButton
            className="flex items-center justify-center text-white hover:text-[#E59C53]"
            iconClassName={`${styles.icon} transition-colors duration-200`}
          />
        </span>
      </nav>
    </footer>
  );
}
