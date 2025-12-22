import React from 'react';

export const MenuLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
          {/* Icon nhà hàng */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang xác thực...</h2>
        <p className="text-gray-500">Vui lòng chờ trong giây lát</p>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
};
