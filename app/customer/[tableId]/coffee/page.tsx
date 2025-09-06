import CustomerMenu from '@/components/customer/menu';

export default function CustomerCoffeePage({ params }: { params: { tableId: string } }) {
  // You can pass a prop to filter for coffee items in the menu component
  return <CustomerMenu tableId={params.tableId} tab="coffee" />;
}
