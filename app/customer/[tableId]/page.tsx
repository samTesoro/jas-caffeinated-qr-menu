import CustomerMenu from '@/components/customer/menu';

export default function CustomerPage({ params }: { params: { tableId: string } }) {
  return <CustomerMenu tableId={params.tableId} />;
}
