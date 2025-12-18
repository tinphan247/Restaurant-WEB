import React from 'react';

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  title = 'Lỗi Xác Thực', 
  message, 
  onRetry 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon lỗi */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg 
            className="h-10 w-10 text-red-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        
        {/* Thông báo lỗi */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Gợi ý */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-gray-700 mb-2">Nguyên nhân có thể:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Mã QR đã hết hạn sử dụng</li>
            <li>• Mã QR đã được thay mới</li>
            <li>• Đường link không chính xác</li>
          </ul>
        </div>

        {/* Nút hành động */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200"
            >
              Thử Lại
            </button>
          )}
          <p className="text-sm text-gray-500">
            Vui lòng quét lại mã QR hoặc liên hệ nhân viên để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};
