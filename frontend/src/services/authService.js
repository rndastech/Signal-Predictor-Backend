import { authAPI } from './api';

const authService = {
  register: async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    return response.data;
  },
  logout: async () => {
    const response = await authAPI.logout();
    return response.data;
  },
  verifyEmail: async (uid, token) => {
    const response = await authAPI.verifyEmail(uid, token);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await authAPI.getCurrentUser();
    return response.data;
  },
};

export default authService;
