import CustomerMenu from '@/components/customer/menu';

export default async function SessionFavoritesPage(props: { params: { tableId: string, sessionId: string } }) {
  const { tableId, sessionId } = props.params;
  return <CustomerMenu tableId={tableId} sessionId={sessionId} initialTab="Favorites" />;
}