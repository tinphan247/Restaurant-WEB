import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AdminPage } from './features/admin-dashboard/AdminPage';
import { ScanPage } from './features/customer-view/ScanPage';
import ModifierManager from './features/admin-modifiers/ModifierManager';
import AttachModifiersToItem from './features/admin-modifiers/AttachModifiersToItem';
import GuestMenuPage from './features/guest-menu/GuestMenuPage';
import AdminLayout from './components/AdminLayout';
import PaymentPage from './features/payment/PaymentPage';
import SelectPaymentMethodPage from './features/payment/SelectPaymentMethodPage';

import { CategoryPage } from './features/admin-menu/CategoryPage';
import { PhotoPage } from './features/admin-menu/PhotoPage';
import { MenuItemsPage } from './features/admin-menu/MenuItemsPage';
import { LoginScreen } from './features/auth/LoginScreen'; // 1. Thêm LoginScreen
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    // Lưu lại vị trí đang truy cập để sau khi login xong có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
import { OrderHistoryPage } from './features/order/OrderHistoryPage';
function App() {
  return (
    <Routes>
      {/* 3. Route công khai cho Đăng nhập */}
      <Route path="/login" element={<LoginScreen />} />

      {/* 4. Nhóm các Route Admin vào ProtectedRoute */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout>
            <div className="p-8">
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your restaurant tables</p>
              </header>
              <AdminPage />
            </div>
          </AdminLayout>
        </ProtectedRoute>
      } />
      {/* 1. Dashboard (Quản lý bàn) */}
      <Route path="/admin" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant tables</p>
            </header>
            <AdminPage />
          </div>
        </AdminLayout>
      } />
      
      {/* 2. QUẢN LÝ DANH MỤC (Đã cập nhật từ placeholder sang Component thật) */}
      <Route path="/admin/categories" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
              <p className="text-gray-600 mt-1">Manage menu categories and their display order</p>
            </header>
            <CategoryPage />
          </div>
        </AdminLayout>
      } />

      {/* ROUTE QUẢN LÝ ẢNH: Cho phép thêm hình ảnh vào một món ăn cụ thể */}
      {/* Sửa lại route Photo để có thể vào trực tiếp /admin/photos */}
      <Route path="/admin/photos" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Photo Management</h1>
              <p className="text-gray-600 mt-1">Tải lên và quản lý thư viện hình ảnh</p>
            </header>
            <PhotoPage /> 
          </div>
        </AdminLayout>
      } />

      {/* Route hỗ trợ có ID món ăn cụ thể */}
      <Route path="/admin/photos/:itemId" element={
        <AdminLayout>
          <PhotoPage />
        </AdminLayout>
      } />

      {/* 4. Quản lý Modifiers (Giữ nguyên) */}
      <Route path="/admin/modifiers" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Modifier Management</h1>
              <p className="text-gray-600 mt-1">Create and manage modifier groups & options</p>
            </header>
            <ModifierManager />
          </div>
        </AdminLayout>
      } />

      <Route path="/admin/modifiers/attach" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Gắn Modifiers vào Món</h1>
              <p className="text-gray-600 mt-1">Chọn modifier groups và gắn vào món theo Item ID</p>
            </header>
            <AttachModifiersToItem />
          </div>
        </AdminLayout>
      } />
      
      {/* 5. Menu Items Management */}
      <Route path="/admin/items" element={
        <AdminLayout>
          <div className="p-8">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Menu Items Management</h1>
              <p className="text-gray-600 mt-1">Manage menu items (CRUD, filters, pagination)</p>
            </header>
            <MenuItemsPage />
          </div>
        </AdminLayout>
      } />
      
      {/* 6. Customer & Guest Routes (Giữ nguyên) */}
      <Route path="/menu" element={<ScanPage />} />
      <Route path="/guest-menu" element={<GuestMenuPage />} />
      <Route path="/select-payment-method" element={<SelectPaymentMethodPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/orders" element={
        <AdminLayout>
          <OrderHistoryPage />
        </AdminLayout>
      } />

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;