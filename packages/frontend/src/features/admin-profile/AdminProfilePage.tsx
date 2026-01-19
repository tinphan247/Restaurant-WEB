
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminProfileApi } from '../../services/adminProfileApi';
import { userProfileApi } from '../guest-menu/services/userProfileApi';
import {
  ProfileInfoForm,
  ChangePasswordForm,
  AvatarUploadComponent,
  SectionCard,
} from './components';

interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

type EditingSection = 'profile' | 'avatar' | 'password' | 'email' | null;

interface AdminProfilePageProps {
  profileOverride?: UserProfile;
  mode?: 'admin' | 'guest';
  onProfileUpdate?: (newProfile: UserProfile) => void;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ profileOverride, mode = 'admin', onProfileUpdate }) => {
  // Nếu có profileOverride thì dùng, không thì lấy từ API như cũ
  const [profile, setProfile] = useState<UserProfile | null>(profileOverride || null);
  const [updatedProfile, setUpdatedProfile] = useState<UserProfile | null>(null); // NEW
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  // Fetch profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: [mode === 'guest' ? 'user-profile' : 'admin-profile'],
    queryFn: mode === 'guest' ? userProfileApi.getProfile : adminProfileApi.getProfile,
  });

  useEffect(() => {
    if (!profileOverride && profileData?.data) {
      setProfile(profileData.data);
      setUpdatedProfile(null); // Reset updatedProfile khi nhận data mới từ API
    }
  }, [profileData, profileOverride]);

  // Sync profileOverride when it changes
  useEffect(() => {
    if (profileOverride) {
      setProfile(profileOverride);
      setUpdatedProfile(null);
    }
  }, [profileOverride]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; displayName?: string }) =>
      mode === 'guest' ? userProfileApi.updateProfile(data) : adminProfileApi.updateProfile(data),
    onSuccess: (response: any) => {
      if (response.data) {
        setProfile(response.data);
        setUpdatedProfile(response.data); // Lưu user mới cập nhật
        // 🔥 Quan trọng
        queryClient.invalidateQueries({
          queryKey: [mode === 'guest' ? 'user-profile' : 'admin-profile'],
        });

        setEditingSection(null);
        onProfileUpdate?.(response.data);
      }
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => mode === 'guest' ? userProfileApi.changePassword(data) : adminProfileApi.changePassword(data),
    onSuccess: () => {
      setEditingSection(null);
      setSuccessMessages(prev => ({
        ...prev,
        password: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.',
      }));
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, password: '' }));
      }, 5000);
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi thay đổi mật khẩu');
    },
  });


  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => mode === 'guest' ? userProfileApi.uploadAvatar(file) : adminProfileApi.uploadAvatar(file),
    onSuccess: (response) => {
      if (response.data && response.data.avatar) {
        setProfile((prev) => prev ? { ...prev, avatar: response.data.avatar } : prev);
        setUpdatedProfile((prev) => prev ? { ...prev, avatar: response.data.avatar } : prev);
        setEditingSection(null);
        setSuccessMessages(prev => ({
          ...prev,
          avatar: 'Avatar đã được cập nhật thành công!',
        }));

        // Notify parent about update
        if (response.data && response.data.avatar) {
          const currentProfile = updatedProfile || profile;
          if (currentProfile) {
            onProfileUpdate?.({ ...currentProfile, avatar: response.data.avatar });
          }
        }
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, avatar: '' }));
        }, 3000);
      }
    },
    onError: (error: any) => {
      throw new Error(error.response?.data?.message || 'Lỗi tải lên avatar');
    },
  });

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayProfile = updatedProfile || profile;
  if (!displayProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-gray-600">Vui lòng thử lại</p>
        </div>
      </div>
    );
  }

  const isEditing = editingSection !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Hồ Sơ Cá Nhân</h1>
          <p className="text-gray-600">Cập nhật thông tin tài khoản của bạn</p>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="mr-6">
              {displayProfile && displayProfile.avatar ? (
                <img
                  src={displayProfile.avatar}
                  alt={displayProfile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {displayProfile ? displayProfile.name.charAt(0).toUpperCase() : ''}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{displayProfile ? displayProfile.name : ''}</h2>
              <p className="text-gray-600">{displayProfile ? displayProfile.email : ''}</p>
              <div className="flex items-center mt-2 gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {displayProfile ? displayProfile.role : ''}
                </span>
                {displayProfile && displayProfile.isEmailVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Email xác nhận
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-8">
          {/* Profile Info Section */}
          <SectionCard
            title="Thông Tin Cơ Bản"
            description="Cập nhật tên hiển thị và tên đầy đủ"
            isEditing={editingSection === 'profile'}
            isLoading={updateProfileMutation.isPending}
            isDisabled={isEditing && editingSection !== 'profile'}
            onEdit={() => setEditingSection('profile')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const form = document.querySelector('[data-section="profile"] form') as HTMLFormElement;
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
          >
            <div className="space-y-4" data-section="profile">
              <ProfileInfoForm
                initialData={{
                  fullName: displayProfile ? displayProfile.name : '',
                  displayName: displayProfile ? displayProfile.displayName : '',
                }}
                onSubmit={updateProfileMutation.mutateAsync}
                isLoading={updateProfileMutation.isPending}
              />
            </div>
            {successMessages.profile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.profile}
              </div>
            )}
          </SectionCard>

          {/* Avatar Section */}
          <SectionCard
            title="Cập Nhật Avatar"
            description="Thay đổi ảnh đại diện của bạn"
            isEditing={editingSection === 'avatar'}
            isLoading={uploadAvatarMutation.isPending}
            isDisabled={isEditing && editingSection !== 'avatar'}
            onEdit={() => setEditingSection('avatar')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const button = document.querySelector('[data-section="avatar"] button[type="submit"]') as HTMLButtonElement;
              if (button) button.click();
            }}
          >
            {/* THAY ĐỔI Ở ĐÂY: Đổi <form> thành <div> và bỏ onSubmit */}
            <div data-section="avatar">
              <AvatarUploadComponent
                currentAvatar={displayProfile.avatar}
                onSubmit={uploadAvatarMutation.mutateAsync}
                isLoading={uploadAvatarMutation.isPending}
              />
              {/* Đã xóa <button type="submit" className="hidden" /> ở đây vì không cần thiết nữa */}
            </div>
            {successMessages.avatar && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.avatar}
              </div>
            )}
          </SectionCard>

          {/* Change Password Section */}
          <SectionCard
            title="Thay Đổi Mật Khẩu"
            description="Cập nhật mật khẩu đăng nhập của bạn"
            isEditing={editingSection === 'password'}
            isLoading={changePasswordMutation.isPending}
            isDisabled={isEditing && editingSection !== 'password'}
            onEdit={() => setEditingSection('password')}
            onCancel={() => setEditingSection(null)}
            onSave={() => {
              const form = document.querySelector('[data-section="password"] form') as HTMLFormElement;
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
          >
            <div data-section="password">
              <ChangePasswordForm
                onSubmit={changePasswordMutation.mutateAsync}
                isLoading={changePasswordMutation.isPending}
              />
            </div>
            {successMessages.password && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                {successMessages.password}
              </div>
            )}
          </SectionCard>


          {/* Staff Management Section đã bị ẩn theo yêu cầu */}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;