import { create } from 'zustand';
import apiClient from '../utils/api/client';

interface WashingSlot {
  id: number;
  floor: number;
  user_id: number;
  start_time: string;
  end_time: string;
  google_event_id?: string;
  notes?: string;
  created_at: string;
  username: string;
  full_name?: string;
}

interface WashingState {
  slots: WashingSlot[];
  userSlots: WashingSlot[];
  isLoading: boolean;
  error: string | null;
  fetchSlots: (floor: number, startDate: string, endDate: string) => Promise<void>;
  fetchUserSlots: () => Promise<void>;
  createSlot: (floor: number, startTime: string, endTime: string, notes?: string) => Promise<void>;
  updateSlot: (id: number, startTime: string, endTime: string, notes?: string) => Promise<void>;
  deleteSlot: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useWashingSlots = create<WashingState>((set) => ({
  slots: [],
  userSlots: [],
  isLoading: false,
  error: null,

  fetchSlots: async (floor: number, startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/washing', {
        params: { floor, startDate, endDate },
      });
      set({ slots: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Abrufen der Zeitslots';
      set({ error: message, isLoading: false });
    }
  },

  fetchUserSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/washing/my-slots');
      set({ userSlots: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Abrufen der Zeitslots';
      set({ error: message, isLoading: false });
    }
  },

  createSlot: async (floor: number, startTime: string, endTime: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/washing', {
        floor,
        startTime,
        endTime,
        notes,
      });
      set((state) => ({
        userSlots: [...state.userSlots, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Zeitslot konnte nicht erstellt werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateSlot: async (id: number, startTime: string, endTime: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/washing/${id}`, {
        startTime,
        endTime,
        notes,
      });
      set((state) => ({
        userSlots: state.userSlots.map((s) => (s.id === id ? response.data : s)),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Zeitslot konnte nicht aktualisiert werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteSlot: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/washing/${id}`);
      set((state) => ({
        userSlots: state.userSlots.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Zeitslot konnte nicht gelöscht werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
