export default function SessionCashCardOrderConfirmation({ params }: { params: { tableId: string, sessionId: string } }) {
  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been sent to the kitchen.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Table Number</p>
          <p className="text-lg font-semibold text-gray-800">{params.tableId}</p>
          <p className="text-sm text-gray-600 mb-1 mt-2">Session ID</p>
          <p className="text-xs font-mono text-gray-600">{params.sessionId}</p>
          <p className="text-sm text-gray-600 mb-1 mt-2">Payment Method</p>
          <p className="text-lg font-semibold text-orange-600">Cash/Card</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Please wait while we prepare your order. Payment will be collected when your order is ready.
        </p>
        
        <button 
          onClick={() => window.location.href = `/customer/${params.tableId}/session/${params.sessionId}`}
          className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}