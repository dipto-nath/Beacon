'use client';

import { useState, useEffect, useRef } from 'react';
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
  // Track the current token to detect stale responses
  const currentTokenRef = useRef<string | null>(null);
  // Track the verification request to allow cancellation
  const verificationAbortRef = useRef<AbortController | null>(null);

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
    
    // Create new abort controller for this verification
    const abortController = new AbortController();
    verificationAbortRef.current = abortController;
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Store the token we're verifying against
    currentTokenRef.current = token;
    
    if (!token || !userData) {
      return;
    }

    const verifyAuth = async () => {
      try {
        const meResponse = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          // Pass abort signal for cancellation
          signal: abortController.signal,
        });
        
        // Check if the token still matches the current token (not stale)
        if (currentTokenRef.current !== token) {
          // Token has changed - this is a stale response, ignore it
          return;
        }
        
        const serverUser = meResponse.data;
        localStorage.setItem('user', JSON.stringify(serverUser));
        setUser(serverUser);
      } catch (error: any) {
        // Check if the token still matches (ignore stale responses)
        if (currentTokenRef.current !== token) {
          return;
        }
        
        // Only clear auth on explicit 401 - don't clear on network errors or abort
        if (error.response?.status === 401 && !abortController.signal.aborted) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
        // For other errors (network, 500, abort), keep using cached user
      }
    };

    verifyAuth();

    // Cleanup: cancel pending verification
    return () => {
      abortController.abort();
      verificationAbortRef.current = null;
    };
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
    // Cancel any pending verification
    if (verificationAbortRef.current) {
      verificationAbortRef.current.abort();
    }
    // Clear the current token ref to invalidate any in-flight requests
    currentTokenRef.current = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return { user, login, logout, mounted };
}
