import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

import { MenuLoader } from './components/MenuLoader';
import { ErrorScreen } from './components/ErrorScreen';
import { MockMenu } from './components/MockMenu';

// Kiểu dữ liệu trả về từ API verify
interface VerifyResponse {
  valid: boolean;
  tableId: string;
  tableNumber: string;
  message?: string;
}

type PageStatus = 'loading' | 'success' | 'error';

export const ScanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [tableInfo, setTableInfo] = useState<{ tableId: string; tableNumber: string } | null>(null);

  // Lấy token từ URL: /menu?token=...
  const token = searchParams.get('token');

  const verifyToken = async () => {
    // Nếu không có token trên URL
    if (!token) {
      setStatus('error');
      setErrorMessage('Không tìm thấy mã QR. Vui lòng quét lại mã QR trên bàn.');
      return;
    }

    setStatus('loading');

    try {
      // Gọi API verify của Backend
      const response = await axios.get<VerifyResponse>('/api/qr/verify', {
        params: { token }
      });

      if (response.data.valid) {
        setTableInfo({
          tableId: response.data.tableId,
          tableNumber: response.data.tableNumber,
        });
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(response.data.message || 'Mã QR không hợp lệ.');
      }
    } catch (error: any) {
      setStatus('error');
      // Lấy message từ response error nếu có
      const message = error.response?.data?.message || 'Mã QR không hợp lệ hoặc đã hết hạn.';
      setErrorMessage(message);
    }
  };

  // Gọi verify khi component mount hoặc token thay đổi
  useEffect(() => {
    verifyToken();
  }, [token]);

  // Render dựa trên status
  if (status === 'loading') {
    return <MenuLoader />;
  }

  if (status === 'error') {
    return (
      <ErrorScreen 
        message={errorMessage} 
        onRetry={token ? verifyToken : undefined} 
      />
    );
  }

  // status === 'success'
  if (tableInfo) {
    return (
      <MockMenu 
        tableNumber={tableInfo.tableNumber} 
        tableId={tableInfo.tableId} 
      />
    );
  }

  // Fallback (không nên xảy ra)
  return <MenuLoader />;
};
