"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar-admin.module.css";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { useEffect } from "react";

type Permissions = {
  view_orders?: boolean;
  view_history?: boolean;
  view_menu?: boolean;
  view_reviews?: boolean;
  create_account?: boolean;
  view_super?: boolean; // Added view_super property
  view_tables?: boolean; // New: controls access to Table Management
};

export default function Taskbar({
  permissions = {
    view_orders: true,
    view_history: true,
    view_menu: true,
    view_reviews: true,
    create_account: true,
    view_tables: true,
  },
}: {
  permissions?: Permissions;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.log("Permissions object:", permissions); // Debugging log to verify permissions
  }, [permissions]);

  const links = [
    {
      href: "/admin/orders",
      label: "Orders",
      perm: permissions.view_orders,
    },
    {
      href: "/admin/menu",
      label: "Menu",
      perm: permissions.view_menu,
    },
    {
      href: "/admin/table",
      label: "Table",
      perm: permissions.view_tables ?? true,
    },
    {
      href: "/admin/history",
      label: "History",
      perm: permissions.view_history,
    },
    {
      href: "/admin/reviews",
      label: "Reviews",
      perm: permissions.view_reviews,
      icon: (
        <button
          aria-label="Reviews"
          className={`${styles.starButton} ${
            pathname === "/admin/reviews" ? styles.starActive : ""
          } ${!permissions.view_reviews ? styles.disabled : ""}`}
          disabled={!permissions.view_reviews}
        >
          ★
        </button>
      ),
    },
    {
      href: "/admin/view-accounts",
      label: "View Accounts",
      perm: permissions.view_super || permissions.create_account, // Fallback to create_account if view_super is not set
      icon: (
        <Image
          src={
            pathname === "/admin/view-accounts"
              ? "/create-account-selected.png"
              : "/create-account.png"
          }
          alt="Create Account"
          width={24}
          height={24}
          style={{ opacity: permissions.view_super || permissions.create_account ? 1 : 0.5 }}
        />
      ),
    },
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
        {links.map((link) =>
          link.perm ? (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.icon || link.label} {/* Render icon if available, otherwise label */}
            </Link>
          ) : (
            <span
              key={link.href}
              className={`${styles.link} ${styles.disabled}`}
              aria-disabled="true"
            >
              {link.icon || link.label} {/* Render icon if available, otherwise label */}
            </span>
          )
        )}
      </nav>
    </footer>
  );
}
