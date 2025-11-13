import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn('Ошибка при разборе user из localStorage:', err);
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };
const refreshAccessToken = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken || !refreshToken) throw new Error('Нет токенов');

    console.log('[Auth] Попытка обновить токен...');

    const response = await axios.post(
      'https://api.dustipharma.tj:1212/api/v1/app/auth/refresh-token',
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.payload || {};
    if (!newAccessToken) throw new Error('Сервер не вернул новый токен');

    setToken(newAccessToken);
    localStorage.setItem('accessToken', newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    console.log('[Auth] Токен успешно обновлён:', newAccessToken);
    if (newRefreshToken) {
      console.log('[Auth] Новый refreshToken:', newRefreshToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error('[Auth] Ошибка обновления токена:', error);
    logout();
    throw error;
  }
};

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.warn('[Auth] 401 — пробуем обновить токен...');
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            console.log('[Auth] Повторный запрос с новым токеном');
            return axios(originalRequest);
          } catch (err) {
            console.error('[Auth] Не удалось обновить токен, выполняем logout');
            logout();
          }
        }


        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
