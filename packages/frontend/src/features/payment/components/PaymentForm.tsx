import React, { useState } from 'react';


export interface PaymentFormProps {
  onSubmit: (data: { orderId: string; amount: number; method: 'stripe' | 'momo' }) => void;
  loading?: boolean;
  defaultOrderId?: string;
  defaultAmount?: number;
}


export default function PaymentForm({ onSubmit, loading, defaultOrderId, defaultAmount }: PaymentFormProps) {
  const [orderId, setOrderId] = useState(defaultOrderId || '');
  const [amount, setAmount] = useState(defaultAmount ?? 0);
  const [method, setMethod] = useState<'stripe' | 'momo'>('stripe');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ orderId, amount, method });
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div>
        <label>Order ID:</label>
        <input value={orderId} onChange={e => setOrderId(e.target.value)} required />
      </div>
      <div>
        <label>Amount:</label>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required min={1} />
      </div>
      <div>
        <label>Method:</label>
        <select value={method} onChange={e => setMethod(e.target.value as 'stripe' | 'momo')}>
          <option value="stripe">Stripe</option>
          <option value="momo">MoMo</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Pay'}</button>
    </form>
  );
}
