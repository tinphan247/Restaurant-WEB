import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminPage } from './features/admin-dashboard/AdminPage';
import { ScanPage } from './features/customer-view/ScanPage';
import ModifierManager from './features/admin-modifiers/ModifierManager';
import AttachModifiersToItem from './features/admin-modifiers/AttachModifiersToItem';
import GuestMenuPage from './features/guest-menu/GuestMenuPage';
import AdminLayout from './components/AdminLayout';
import PaymentPage from './features/payment/PaymentPage';

// IMPORT CÁC COMPONENT MỚI CỦA BẠN TẠI ĐÂY
import { CategoryPage } from './features/admin-menu/CategoryPage';
import { PhotoPage } from './features/admin-menu/PhotoPage';
import { MenuItemsPage } from './features/admin-menu/MenuItemsPage';

function App() {
  return (
    <Routes>
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
      
      {/* 5. Menu Items Management (Tạm thời giữ placeholder cho Person 2) */}
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
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;