"use client";
import CartPage from '../../../../components/customer/cart-page';
import { useParams } from 'next/navigation';

export default function CustomerCart() {
  // Get tableId from route params
  const params = useParams();
  const tableId = params?.tableId;
  // Optionally, you could fetch customer_id here if needed
  return <CartPage tableId={tableId} />;
}
