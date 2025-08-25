"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar.module.css";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { useState } from "react";

type Permissions = {
  view_orders?: boolean;
  view_history?: boolean;
  view_menu?: boolean;
  view_favorites?: boolean;
  create_account?: boolean;
};

export default function Taskbar({
  permissions = {
    view_orders: true,
    view_history: true,
    view_menu: true,
    view_favorites: true,
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

  // Star (favorites/reviews) permission
  const canFavorites = permissions.view_favorites;
  // Create account permission
  const canCreateAccount = permissions.create_account;

  return (
    <footer className={styles.taskbar}>
      <div className={styles.backButton}>
        <LogoutButton>
          <Image src="/back-button.png" alt="Back" className={styles.backIcon} width={25} height={25} />
        </LogoutButton>
      </div>
      <nav className={styles.nav}>
        {links.map((link) =>
          link.perm ? (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
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

        {/* Favorites/Star */}
        <button
          className={`${styles.starButton} ${pathname === "/dashboard/favorites" ? styles.starActive : ""} ${!canFavorites ? styles.disabled : ""}`}
          onClick={canFavorites ? () => (window.location.href = "/dashboard/favorites") : undefined}
          aria-label="Favorites"
          disabled={!canFavorites}
        >
          ★
        </button>

        {/* View Account */}
        <button
          aria-label="View Account"
          onClick={canCreateAccount ? () => (window.location.href = "/dashboard/view-accounts") : undefined}
          className={`${styles.starButton} ${pathname === "/dashboard/view-accounts" ? styles.starActive : ""} ${!canCreateAccount ? styles.disabled : ""}`}
          disabled={!canCreateAccount}
        >
          <Image
            src={
              pathname === "/dashboard/view-accounts" || pathname === "/auth/create-account"
                ? "/create-account-selected.png"
                : "/create-account.png"
            }
            alt="Create Account"
            width={24}
            height={24}
            style={{ opacity: canCreateAccount ? 1 : 0.5 }}
          />
        </button>
      </nav>
    </footer>
  );
}