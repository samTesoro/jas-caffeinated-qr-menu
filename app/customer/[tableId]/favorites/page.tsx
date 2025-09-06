import CustomerMenu from '@/components/customer/menu';

export default function CustomerFavoritesPage({ params }: { params: { tableId: string } }) {
  // You can pass a prop to filter for favorites items in the menu component
  return <CustomerMenu tableId={params.tableId} tab="favorites" />;
}
