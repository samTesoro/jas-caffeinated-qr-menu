import { redirect } from 'next/navigation';

export default function CustomerAccess() {
  const tableId = 'demo';
  const sessionId = crypto.randomUUID();
  redirect(`/customer/${tableId}/session/${sessionId}`);
}
