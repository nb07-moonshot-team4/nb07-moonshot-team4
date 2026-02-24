import * as Axios from 'axios';
import { getAccessToken, refreshTokens } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const axios = Axios.default.create({
  baseURL: BASE_URL,
});

axios.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
   
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/refresh') && !originalRequest._retry) {
      console.log("리프레시 토큰이 만료되었습니다. 로그아웃합니다.");
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      
      
      await refreshTokens();
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);
