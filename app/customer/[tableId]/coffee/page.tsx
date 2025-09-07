import CustomerMenu from '@/components/customer/menu';

export default async function CoffeePage(props: any) {
  const { params } = await props;
  const { tableId } = params;
  return <CustomerMenu tableId={tableId} initialTab="Coffee" />;
}
