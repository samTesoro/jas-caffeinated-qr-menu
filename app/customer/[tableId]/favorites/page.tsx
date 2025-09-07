import CustomerMenu from '@/components/customer/menu';

export default function FavoritesPage({ params }: { params: { tableId: string } }) {
  return <CustomerMenu tableId={params.tableId} initialTab="Favorites" />;
}
