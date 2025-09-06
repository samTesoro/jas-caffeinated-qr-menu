"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./taskbar-customer.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const tabs = [
	{ label: "Meals", icon: "/customer-meals-icon.png", selectedIcon: "/customer-meals-icon-selected.png" },
	{ label: "Coffee", icon: "/coffee-meals-icon.png", selectedIcon: "/coffee-meals-icon-selected.png" },
	{ label: "Drinks", icon: "/drinks-icon.png", selectedIcon: "/drinks-icon-selected.png" },
	{ label: "Favorites", icon: "/favorites-icon.png", selectedIcon: "/favorites-icon-selected.png" },
];

type Permissions = {
	[key: string]: boolean;
};

export default function MenuTaskbar() {
	const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

	// Get tableId from URL (do not use localStorage)
	let tableId: string | null = null;
	if (typeof window !== 'undefined') {
		const match = window.location.pathname.match(/customer\/(\d+)/);
		if (match) {
			tableId = match[1];
		}
	}

	return (
		<footer className={styles.taskbar}>
			<div className={styles.nav}>
				{/* Meals */}
				<div className="flex flex-col items-center">
					<Link href={tableId ? `/customer/${tableId}` : "/customer"} className={styles.link}>
						<Image
							src={pathname === `/customer/${tableId}` ? "/meals-icon-selected.png" : "/meals-icon.png"}
							alt="Meals"
							width={70}
							height={70}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === `/customer/${tableId}` ? styles.active : styles.link}>Meals</span>
					</Link>
				</div>

				{/* Coffee */}
				<div className="flex flex-col items-center">
					<Link href={tableId ? `/customer/${tableId}/coffee` : "/customer/coffee"} className={styles.link}>
						<Image
							src={pathname === `/customer/${tableId}/coffee` ? "/coffee-meals-icon-selected.png" : "/coffee-meals-icon.png"}
							alt="Coffee"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === `/customer/${tableId}/coffee` ? styles.active : styles.link}>Coffee</span>
					</Link>
				</div>

				{/* Cart Button (centered) */}
				<div className="relative flex flex-col items-center" style={{ margin: "0 16px" }}>
					<Link href={tableId ? `/customer/${tableId}/cart` : '/customer/cart'}>
						<button className="rounded-full p-4 shadow-lg flex items-center justify-center" style={{ position: "relative", top: "-30px", background: "#E59C53" }}>
							<img
								src="/shopping-cart-icon.png"
								alt="Cart"
								width={32}
								height={32}
								style={{ objectFit: 'contain'}}
							/>
						</button>
					</Link>
				</div>

				{/* Drinks */}
				<div className="flex flex-col items-center">
					<Link href={tableId ? `/customer/${tableId}/drinks` : "/customer/drinks"} className={styles.link}>
						<Image
							src={pathname === `/customer/${tableId}/drinks` ? "/drinks-icon-selected.png" : "/drinks-icon.png"}
							alt="Drinks"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === `/customer/${tableId}/drinks` ? styles.active : styles.link}>Drinks</span>
					</Link>
				</div>

				{/* Favorites */}
				<div className="flex flex-col items-center">
					<Link href={tableId ? `/customer/${tableId}/favorites` : "/customer/favorites"} className={styles.link}>
						<Image
							src={pathname === `/customer/${tableId}/favorites` ? "/favorites-icon-selected.png" : "/favorites-icon.png"}
							alt="Favorites"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === `/customer/${tableId}/favorites` ? styles.active : styles.link}>Favorites</span>
					</Link>
				</div>
			</div>
		</footer>
	);
}
