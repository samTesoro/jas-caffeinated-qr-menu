import CartPage from '@/components/customer/cart-page';

export default async function SessionCartPage(props: { params: Promise<{ tableId: string, sessionId: string }> }) {
  const { tableId, sessionId } = await props.params;
  return <CartPage tableId={tableId} sessionId={sessionId} />;
}
