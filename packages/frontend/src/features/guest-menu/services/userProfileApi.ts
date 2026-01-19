import axios from 'axios';

export const userProfileApi = {
  getProfile: () => {
    const token = localStorage.getItem('access_token_GUEST') || localStorage.getItem('access_token_USER');
    return axios.get('/api/user/profile', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
  updateProfile: (data: { fullName: string; displayName?: string }) => {
    const token = localStorage.getItem('access_token_GUEST') || localStorage.getItem('access_token_USER');
    return axios.put('/api/user/profile', data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
  changePassword: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => axios.post('/api/user/change-password', data),
  changeEmail: (data: { newEmail: string; password: string }) => axios.post('/api/user/change-email', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post('/api/user/profile/avatar', formData);
  },
};
