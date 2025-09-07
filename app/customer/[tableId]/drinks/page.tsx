import CustomerMenu from '@/components/customer/menu';

export default function DrinksPage({ params }: { params: { tableId: string } }) {
  return <CustomerMenu tableId={params.tableId} initialTab="Drinks" />;
}
