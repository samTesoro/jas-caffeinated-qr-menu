import { redirect } from 'next/navigation';

type PageProps = { params: Promise<{ tableId: string }> };

export default async function CartEntry({ params }: PageProps) {
	const { tableId } = await params;
	// Generate a session and redirect to the sessioned cart route
	const sessionId = crypto.randomUUID();
	redirect(`/customer/${tableId}/session/${sessionId}/cart`);
}
