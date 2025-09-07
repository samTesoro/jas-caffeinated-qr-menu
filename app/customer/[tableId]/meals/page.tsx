import CustomerMenu from '@/components/customer/menu';

export default function MealsPage({ params }: { params: { tableId: string } }) {
  return <CustomerMenu tableId={params.tableId} initialTab="Meals" />;
}
