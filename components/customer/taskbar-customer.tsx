"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import styles from "./taskbar-customer.module.css";
import Image from "next/image";



export default function MenuTaskbar() {
	const pathname = usePathname();
	// Memoize tableId extraction for better runtime
	const tableId = useMemo(() => {
		const match = pathname.match(/customer\/(\w+)/);
		return match ? match[1] : null;
	}, [pathname]);

	return (
		<footer className={styles.taskbar}>
			<div className={styles.nav}>
				{/* Meals */}
				<div className="flex flex-col items-center">
					<Link href={tableId ? `/customer/${tableId}/meals` : "/customer/meals"} className={styles.link}>
						<Image
							src={pathname === `/customer/${tableId}/meals` ? "/meals-icon-selected.png" : "/meals-icon.png"}
							alt="Meals"
							width={70}
							height={70}
							className={styles.icon}
							unoptimized
						/>
						<span className={pathname === `/customer/${tableId}/meals` ? styles.active : styles.link}>Meals</span>
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
							<Image
								src="/shopping-cart-icon.png"
								alt="Cart"
								width={32}
								height={32}
								style={{ objectFit: 'contain'}}
								priority
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
