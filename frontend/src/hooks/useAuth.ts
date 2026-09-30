'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string = 'password123') => {
    try {
      const response = await api.post('/auth/login', {
        username: email, // FastAPI OAuth2PasswordRequestForm uses 'username'
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const data = response.data;
      localStorage.setItem('token', data.access_token);
      
      // we need to get user info, since login just gives token
      // I will hit a mock endpoint or user info endpoint
      const meResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${data.access_token}`
        }
      });
      localStorage.setItem('user', JSON.stringify(meResponse.data));
      setUser(meResponse.data);
      router.push('/');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return { user, login, logout, loading };
}
