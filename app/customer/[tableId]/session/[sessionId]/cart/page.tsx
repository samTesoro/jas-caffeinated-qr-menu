import CartPage from '@/components/customer/cart-page';

export default async function SessionCartPage(props: { params: { tableId: string, sessionId: string } }) {
  const { tableId, sessionId } = props.params;
  return <CartPage tableId={tableId} sessionId={sessionId} />;
}
