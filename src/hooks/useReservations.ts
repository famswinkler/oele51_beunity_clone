import { create } from 'zustand';
import apiClient from '../utils/api/client';

interface Reservation {
  id: number;
  room_type: string;
  user_id: number;
  start_time: string;
  end_time: string;
  google_event_id?: string;
  notes?: string;
  created_at: string;
  username: string;
  full_name?: string;
}

interface ReservationState {
  reservations: Reservation[];
  userReservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  fetchReservations: (roomType: string, startDate: string, endDate: string) => Promise<void>;
  fetchUserReservations: () => Promise<void>;
  createReservation: (roomType: string, startTime: string, endTime: string, notes?: string) => Promise<void>;
  updateReservation: (id: number, startTime: string, endTime: string, notes?: string) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useReservations = create<ReservationState>((set) => ({
  reservations: [],
  userReservations: [],
  isLoading: false,
  error: null,

  fetchReservations: async (roomType: string, startDate: string, endDate: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/rooms', {
        params: { roomType, startDate, endDate },
      });
      set({ reservations: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Abrufen der Reservierungen';
      set({ error: message, isLoading: false });
    }
  },

  fetchUserReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/rooms/my-reservations');
      set({ userReservations: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Fehler beim Abrufen der Reservierungen';
      set({ error: message, isLoading: false });
    }
  },

  createReservation: async (roomType: string, startTime: string, endTime: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/rooms', {
        roomType,
        startTime,
        endTime,
        notes,
      });
      set((state) => ({
        userReservations: [...state.userReservations, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Reservierung konnte nicht erstellt werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateReservation: async (id: number, startTime: string, endTime: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/rooms/${id}`, {
        startTime,
        endTime,
        notes,
      });
      set((state) => ({
        userReservations: state.userReservations.map((r) => (r.id === id ? response.data : r)),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Reservierung konnte nicht aktualisiert werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteReservation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/rooms/${id}`);
      set((state) => ({
        userReservations: state.userReservations.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Reservierung konnte nicht gelöscht werden';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
