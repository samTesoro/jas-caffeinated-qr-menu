import CustomerMenu from '@/components/customer/menu';

export default function CoffeePage({ params }: { params: { tableId: string } }) {
  return <CustomerMenu tableId={params.tableId} initialTab="Coffee" />;
}
