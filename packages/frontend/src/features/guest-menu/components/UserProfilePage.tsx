import React from 'react';
import AdminProfilePage from '../../admin-profile/AdminProfilePage';
import type { UserProfile } from '../types/user-profile';

// Nhận dữ liệu user từ props
interface UserProfilePageProps {
  user: UserProfile;
  onProfileUpdate?: (user: UserProfile) => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onProfileUpdate }) => {
  // Chuyển đổi dữ liệu user thành dạng UserProfile cho AdminProfilePage
  const userProfile = {
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    email: user.email,
    avatar: user.avatar,
    role: user.role || 'USER',
    isEmailVerified: user.isEmailVerified || false,
    createdAt: user.createdAt || '',
    updatedAt: user.updatedAt || '',
  };

  // Truyền dữ liệu vào AdminProfilePage qua props (cần chỉnh lại AdminProfilePage để nhận props profile)
  return <AdminProfilePage profileOverride={userProfile} mode="guest" onProfileUpdate={onProfileUpdate} />;
};

export default UserProfilePage;
