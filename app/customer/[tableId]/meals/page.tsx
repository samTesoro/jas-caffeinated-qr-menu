import CustomerMenu from '@/components/customer/menu';

export default function CustomerMealsPage({ params }: { params: { tableId: string } }) {
  // You can pass a prop to filter for meals items in the menu component
  return <CustomerMenu tableId={params.tableId} tab="meals" />;
}
