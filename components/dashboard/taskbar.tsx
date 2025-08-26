"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar.module.css";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";

type Permissions = {
  view_orders?: boolean;
  view_history?: boolean;
  view_menu?: boolean;
  view_reviews?: boolean;
  create_account?: boolean;
};

export default function Taskbar({
  permissions = {
    view_orders: true,
    view_history: true,
    view_menu: true,
    view_reviews: true,
    create_account: true,
  },
}: {
  permissions?: Permissions;
}) {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard/orders",
      label: "Orders",
      perm: permissions.view_orders,
    },
    {
      href: "/dashboard/menu",
      label: "Menu",
      perm: permissions.view_menu,
    },
    {
      href: "/dashboard/history",
      label: "History",
      perm: permissions.view_history,
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
        {/* Regular nav links */}
        {links.map((link) =>
          link.perm ? (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${
                pathname === link.href ? styles.active : ""
              }`}
            >
              {link.label}
            </Link>
          ) : (
            <span
              key={link.href}
              className={`${styles.link} ${styles.disabled}`}
              aria-disabled="true"
            >
              {link.label}
            </span>
          )
        )}

        {/* Favorites (★) */}
        <button
          aria-label="Favorites"
          onClick={
            permissions.view_reviews
              ? () => (window.location.href = "/dashboard/favorites")
              : undefined
          }
          className={`${styles.starButton} ${
            pathname === "/dashboard/reviews" ? styles.starActive : ""
          } ${!permissions.view_reviews ? styles.disabled : ""}`}
          disabled={!permissions.view_reviews}
        >
          ★
        </button>

        {/* Create/View Accounts */}
        <button
          aria-label="View Account"
          onClick={
            permissions.create_account
              ? () => (window.location.href = "/dashboard/view-accounts")
              : undefined
          }
          className={`${styles.starButton} ${
            pathname === "/dashboard/view-accounts" ||
            pathname === "/auth/create-account"
              ? styles.starActive
              : ""
          } ${!permissions.create_account ? styles.disabled : ""}`}
          disabled={!permissions.create_account}
        >
          <Image
            src={
              pathname === "/dashboard/view-accounts" ||
              pathname === "/auth/create-account"
                ? "/create-account-selected.png"
                : "/create-account.png"
            }
            alt="Create Account"
            width={24}
            height={24}
            style={{ opacity: permissions.create_account ? 1 : 0.5 }}
          />
        </button>
      </nav>
    </footer>
  );
}
