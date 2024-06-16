import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/',
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  
  if (session) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        const response = await axios.post('/api/auth/refresh', {
          refreshToken: session.refreshToken,
        });

        session.accessToken = response.data.accessToken;
        session.refreshToken = response.data.refreshToken;

        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await signOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
