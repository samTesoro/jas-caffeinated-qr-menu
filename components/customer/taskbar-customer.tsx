"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import styles from "./taskbar-customer.module.css";
import Image from "next/image";

export default function MenuTaskbar({
  tableId: propTableId,
  sessionId,
}: {
  tableId?: string;
  sessionId?: string;
}) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0); // 🔸 Dreame fix - Track cart item count

  // 🔸 Dreame fix - Initialize cart count from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const uniqueCount = Array.isArray(savedCart)
      ? (() => {
          const ids = new Set<string>();
          for (const i of savedCart) {
            const id =
              (i &&
                (i.menuitem_id ??
                  i.id ??
                  i?.menuitem?.menuitem_id ??
                  i?.menuitem?.id)) ??
              null;
            if (id !== null && id !== undefined) ids.add(String(id));
            else {
              // Fallback: attempt to build a stable key from name
              const key = i?.name ?? i?.menuitem?.name ?? JSON.stringify(i);
              ids.add(String(key));
            }
          }
          return ids.size;
        })()
      : 0;
    setCartCount(uniqueCount);
  }, []);

  // 🔸 Dreame fix - Update count when localStorage changes
  useEffect(() => {
    const recalc = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const uniqueCount = Array.isArray(updatedCart)
        ? (() => {
            const ids = new Set<string>();
            for (const i of updatedCart) {
              const id =
                (i &&
                  (i.menuitem_id ??
                    i.id ??
                    i?.menuitem?.menuitem_id ??
                    i?.menuitem?.id)) ??
                null;
              if (id !== null && id !== undefined) ids.add(String(id));
              else {
                const key = i?.name ?? i?.menuitem?.name ?? JSON.stringify(i);
                ids.add(String(key));
              }
            }
            return ids.size;
          })()
        : 0;
      setCartCount(uniqueCount);
    };
    // Listen to both native storage changes (other tabs) and a custom event we dispatch locally
    window.addEventListener("storage", recalc);
    window.addEventListener("cart-updated", recalc as EventListener);
    return () => {
      window.removeEventListener("storage", recalc);
      window.removeEventListener("cart-updated", recalc as EventListener);
    };
  }, []);

  // Use prop tableId first, then extract from pathname as fallback
  const tableId = useMemo(() => {
    if (propTableId) return propTableId;
    if (!pathname) return null;
    const match = pathname.match(/customer\/(\w+)/);
    return match ? match[1] : null;
  }, [pathname, propTableId]);

  // Helper function to check if path is active
  const isPathActive = (path: string) => {
    const sessionPath =
      tableId && sessionId
        ? `/customer/${tableId}/session/${sessionId}/${path}`
        : null;
    const tablePath = tableId ? `/customer/${tableId}/${path}` : null;
    const basePath = `/customer/${path}`;

    return (
      pathname === sessionPath ||
      pathname === tablePath ||
      pathname === basePath
    );
  };

  return (
    <footer className={styles.taskbar}>
      <div className={styles.nav}>
        {/* Meals */}
        <div className="flex flex-col items-center">
          <Link
            href={
              tableId && sessionId
                ? `/customer/${tableId}/session/${sessionId}/meals`
                : tableId
                ? `/customer/${tableId}/meals`
                : "/customer/meals"
            }
            className={styles.link}
          >
            <Image
              src={
                isPathActive("meals")
                  ? "/meals-icon-selected.png"
                  : "/meals-icon.png"
              }
              alt="Meals"
              width={70}
              height={70}
              className={styles.icon}
              unoptimized
            />
            <span
              className={isPathActive("meals") ? styles.active : styles.link}
            >
              Meals
            </span>
          </Link>
        </div>

        {/* Coffee */}
        <div className="flex flex-col items-center">
          <Link
            href={
              tableId && sessionId
                ? `/customer/${tableId}/session/${sessionId}/coffee`
                : tableId
                ? `/customer/${tableId}/coffee`
                : "/customer/coffee"
            }
            className={styles.link}
          >
            <Image
              src={
                isPathActive("coffee")
                  ? "/coffee-meals-icon-selected.png"
                  : "/coffee-meals-icon.png"
              }
              alt="Coffee"
              width={40}
              height={40}
              className={styles.icon}
              unoptimized
            />
            <span
              className={isPathActive("coffee") ? styles.active : styles.link}
            >
              Coffee
            </span>
          </Link>
        </div>

        {/* Cart */}
        <div
          className="relative flex flex-col items-center"
          style={{ margin: "0 16px" }}
        >
          <Link
            href={
              tableId && sessionId
                ? `/customer/${tableId}/session/${sessionId}/cart`
                : tableId
                ? `/customer/${tableId}/cart`
                : "/customer/cart"
            }
          >
            <button
              className="rounded-full shadow-lg flex items-center justify-center relative hover:bg-orange-900"
              style={{
                width: "64px",
                height: "64px",
                background: "#E59C53",
                position: "relative",
                top: "-30px",
              }}
            >
              <Image
                src="/shopping-cart-icon.png"
                alt="Cart"
                width={28}
                height={28}
                style={{ objectFit: "contain" }}
                priority
              />

              {/* 🔸 Dreame fix - Badge display */}
              {cartCount > 0 && (
                <span
                  className={styles.cartBadge}
                  title={`${cartCount} item${cartCount > 1 ? "s" : ""} in cart`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>

        {/* Drinks */}
        <div className="flex flex-col items-center">
          <Link
            href={
              tableId && sessionId
                ? `/customer/${tableId}/session/${sessionId}/drinks`
                : tableId
                ? `/customer/${tableId}/drinks`
                : "/customer/drinks"
            }
            className={styles.link}
          >
            <Image
              src={
                isPathActive("drinks")
                  ? "/drinks-icon-selected.png"
                  : "/drinks-icon.png"
              }
              alt="Drinks"
              width={40}
              height={40}
              className={styles.icon}
              unoptimized
            />
            <span
              className={isPathActive("drinks") ? styles.active : styles.link}
            >
              Drinks
            </span>
          </Link>
        </div>

        {/* Favorites */}
        <div className="flex flex-col items-center">
          <Link
            href={
              tableId && sessionId
                ? `/customer/${tableId}/session/${sessionId}/favorites`
                : tableId
                ? `/customer/${tableId}/favorites`
                : "/customer/favorites"
            }
            className={styles.link}
          >
            <Image
              src={
                isPathActive("favorites")
                  ? "/favorites-icon-selected.png"
                  : "/favorites-icon.png"
              }
              alt="Favorites"
              width={40}
              height={40}
              className={styles.icon}
              unoptimized
            />
            <span
              className={
                isPathActive("favorites") ? styles.active : styles.link
              }
            >
              Favorites
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
