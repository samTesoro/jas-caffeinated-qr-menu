import { redirect } from 'next/navigation';

type PageProps = { params: Promise<{ tableId: string }> };

export default async function DrinksPage({ params }: PageProps) {
  const { tableId } = await params;
  redirect(`/customer/${tableId}/session/${crypto.randomUUID()}/drinks`);
}
