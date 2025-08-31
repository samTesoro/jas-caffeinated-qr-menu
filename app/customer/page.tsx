import CustomerMenu from '@/components/customer/menu';

export default function CustomerAccess() {
  // Use a default tableId for demo purposes
  return (
    <>
      <CustomerMenu tableId="demo" />
  <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}>
        <a href="/dashboard">
          <button style={{ padding: '8px 16px', background: '#f59e42', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}>
            Go to Dashboard (Debug)
          </button>
        </a>
      </div>
    </>
  );
}
