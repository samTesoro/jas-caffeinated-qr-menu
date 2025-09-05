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
	const supabase = createClient();
	const pathname = usePathname();

	const [permissions, setPermissions] = useState<Permissions>({
		view_meals: false,
		view_coffee: false,
		view_drinks: false,
		view_favorites: false,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPermissions = async () => {
			try {
				const { data: user, error: userError } = await supabase.auth.getUser();
				if (userError || !user?.user) {
					console.error("Error fetching user or user not logged in:", userError);
					setLoading(false);
					return;
				}

				const userId = user.user.id;
				console.log("Fetched user ID:", userId);

				const { data: permissionsData, error: permissionsError } = await supabase
					.from("customerpermissions")
					.select("view_meals, view_coffee, view_drinks, view_favorites")
					.eq("user_id", userId)
					.single();

				if (permissionsError) {
					console.error("Error fetching permissions:", permissionsError);
					setLoading(false);
					return;
				}

				console.log("Fetched permissions data:", permissionsData);

				if (permissionsData) {
					setPermissions(permissionsData);
				}
			} catch (error) {
				console.error("Unexpected error fetching permissions:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPermissions();
	}, [supabase]);

	if (loading) {
		return <div>Loading...</div>;
	}

	// New order: Meals, Coffee, Cart, Drinks, Favorites
	return (
		<footer className={styles.taskbar}>
			<div className={styles.nav}>
				{/* Meals */}
				<div className="flex flex-col items-center">
					<Link href="/customer" className={styles.link}>
						<Image
							src={pathname === "/customer" ? "/meals-icon-selected.png" : "/meals-icon.png"}
							alt="Meals"
							width={70}
							height={70}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === "/customer" ? styles.active : styles.link}>Meals</span>
					</Link>
				</div>

				{/* Coffee */}
				<div className="flex flex-col items-center">
					<Link href="/customer/coffee" className={styles.link}>
						<Image
							src={pathname === "/customer/coffee" ? "/coffee-meals-icon-selected.png" : "/coffee-meals-icon.png"}
							alt="Coffee"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === "/customer/coffee" ? styles.active : styles.link}>Coffee</span>
					</Link>
				</div>

				{/* Cart Button (centered) */}
				<div className="relative flex flex-col items-center" style={{ margin: "0 16px" }}>
					<Link href="/customer/cart">
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
					<Link href="/customer/drinks" className={styles.link}>
						<Image
							src={pathname === "/customer/drinks" ? "/drinks-icon-selected.png" : "/drinks-icon.png"}
							alt="Drinks"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === "/customer/drinks" ? styles.active : styles.link}>Drinks</span>
					</Link>
				</div>

				{/* Favorites */}
				<div className="flex flex-col items-center">
					<Link href="/customer/favorites" className={styles.link}>
						<Image
							src={pathname === "/customer/favorites" ? "/favorites-icon-selected.png" : "/favorites-icon.png"}
							alt="Favorites"
							width={40}
							height={40}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === "/customer/favorites" ? styles.active : styles.link}>Favorites</span>
					</Link>
				</div>
			</div>
		</footer>
	);
}
