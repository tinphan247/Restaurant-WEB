import axios from 'axios';
import { verifyTokenOwnership } from '../../../utils/tokenUtils';

// Helper to get the correct token for guest user actions
const getGuestToken = () => {
  try {
    // 1. Check Explicit 'user' object in localStorage
    const guestUserStr = localStorage.getItem('user');
    if (guestUserStr) {
      const guestUser = JSON.parse(guestUserStr);
      const role = guestUser.role?.toUpperCase();

      // STRICT MODE: Only return token if role is explicitly USER or purely Guest
      if (role === 'USER') {
        const token = localStorage.getItem('access_token_USER');
        if (token) {
          // KEY FIX: Verify that this token actually belongs to the user
          // specific case: 'access_token_USER' might actually contain an ADMIN token from a previous session
          const isValid = verifyTokenOwnership(token, guestUser.id);

          if (isValid) {
            return token;
          } else {
            localStorage.removeItem('access_token_USER');
            // STOP HERE: Do not fall back to GUEST token if we are supposed to be a legitimate USER.
            // If the USER token is bad, we are unauthenticated.
            return null;
          }
        } else {
          // If we are USER but have no token, do not try to use GUEST token.
          // It might be a leftover Admin token in the GUEST slot.
          return null;
        }
      }

      // Note: If role is KITCHEN/ADMIN/etc, we DO NOT return their token for Guest APIs.
      // They should not be using Guest Profile Update.
      if (role !== 'GUEST') {
        // If we are ADMIN/WAITER/etc, explicitly return NULL for guest-menu APIs 
        // to prevents accidental cross-role modification.
        return null;
      }
    }
  } catch (e) {
    // Error parsing user
  }

  // 2. Default/Fallback: Always prefer the Anonymous Guest Token if no specific USER is active
  const guestToken = localStorage.getItem('access_token_GUEST');
  if (guestToken) {
    return guestToken;
  }

  return null;
};

export const userProfileApi = {
  getProfile: () => {
    const token = getGuestToken();
    return axios.get('/api/user/profile', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
  updateProfile: async (data: { fullName: string; displayName?: string }) => {
    const token = getGuestToken();

    try {
      const response = await axios.put('/api/user/profile', data, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return response;
    } catch (error) {
      console.error('[userProfileApi] updateProfile - Error:', error);
      throw error;
    }
  },
  changePassword: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => {
    const token = getGuestToken();
    return axios.post('/api/user/change-password', data, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
  },
  changeEmail: (data: { newEmail: string; password: string }) => {
    const token = getGuestToken();
    return axios.post('/api/user/change-email', data, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
  },
  uploadAvatar: (file: File) => {
    const token = getGuestToken();
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post('/api/user/profile/avatar', formData, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    }).then(res => res.data);
  },
};
