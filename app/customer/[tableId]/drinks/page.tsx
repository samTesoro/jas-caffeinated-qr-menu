import CustomerMenu from '@/components/customer/menu';

export default function CustomerDrinksPage({ params }: { params: { tableId: string } }) {
  // You can pass a prop to filter for drinks items in the menu component
  return <CustomerMenu tableId={params.tableId} tab="drinks" />;
}
