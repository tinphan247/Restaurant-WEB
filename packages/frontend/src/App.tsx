import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminPage } from './features/admin-dashboard/AdminPage';
import { ScanPage } from './features/customer-view/ScanPage';

function App() {
  return (
    <Routes>
      {/* Tuyến đường chính cho Admin Dashboard */}
      <Route path="/admin" element={
        <div className="min-h-screen bg-gray-100 p-8">
          <header className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-indigo-700">
              Restaurant Order System Dashboard
            </h1>
          </header>
          <AdminPage />
        </div>
      } />
      
      {/* Tuyến đường cho Khách hàng quét QR (Người 2) - Không có header admin */}
      <Route path="/menu" element={<ScanPage />} />

      {/* Chuyển hướng mặc định về trang Admin để bắt đầu */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      
      {/* Tuyến đường 404 cơ bản */}
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;