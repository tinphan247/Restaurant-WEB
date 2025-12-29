import { useState } from 'react';
import { paymentApi } from '../services/paymentApi';
import type { Payment, CreatePaymentDto } from '../types/payment';
export function usePayment() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [payment, setPayment] = useState<Payment | undefined>();
  const [loading, setLoading] = useState(false);

  const pay = async (data: CreatePaymentDto) => {
    setLoading(true);
    setStatus('pending');
    setError(undefined);
    try {
      const result = await paymentApi.createPayment(data);
      setPayment(result);
      setStatus(result.status);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return { pay, status, error, payment, loading };
}
