'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type UserRole = 'student' | 'counselor' | 'wellbeing_admin' | 'admin';

interface UseAuthOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requireAuth = false, allowedRoles, redirectTo = '/login' } = options;
  
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Initialize user from localStorage after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Verify token with backend in background (non-blocking)
  useEffect(() => {
    if (!mounted) return;
    
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) return;

      try {
        const meResponse = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverUser = meResponse.data;
        localStorage.setItem('user', JSON.stringify(serverUser));
        setUser(serverUser);
      } catch (error: any) {
        // Only clear auth on explicit 401 - don't clear on network errors
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // For other errors (network, 500, etc), keep using cached user
      }
    };

    verifyAuth();
  }, [mounted]);

  // Handle auth redirects after mount
  useEffect(() => {
    if (!mounted) return;
    
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }
    
    if (requireAuth && allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
    }
  }, [mounted, user, requireAuth, allowedRoles, redirectTo, router]);

  const login = async (email: string, password: string = 'password123') => {
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
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
      if (meResponse.data.role === 'counselor' || meResponse.data.role === 'wellbeing_admin' || meResponse.data.role === 'admin') {
        router.push('/staff');
      } else {
        router.push('/');
      }
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

  return { user, login, logout, mounted };
}
