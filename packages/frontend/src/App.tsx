import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';

// Admin
import { AdminPage } from './features/admin-dashboard/AdminPage';
import { ProfilePage } from './features/admin-dashboard/ProfilePage';
import AdminLayout from './components/AdminLayout';
import { CategoryPage } from './features/admin-menu/CategoryPage';
import { PhotoPage } from './features/admin-menu/PhotoPage';
import { MenuItemsPage } from './features/admin-menu/MenuItemsPage';
import ModifierManager from './features/admin-modifiers/ModifierManager';
import AttachModifiersToItem from './features/admin-modifiers/AttachModifiersToItem';
import { OrderHistoryPage } from './features/order/OrderHistoryPage';
import { AdminReviewsPage } from './features/review/AdminReviewsPage';
import { ReportPage } from './features/report/ReportPage';

// Auth
import { LoginScreen } from './features/auth/LoginScreen';
import { RegisterScreen } from './features/auth/RegisterScreen';

// Customer / Guest
import { ScanPage } from './features/customer-view/ScanPage';
import GuestMenuPage from './features/guest-menu/GuestMenuPage';
import PaymentPage from './features/payment/PaymentPage';

//import tạm để test
import { ReviewPage } from './features/review/ReviewPage';
import { GuestOrderStatus } from './features/guest-menu/components/GuestOrderStatus'; // Import component mới
/* =======================
   PROTECTED ROUTE
======================= */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/* =======================
   APP
======================= */
function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/reviews" element={<ReviewPage />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/menu" element={<ScanPage />} />
      <Route path="/guest-menu" element={<GuestMenuPage />} />
      <Route path="/guest/order-status" element={<GuestOrderStatus />} /> {/* Route test mới */}
      <Route path="/payment" element={<PaymentPage />} />

      {/* ===== ADMIN ROUTES (PROTECTED) ===== */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route
          index
          element={
            <div className="p-8">
              <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your restaurant tables
                </p>
              </header>
              <AdminPage />
            </div>
          }
        />

        {/* Categories */}
        <Route
          path="categories"
          element={
            <div className="p-8">
              <CategoryPage />
            </div>
          }
        />

        {/* Photos */}
        <Route
          path="photos"
          element={
            <div className="p-8">
              <PhotoPage />
            </div>
          }
        />
        <Route path="photos/:itemId" element={<PhotoPage />} />

        {/* Menu Items */}
        <Route
          path="items"
          element={
            <div className="p-8">
              <MenuItemsPage />
            </div>
          }
        />

        {/* Modifiers */}
        <Route
          path="modifiers"
          element={
            <div className="p-8">
              <ModifierManager />
            </div>
          }
        />
        <Route
          path="modifiers/attach"
          element={
            <div className="p-8">
              <AttachModifiersToItem />
            </div>
          }
        />

        {/* Orders */}
        <Route
          path="orders"
          element={
            <div className="p-8">
              <OrderHistoryPage />
            </div>
          }
        />

        {/* Reviews */}
        <Route
          path="reviews"
          element={
            <div className="p-8">
              <AdminReviewsPage />
            </div>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <div className="p-8">
              <ReportPage />
            </div>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <ProfilePage />
          }
        />
      </Route>

      {/* ===== DEFAULT ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<h2 className="text-red-500 p-8">404 - Not Found</h2>} />
    </Routes>
  );
}

export default App;
