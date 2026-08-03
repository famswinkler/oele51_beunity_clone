import { create } from 'zustand';
import apiClient from '../utils/api/client';

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  floor?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName: string, floor: number) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Anmeldung fehlgeschlagen';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, fullName: string, floor: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password,
        fullName,
        floor,
      });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registrierung fehlgeschlagen';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  loadUser: () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        set({ user: JSON.parse(storedUser) });
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
  },
}));
