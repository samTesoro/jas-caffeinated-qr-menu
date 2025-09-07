import CustomerMenu from '@/components/customer/menu';

export default async function CoffeePage({ params }: { params: { tableId: string } }) {
  const { tableId } = params;
  return <CustomerMenu tableId={tableId} initialTab="Coffee" />;
}
