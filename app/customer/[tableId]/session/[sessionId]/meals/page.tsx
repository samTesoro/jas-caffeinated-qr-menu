import CustomerMenu from '@/components/customer/menu';

export default async function SessionMealsPage(props: { params: Promise<{ tableId: string, sessionId: string }> }) {
  const { tableId, sessionId } = await props.params;
  return <CustomerMenu tableId={tableId} sessionId={sessionId} initialTab="Meals" />;
}