import { format, parse, addDays, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy', { locale: de });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: de });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd.MM.yyyy HH:mm', { locale: de });
};

export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'dd.MM.yyyy', new Date());
};

export const getMonthDays = (date: Date): Date[] => {
  const start = startOfDay(date);
  const days: Date[] = [];
  for (let i = 0; i < 30; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
};
