import React from 'react';

export interface PaymentStatusProps {
  status?: 'pending' | 'success' | 'failed';
  error?: string;
}

export default function PaymentStatus({ status, error }: PaymentStatusProps) {
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!status) return null;
  if (status === 'pending') return <div>Processing payment...</div>;
  if (status === 'success') return <div style={{ color: 'green' }}>Payment successful!</div>;
  if (status === 'failed') return <div style={{ color: 'red' }}>Payment failed!</div>;
  return null;
}
