import { describe, it, expect } from 'vitest';
import {
  getCalendarDays,
  formatDate,
  getMonthName,
  getWeekdayNames,
  parseDate,
  formatDateJapanese,
} from '../calendar-utils';

describe('calendar-utils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 11, 25); // December 25, 2025
      expect(formatDate(date)).toBe('2025-12-25');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      expect(formatDate(date)).toBe('2025-01-05');
    });
  });

  describe('getMonthName', () => {
    it('should return correct Japanese month name', () => {
      expect(getMonthName(0)).toBe('1月');
      expect(getMonthName(11)).toBe('12月');
      expect(getMonthName(5)).toBe('6月');
    });
  });

  describe('getWeekdayNames', () => {
    it('should return Japanese weekday names starting with Sunday', () => {
      const weekdays = getWeekdayNames();
      expect(weekdays).toEqual(['日', '月', '火', '水', '木', '金', '土']);
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const date = parseDate('2025-12-25');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // 0-indexed
      expect(date.getDate()).toBe(25);
    });
  });

  describe('formatDateJapanese', () => {
    it('should format date in Japanese with weekday', () => {
      const result = formatDateJapanese('2025-12-25');
      expect(result).toBe('2025年12月25日（木）');
    });
  });

  describe('getCalendarDays', () => {
    it('should return 42 days (6 weeks)', () => {
      const days = getCalendarDays(2025, 11); // December 2025
      expect(days.length).toBe(42);
    });

    it('should include days from current month', () => {
      const days = getCalendarDays(2025, 11); // December 2025
      const currentMonthDays = days.filter(d => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(31); // December has 31 days
    });

    it('should mark today correctly', () => {
      const today = new Date();
      const days = getCalendarDays(today.getFullYear(), today.getMonth());
      const todayDay = days.find(d => d.isToday);
      expect(todayDay).toBeDefined();
      expect(todayDay?.day).toBe(today.getDate());
    });

    it('should have correct dateString format', () => {
      const days = getCalendarDays(2025, 11);
      const dec25 = days.find(d => d.isCurrentMonth && d.day === 25);
      expect(dec25?.dateString).toBe('2025-12-25');
    });
  });
});
