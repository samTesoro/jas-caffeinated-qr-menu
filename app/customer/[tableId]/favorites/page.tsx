import CustomerMenu from '@/components/customer/menu';

export default async function FavoritesPage({ params }: { params: { tableId: string } }) {
  const { tableId } = params;
  return <CustomerMenu tableId={tableId} initialTab="Favorites" />;
}
