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
  const [cartCount, setCartCount] = useState(0); // 🔸 Track cart item count
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    setCartCount(savedCart.length);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartCount(updatedCart.length);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  // Use prop tableId first, then extract from pathname as fallback
  const tableId = useMemo(() => {
    if (propTableId) return propTableId;
    const match = pathname.match(/customer\/(\w+)/);
    return match ? match[1] : null;
  }, [pathname, propTableId]);

  // Helper function to check if path is active
  const isPathActive = (path: string) => {
    // Check session-based route first, then table-based route
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

              {/* 🔸 CART BADGE START */}
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "red",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {cartCount}
                </span>
              )}
              {/* 🔸 CART BADGE END */}
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
